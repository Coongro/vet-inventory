/**
 * Ingreso manual — composición y render.
 *
 * Suma stock a un INSUMO YA EXISTENTE (selector, no alta) — mismo patrón que el
 * ingreso manual de lote de perecederos: elegís el producto y cargás cantidad.
 *
 * NOTA: ver use-ingreso-manual.ts — el campo "Insumo" se hizo a mano (UI.Combobox)
 * porque el codegen del Builder para fieldType "ref" en un form standalone deja
 * `refOptions`/`refLabel` sin definir (gap reportado en agent-workspace/pendientes/).
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { useIngresoManualView } from './use-ingreso-manual.js';

const React = getHostReact();
const h = React.createElement;
const UI = getHostUI() as any;

export function IngresoManualView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, submit, insumos } = useIngresoManualView();

  const selected = insumos.find((i: any) => i.id === values['product_id']);

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const } },
    h(
      'div',
      {
        style: { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      },

      // Sección "Insumo": cuál (ya existente) recibe el stock.
      h(
        UI.FormSection,
        { icon: 'Package', title: 'Insumo' },
        h(
          'div',
          { style: { padding: '24px' } },
          h(
            'div',
            null,
            h(
              UI.Label,
              { htmlFor: 'product_id', style: { display: 'block', marginBottom: '6px' } },
              'Insumo',
              h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
            ),
            h(
              UI.Combobox,
              {
                value: values['product_id'] ?? '',
                onValueChange: (v: string) => setField('product_id', v),
              },
              h(UI.ComboboxChipTrigger, {
                placeholder: 'Buscar insumo…',
                renderChip: (val: string, onRemove: () => void) =>
                  h(
                    UI.Chip,
                    { size: 'sm', onRemove },
                    insumos.find((i: any) => i.id === val)?.name ?? val
                  ),
              }),
              h(
                UI.ComboboxContent,
                null,
                ...insumos.map((i: any) => h(UI.ComboboxItem, { key: i.id, value: i.id }, i.name))
              )
            ),
            selected?.unit
              ? h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '6px' } },
                  'Unidad: ',
                  h('strong', { style: { color: 'var(--cg-text)' } }, selected.unit)
                )
              : null,
            errors['product_id']
              ? h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                  errors['product_id']
                )
              : null
          )
        )
      ),

      // Sección "Stock": cuánto entra y a qué costo.
      h(
        UI.FormSection,
        { icon: 'Boxes', title: 'Stock' },
        h(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column' as const,
              gap: '16px',
              padding: '24px',
            },
          },
          h(
            'div',
            { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
            h(
              'div',
              { style: { flex: '1 1 260px', minWidth: 0 } },
              h(
                UI.Label,
                { htmlFor: 'quantity', style: { display: 'block', marginBottom: '6px' } },
                'Cantidad',
                h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
              ),
              h(UI.Input, {
                id: 'quantity',
                type: 'number',
                value: values['quantity'] ?? '',
                placeholder: 'Ej: 20',
                onChange: (e: any) =>
                  setField('quantity', e.target.value === '' ? null : Number(e.target.value)),
              }),
              errors['quantity']
                ? h(
                    'div',
                    { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                    errors['quantity']
                  )
                : null
            ),
            h(
              'div',
              { style: { flex: '1 1 260px', minWidth: 0 } },
              h(
                UI.Label,
                { htmlFor: 'purchase_price', style: { display: 'block', marginBottom: '6px' } },
                'Costo unitario'
              ),
              h(UI.Input, {
                id: 'purchase_price',
                type: 'number',
                value: values['purchase_price'] ?? '',
                placeholder: 'Opcional',
                onChange: (e: any) =>
                  setField('purchase_price', e.target.value === '' ? null : Number(e.target.value)),
              })
            )
          ),
          h(
            'div',
            null,
            h(
              UI.Label,
              { htmlFor: 'notes', style: { display: 'block', marginBottom: '6px' } },
              'Notas'
            ),
            h(UI.Input, {
              id: 'notes',
              type: 'text',
              value: values['notes'] ?? '',
              placeholder: 'Opcional · ej: donación, ajuste de conteo',
              onChange: (e: any) => setField('notes', e.target.value),
            })
          )
        )
      )
    ),
    h(
      UI.DialogFooter,
      null,
      h(UI.Button, { variant: 'ghost', onClick: () => closeDialog() }, 'Cancelar'),
      h(UI.Button, { onClick: () => void submit() }, 'Guardar')
    )
  );
}
