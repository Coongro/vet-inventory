/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { actions, getHostReact, getHostUI, usePlugin, views } from '@coongro/plugin-sdk';

import { useVetInventorySettings } from '../../settings/settings.gen.js';

const React = getHostReact();
const { useState, useEffect, useCallback } = React;
const h = React.createElement;
const UI = getHostUI() as any;

/**
 * Detalle de un insumo (análogo al detalle de lote de perecederos): panel lateral
 * de solo-lectura con el ciclo de stock (ingresos − salidas = disponible), el
 * estado frente al mínimo y el historial de movimientos, más las acciones. Comparte
 * el lenguaje visual del detalle de lote (BatchDetail) para que se lean parejos.
 */

// Neutros = tokens del repo (dark mode). Acentos = paleta del diseño (igual que BatchDetail).
const N = {
  200: 'var(--cg-bg-secondary)',
  300: 'var(--cg-border)',
  500: 'var(--cg-text-muted)',
  700: 'var(--cg-text)',
  950: 'var(--cg-text)',
  white: 'var(--cg-bg)',
};
const PAL = {
  teal: { soft: '#d7f2ec', mid: '#0d9488', deep: '#0f766e' },
  gold: { soft: '#fbeecb', mid: '#d97706', deep: '#b45309' },
  red: { soft: '#fbe3e1', mid: '#dc2626', deep: '#b91c1c' },
};
const FONT_MONO = "'SF Mono', ui-monospace, 'Menlo', monospace";
const EYEBROW: any = {
  fontWeight: 700,
  fontSize: '11px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: N[500],
};
const SECTION_LABEL: any = { ...EYEBROW, fontSize: '10.5px', letterSpacing: '0.06em' };

const CATEGORY: Record<string, { label: string; icon: string }> = {
  jeringas: { label: 'Jeringas y agujas', icon: 'Syringe' },
  curacion: { label: 'Curación', icon: 'Bandage' },
  proteccion: { label: 'Protección', icon: 'Shield' },
  higiene: { label: 'Higiene y limpieza', icon: 'SprayCan' },
  otros: { label: 'Otros', icon: 'Package' },
};
const UNIT_ICON: Record<string, string> = {
  unidad: 'Hash',
  caja: 'Box',
  par: 'Layers2',
  rollo: 'Scroll',
  blíster: 'Grid3x3',
  frasco: 'FlaskConical',
  ml: 'Droplet',
  l: 'Droplets',
  g: 'Scale',
  kg: 'Weight',
  m: 'Ruler',
};

