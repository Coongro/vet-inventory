/**
 * Insumos — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, useIsMobile, views } from '@coongro/plugin-sdk';

import { useVetInventorySettings } from '../../settings/settings.gen.js';

import { useInsumosView } from './use-insumos.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function InsumosView(props: { embedded?: boolean } = {}) {
  const embedded = props.embedded ?? false;
  const isMobile = useIsMobile();
  // Mínimo global por defecto (setting del plugin): fallback para insumos sin mínimo propio.
  const { settings } = useVetInventorySettings();
  const defaultMinimum = settings.insumosDefaultMinimum;
  const {
    loading,
    COLUMNS,
    visibleRows,
    sort,
    onSortChange,
    cellValue,
    search,
    setSearch,
    clearFilters,
    page,
    setPage,
    pagedRows,
  } = useInsumosView();

  const cellText = (row: any, c: any) => {
    const v = cellValue(row, c);
    return v === null || v === undefined
      ? ''
      : typeof v === 'object'
        ? JSON.stringify(v)
        : String(v);
  };
  const TONE_VARIANT: Record<string, string> = {
    neutral: 'secondary',
    success: 'success-soft',
    warning: 'warning-soft',
    danger: 'danger-soft',
    outline: 'outline',
  };
  const enumVal = (c: any, raw: string) => (c.values ?? []).find((e: any) => e.value === raw);
  const formatMoney = (raw: string) => {
    const n = Number(raw);
    return isNaN(n) ? raw : '$' + n.toLocaleString('es-AR');
  };
  const renderCell = (row: any, c: any) => {
    const raw = cellText(row, c);
    const ev = enumVal(c, raw);
    const label = c.format === 'money' ? formatMoney(raw) : (ev?.label ?? raw);
    const shown = raw !== '' ? (c.prefix ?? '') + label + (c.suffix ?? '') : label;
    if (c.display === 'avatar') {
      const initial = (String(raw).trim().charAt(0) || '?').toUpperCase();
      return h(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 } },
        h(
          'span',
          {
            style: {
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--cg-gold-soft)',
              border: '1px solid var(--cg-gold-lt)',
              color: 'var(--cg-gold-deep)',
              fontWeight: 700,
              fontSize: '11px',
            },
          },
          initial
        ),
        h('span', null, shown)
      );
    }
    const iconName = ev?.icon;
    const icon = iconName ? h(UI.DynamicIcon, { icon: iconName, size: 16 }) : null;
    if (c.display === 'pill') {
      return label
        ? h(
            UI.Badge,
            { variant: TONE_VARIANT[ev?.tone ?? c.tone ?? 'neutral'] ?? 'secondary', icon },
            label
          )
        : '';
    }
    if (c.display === 'progress') {
      const n = Math.max(0, Math.min(100, Number(cellValue(row, c)) || 0));
      return h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px' } },
        h(
          'div',
          {
            style: {
              flex: '1 1 0',
              height: '6px',
              borderRadius: '999px',
              background: 'var(--cg-bg-secondary)',
              overflow: 'hidden',
            },
          },
          h('div', {
            style: {
              width: n + '%',
              height: '100%',
              borderRadius: '999px',
              background: 'var(--cg-gold)',
            },
          })
        ),
        h(
          'span',
          { style: { fontSize: '12px', color: 'var(--cg-text-muted)' } },
          Math.round(n) + '%'
        )
      );
    }
    if (c.display === 'mono') {
      const mono = h(
        'span',
        { style: { fontFamily: 'ui-monospace, monospace', fontSize: '12px' } },
        shown
      );
      // Stock por debajo del mínimo → badge de aviso (el mínimo viene del modelo de products).
      if (c.key === 'stock_current') {
        const current = Number(cellValue(row, c));
        const min = Number(row?.stock_minimum);
        const low = Number.isFinite(current) && Number.isFinite(min) && min > 0 && current < min;
        if (low)
          return h(
            'span',
            { style: { display: 'inline-flex', alignItems: 'center', gap: '8px' } },
            mono,
            h(
              UI.Badge,
              {
                variant: 'warning-soft',
                icon: h(UI.DynamicIcon, { icon: 'TriangleAlert', size: 12 }),
              },
              'Bajo mínimo'
            )
          );
      }
      return mono;
    }
    return icon
      ? h(
          'span',
          { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
          icon,
          shown
        )
      : shown;
  };
  const colBy = (k: string) => COLUMNS.find((c: any) => c.key === k);

  /**
   * Celda "Disponible" de la sección STOCK: número + barra de salud contra el mínimo.
   * Los insumos no tienen "recibido" ni máximo (stock simple), así que la única
   * referencia es el mínimo: verde holgado, ámbar cerca del mínimo, rojo por debajo.
   * Sin mínimo cargado no hay contra qué llenar → solo el número.
   */
  const renderDisponible = (row: any) => {
    const stock = Number(row?.stock_current) || 0;
    // Mínimo efectivo: el propio del insumo si tiene, si no el global por defecto.
    const ownMin = Number(row?.stock_minimum) || 0;
    const min = ownMin > 0 ? ownMin : defaultMinimum > 0 ? defaultMinimum : 0;
    const low = min > 0 && stock < min;
    const ratio = min > 0 ? Math.max(0, Math.min(1, stock / (min * 2))) : 1;
    const pct = Math.max(4, Math.round(ratio * 100));
    const barColor =
      min <= 0
        ? 'var(--cg-border)'
        : ratio <= 0.34
          ? 'var(--cg-danger, #c0392b)'
          : ratio <= 0.66
            ? 'var(--cg-warning, #d97706)'
            : 'var(--cg-success, #16a34a)';
    return h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' } },
      h(
        'span',
        {
          style: {
            fontFamily: 'ui-monospace, monospace',
            fontSize: '12px',
            color: low ? 'var(--cg-danger, #c0392b)' : undefined,
          },
        },
        String(stock)
      ),
      min > 0
        ? h(
            'div',
            {
              style: {
                width: '56px',
                height: '5px',
                borderRadius: '3px',
                background: 'var(--cg-border)',
                overflow: 'hidden',
              },
            },
            h('div', { style: { width: pct + '%', height: '100%', background: barColor } })
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
        : null
    );
  };

  // Columna de acciones: mismo botón (outline + ícono) que la tabla de perecederos.
  const accionesColumn = {
    key: 'acciones',
    header: '',
    className: 'text-right',
    // El wrapper corta la propagación para no disparar el onRowClick (editar).
    render: (row: any) =>
      h(
        'div',
        { onClick: (e: any) => e.stopPropagation() },
        h(
          UI.Button,
          {
            variant: 'outline',
            size: 'xs',
            className: 'text-cg-danger hover:bg-cg-danger-bg',
            onClick: () => {
              views.open('vet-inventory.ajustar-stock.open', { record: row }, { mode: 'dialog' });
            },
          },
          h(UI.DynamicIcon, { icon: 'Ban', size: 12, className: 'mr-1' }),
          'Dar de baja'
        )
      ),
  };

  // Foco de la tabla según el menú:
  //  - Inventario (embedded) → STOCK: cuánto tengo (nombre, unidad, disponible con barra).
  //  - Menú Insumos (standalone) → CATÁLOGO: qué manejo (nombre, categoría, unidad, costo).
  const dataColumns: any[] = embedded
    ? [
        {
          key: 'name',
          header: 'Insumo',
          sortable: true,
          render: (row: any) => renderCell(row, colBy('name')),
        },
        {
          key: 'category',
          header: 'Categoría',
          sortable: true,
          render: (row: any) => renderCell(row, colBy('category')),
        },
        {
          key: 'unit',
          header: 'Unidad',
          sortable: true,
          render: (row: any) => renderCell(row, colBy('unit')),
        },
        {
          key: 'stock_current',
          header: 'Disponible',
          sortable: true,
          className: 'text-right',
          render: (row: any) => renderDisponible(row),
        },
      ]
    : ['name', 'category', 'unit', 'purchase_price'].map((k) => {
        const c = colBy(k);
        return {
          key: k,
          header: c?.label ?? k,
          sortable: true,
          render: (row: any) => renderCell(row, c),
        };
      });

  const renderTable = () =>
    h(
      'div',
      {
        style: {
          background: 'var(--cg-bg)',
          border: '1px solid var(--cg-border)',
          borderRadius: '14px',
          padding: '20px',
        },
      },
      h(UI.DataTable, {
        data: pagedRows,
        rowKey: (row: any) => String(row.id ?? JSON.stringify(row)),
        loading,
        columns: [...dataColumns, accionesColumn],
        searchPlaceholder: 'Buscar…',
        searchValue: search,
        onSearchChange: setSearch,
        sortKey: sort?.k ?? null,
        sortDirection: sort ? (sort.d > 0 ? 'asc' : 'desc') : null,
        onSortChange,
        pagination: { page, pageSize: 20, total: visibleRows.length },
        onPageChange: setPage,
        onRowClick: (row: any) => {
          // Igual que perecederos: el click abre el DETALLE como panel lateral (sheet).
          views.open('vet-inventory.insumo-detalle.open', { record: row }, { mode: 'sheet' });
        },
        mobileRender: (row: any) =>
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column' as const, gap: '6px' } },
            h(
              'div',
              { style: { fontSize: '14px', fontWeight: 600, color: 'var(--cg-text)' } },
              dataColumns[0].render(row)
            ),
            ...dataColumns.slice(1).map((c: any) =>
              h(
                'div',
                {
                  key: c.key,
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                  },
                },
                h('span', { style: { color: 'var(--cg-text-muted)', flexShrink: 0 } }, c.header),
                h(
                  'span',
                  {
                    style: {
                      textAlign: 'right' as const,
                      minWidth: 0,
                      flex: '1 1 auto',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    },
                  },
                  c.render(row)
                )
              )
            ),
            // Acción de la tarjeta en móvil: mismo botón que en la fila de escritorio.
            h(
              'div',
              { style: { marginTop: '4px' }, onClick: (e: any) => e.stopPropagation() },
              h(
                UI.Button,
                {
                  variant: 'outline',
                  size: 'xs',
                  className: 'text-cg-danger hover:bg-cg-danger-bg',
                  onClick: () => {
                    views.open(
                      'vet-inventory.ajustar-stock.open',
                      { record: row },
                      { mode: 'dialog' }
                    );
                  },
                },
                h(UI.DynamicIcon, { icon: 'Ban', size: 12, className: 'mr-1' }),
                'Dar de baja'
              )
            )
          ),
        onClearFilters: () => {
          clearFilters();
        },
        emptyState: {
          title: 'Todavía no hay registros',
          description: 'Cargá el primero para empezar.',
          filteredTitle: 'Sin resultados',
          filteredDescription: 'Probá con otros términos o ajustá los filtros.',
        },
      })
    );

  // Embebida (sección de stock en Inventario) → "Ingreso manual": suma stock a un
  // insumo YA existente (selector). Standalone (catálogo) → "Nuevo insumo": da de alta
  // un insumo — son acciones distintas, cada una en su lugar.
  const ingresoBtn = embedded
    ? h(
        UI.Button,
        {
          variant: 'default',
          onClick: () => {
            views.open('vet-inventory.ingreso-manual.open', undefined, { mode: 'dialog' });
          },
        },
        'Ingreso manual'
      )
    : h(
        UI.Button,
        {
          variant: 'default',
          onClick: () => {
            views.open('vet-inventory.nuevo-insumo.open', undefined, { mode: 'dialog' });
          },
        },
        'Nuevo insumo'
      );

  // Contenido común (tabla). El header cambia según sea sección embebida o vista propia.
  const body = h(
    'div',
    { style: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '18px' } },
    embedded
      ? // Header de SECCIÓN (dentro de "Inventario"): compacto, sin eyebrow.
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap' as const,
            },
          },
          h(
            'div',
            null,
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              h(UI.DynamicIcon, { icon: 'Package', size: 18, style: { color: 'var(--cg-text)' } }),
              h(
                'span',
                { style: { fontSize: '17px', fontWeight: 700, color: 'var(--cg-text)' } },
                'Insumos'
              ),
              h(
                'span',
                { style: { fontSize: '13px', color: 'var(--cg-text-muted)' } },
                '· stock simple'
              )
            ),
            h(
              'div',
              { style: { fontSize: '13px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
              'Descartables y consumibles que no son vacuna ni medicamento — sin lote, sin vencimiento.'
            )
          ),
          ingresoBtn
        )
      : // Header de VISTA propia (standalone).
        h(
          'div',
          { 'data-cg-block-id': 'ph', style: { display: 'contents' } },
          h(
            'div',
            null,
            h(
              'div',
              {
                style: {
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--cg-gold-deep)',
                  marginBottom: '5px',
                },
              },
              'INVENTARIO'
            ),
            h(UI.PageHeader, {
              title: 'Insumos',
              subtitle:
                'El catálogo de descartables y consumibles — su categoría, unidad y costo. El stock se ve en Inventario.',
              action: ingresoBtn,
            })
          )
        ),
    h('div', { 'data-cg-block-id': 'tbl', style: { display: 'contents' } }, renderTable())
  );

  // Embebida: sin cascarón de pantalla completa — el shell de "Inventario" pone fondo y padding.
  if (embedded) return body;

  return h(
    'div',
    {
      style: {
        minHeight: '100%',
        backgroundColor: 'var(--cg-bg-secondary)',
        padding: isMobile ? '16px' : '24px',
      },
    },
    body
  );
}