interface MovementRow {
  id: string;
  type: string;
  quantity: string | number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

// Humaniza el origen de un movimiento. Las compras (reference_type 'salida') SÍ traen
// una referencia navegable a la compra hoy; las salidas por consumo automático la
// traerán cuando exista ese flujo (paciente/vacuna) — ver pendiente en workspace.
const REF_LABEL: Record<string, string> = {
  salida: 'Compra a proveedor',
  insumo_initial: 'Carga inicial',
  insumo_baja: 'Baja de stock',
  batch_in: 'Ingreso',
  adjustment: 'Ajuste',
};
function refLabel(m: MovementRow): string {
  if (m.reference_type && REF_LABEL[m.reference_type]) return REF_LABEL[m.reference_type];
  return (Number(m.quantity) || 0) < 0 ? 'Salida de stock' : 'Ingreso de stock';
}
/** Destino navegable de un movimiento (hoy: la compra que lo originó). */
function movNav(m: MovementRow): { viewId: string; params: Record<string, unknown> } | null {
  if (m.reference_type === 'salida' && m.reference_id)
    return { viewId: 'purchases.salidas.open', params: { accountId: m.reference_id } };
  return null;
}
interface Balance {
  totalIn: number;
  totalOut: number;
  balance: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-AR');
}

export function InsumoDetalleView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { settings } = useVetInventorySettings();
  const record = ((views.params as any)?.record ?? null) as Record<string, any> | null;
  const productId = record?.id ? String(record.id) : null;

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [movs, bal] = await Promise.all([
        actions.execute<MovementRow[]>('products.stock.listByProduct', { productId }),
        actions.execute<Balance>('products.stock.getBalance', { productId }),
      ]);
      setMovements(Array.isArray(movs) ? movs : []);
      setBalance(bal ?? null);
    } catch {
      setMovements([]);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);
  useEffect(() => {
    void load();
  }, [load]);

  const stock = balance ? balance.balance : Number(record?.stock_current) || 0;
  const ingresos = balance ? balance.totalIn : 0;
  const salidas = balance ? Math.abs(balance.totalOut) : 0;
  const ownMin = Number(record?.stock_minimum) || 0;
  const min =
    ownMin > 0 ? ownMin : settings.insumosDefaultMinimum > 0 ? settings.insumosDefaultMinimum : 0;
  const low = min > 0 && stock < min;

  // Tono del disponible/barra: rojo si sin stock, ámbar si bajo mínimo, teal si sano.
  const tone =
    stock <= 0
      ? { fill: PAL.red.mid, num: PAL.red.deep, dot: PAL.red.mid }
      : low
        ? { fill: PAL.gold.mid, num: PAL.gold.deep, dot: PAL.gold.deep }
        : { fill: PAL.teal.mid, num: PAL.teal.deep, dot: PAL.teal.deep };
  const pct =
    ingresos > 0
      ? Math.max(stock > 0 ? 3 : 0, Math.min(100, (stock / ingresos) * 100))
      : stock > 0
        ? 100
        : 0;

  const cat = record?.category ? CATEGORY[String(record.category)] : undefined;
  const unitIcon = record?.unit ? UNIT_ICON[String(record.unit)] : undefined;

  const openAction = (viewId: string) => {
    closeDialog();
    setTimeout(() => views.open(viewId, { record }, { mode: 'dialog' }), 0);
  };

  const sectionHead = (text: string, note?: string) =>
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        },
      },
      h('span', { style: SECTION_LABEL }, text),
      note ? h('span', { style: { fontSize: '11.5px', color: N[500] } }, note) : null
    );

  const cycleStat = (num: string, cap: string, accent?: string) =>
    h(
      'div',
      { style: { flex: 1, textAlign: 'center' as const } },
      h(
        'div',
        {
          style: {
            fontSize: '30px',
            fontWeight: 600,
            letterSpacing: '-1.4px',
            lineHeight: 1,
            color: accent ?? N[950],
          },
        },
        num
      ),
      h(
        'div',
        { style: { ...SECTION_LABEL, fontSize: '11px', fontWeight: 500, marginTop: '7px' } },
        cap
      )
    );
  const cycleOp = (op: string) =>
    h(
      'span',
      { style: { fontFamily: FONT_MONO, fontSize: '18px', color: N[300], paddingBottom: '18px' } },
      op
    );

  const sectionStyle = (last?: boolean): any => ({
    padding: '20px 0',
    borderBottom: last ? 'none' : `0.5px dashed ${N[300]}`,
  });

  const movRow = (m: MovementRow, isLast: boolean) => {
    const qty = Number(m.quantity) || 0;
    const isOut = qty < 0;
    const nav = movNav(m);
    const node = isOut
      ? { icon: 'ArrowDownRight', bg: PAL.red.soft, fg: PAL.red.deep }
      : { icon: 'ArrowDownToLine', bg: PAL.teal.soft, fg: PAL.teal.deep };
    return h(
      'div',
      {
        key: m.id,
        onClick: nav
          ? () => {
              closeDialog();
              setTimeout(() => views.open(nav.viewId, nav.params), 0);
            }
          : undefined,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 0',
          borderBottom: isLast ? 'none' : `0.5px solid ${N[200]}`,
          cursor: nav ? 'pointer' : 'default',
        },
      },
      h(
        'span',
        {
          style: {
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            flexShrink: 0,
            background: node.bg,
            color: node.fg,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        h(UI.DynamicIcon, { icon: node.icon, size: 16 })
      ),
      h(
        'div',
        { style: { minWidth: 0, flex: 1 } },
        h(
          'div',
          { style: { fontSize: '13.5px', fontWeight: 500, color: N[950] } },
          m.notes || refLabel(m)
        ),
        h(
          'div',
          { style: { fontSize: '11.5px', color: N[500], marginTop: '2px' } },
          `${refLabel(m)} · ${formatDate(m.created_at)}`
        )
      ),
      h(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 } },
        h(
          'span',
          {
            style: {
              fontFamily: FONT_MONO,
              fontWeight: 600,
              fontSize: '14px',
              color: isOut ? PAL.red.deep : PAL.teal.deep,
            },
          },
          (qty > 0 ? '+' : '') + qty
        ),
        nav ? h(UI.DynamicIcon, { icon: 'ChevronRight', size: 15, style: { color: N[500] } }) : null
      )
    );
  };

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const, height: '100%' } },

    // Cuerpo scrolleable
    h(
      'div',
      { style: { flex: 1, overflowY: 'auto' as const, padding: '20px 22px' } },

      // ── Header ──
      h(
        'div',
        { style: { paddingBottom: '4px' } },
        h('div', { style: EYEBROW }, cat?.label ?? 'Insumo'),
        h(
          'div',
          {
            style: {
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '-0.5px',
              color: N[950],
              margin: '5px 0 0',
              lineHeight: 1.1,
            },
          },
          String(record?.name ?? 'Insumo')
        ),
        h(
          'div',
          { style: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '14px' } },
          // Píldoras de categoría/unidad: mismo componente y variante que la tabla (Badge outline).
          cat
            ? h(
                UI.Badge,
                { variant: 'outline', icon: h(UI.DynamicIcon, { icon: cat.icon, size: 16 }) },
                cat.label
              )
            : null,
          record?.unit
            ? h(
                UI.Badge,
                {
                  variant: 'outline',
                  icon: unitIcon ? h(UI.DynamicIcon, { icon: unitIcon, size: 16 }) : undefined,
                },
                String(record.unit)
              )
            : null,
          low
            ? h(
                UI.Badge,
                {
                  variant: 'warning-soft',
                  icon: h(UI.DynamicIcon, { icon: 'TriangleAlert', size: 12 }),
                },
                'Bajo mínimo'
              )
            : stock > 0
              ? h(UI.Badge, { variant: 'success-soft' }, 'En stock')
              : h(UI.Badge, { variant: 'secondary' }, 'Sin stock')
        )
      ),

      // ── Ciclo de stock ──
      h(
        'div',
        { style: sectionStyle() },
        sectionHead('Ciclo de stock', min > 0 ? `mínimo ${min}` : undefined),
        h(
          'div',
          {
            style: {
              border: `0.5px solid ${N[300]}`,
              borderRadius: '14px',
              padding: '18px',
              background: N.white,
            },
          },
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
            cycleStat(String(ingresos), 'Ingresos'),
            cycleOp('−'),
            cycleStat(String(salidas), 'Salidas'),
            cycleOp('='),
            cycleStat(String(stock), 'Disponible', tone.num)
          ),
          h(
            'div',
            { style: { marginTop: '20px' } },
            h(
              'div',
              {
                style: {
                  height: '10px',
                  borderRadius: '999px',
                  background: N[200],
                  overflow: 'hidden',
                },
              },
              h('div', {
                style: {
                  height: '100%',
                  borderRadius: '999px',
                  width: `${pct}%`,
                  background: tone.fill,
                  transition: 'width .32s',
                },
              })
            ),
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '9px',
                },
              },
              h(
                'span',
                {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: tone.dot,
                  },
                },
                h('span', {
                  style: { width: '6px', height: '6px', borderRadius: '50%', background: tone.dot },
                }),
                `${stock} disponibles`
              ),
              record?.purchase_price
                ? h(
                    'span',
                    { style: { fontSize: '12px', color: N[500] } },
                    `Costo $${Number(record.purchase_price).toLocaleString('es-AR')}`
                  )
                : null
            )
          )
        )
      ),

      // ── Movimientos ──
      h(
        'div',
        { style: sectionStyle(true) },
        sectionHead('Movimientos', movements.length ? `${movements.length}` : undefined),
        loading
          ? h('div', { style: { color: N[500], fontSize: '13px' } }, 'Cargando…')
          : movements.length === 0
            ? h(
                'div',
                { style: { color: N[500], fontSize: '13px' } },
                'Sin movimientos registrados.'
              )
            : h('div', null, ...movements.map((m, i) => movRow(m, i === movements.length - 1)))
      )
    ),

    // ── Footer ──
    h(
      'div',
      {
        style: {
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '14px 22px',
          borderTop: `0.5px solid ${N[300]}`,
        },
      },
      h(
        UI.Button,
        {
          variant: 'outline',
          className: 'text-cg-danger hover:bg-cg-danger-bg',
          onClick: () => openAction('vet-inventory.ajustar-stock.open'),
        },
        h(UI.DynamicIcon, { icon: 'Ban', size: 14, className: 'mr-1' }),
        'Dar de baja'
      ),
      h(UI.Button, { onClick: () => openAction('vet-inventory.editar-insumo.open') }, 'Editar')
    )
  );
}
