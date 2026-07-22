/**
 * Dar de baja — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { useAjustarStockView } from './use-ajustar-stock.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function AjustarStockView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, submit } = useAjustarStockView();

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const } },
    h(
      'div',
      {
        style: { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      },
      h(
        'div',
        { 'data-cg-block-id': 'card', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Ban', title: 'Baja de stock' },
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '24px',
                alignItems: 'stretch',
              },
            },
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_qty', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'quantity', style: { display: 'block', marginBottom: '6px' } },
                    'Cantidad a dar de baja',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'quantity',
                    type: 'number',
                    value: values['quantity'] ?? '',
                    placeholder: 'Ej: 5',
                    onChange: (e: any) =>
                      setField('quantity', e.target.value === '' ? null : Number(e.target.value)),
                  }),
                  errors['quantity']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['quantity']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_reason', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'reason', style: { display: 'block', marginBottom: '6px' } },
                    'Motivo',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['reason'] ?? ''),
                      onValueChange: (v: string) => setField('reason', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(UI.SelectItem, { key: 'rotura', value: 'rotura' }, 'Rotura'),
                    h(UI.SelectItem, { key: 'vencido', value: 'vencido' }, 'Vencido'),
                    h(UI.SelectItem, { key: 'merma', value: 'merma' }, 'Merma'),
                    h(UI.SelectItem, { key: 'faltante', value: 'faltante' }, 'Faltante (conteo)'),
                    h(UI.SelectItem, { key: 'otro', value: 'otro' }, 'Otro')
                  ),
                  errors['reason']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['reason']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_notes', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'notes', style: { display: 'block', marginBottom: '6px' } },
                  'Nota'
                ),
                h(UI.Input, {
                  id: 'notes',
                  type: 'text',
                  value: String(values['notes'] ?? ''),
                  placeholder: 'Opcional',
                  onChange: (e: any) => setField('notes', e.target.value),
                }),
                errors['notes']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['notes']
                    )
                  : null
              )
            )
          )
        )
      )
    ),
    h(
      UI.DialogFooter,
      null,
      h(
        UI.Button,
        {
          variant: 'ghost',
          onClick: () => {
            closeDialog();
          },
        },
        'Cancelar'
      ),
      h(
        UI.Button,
        {
          onClick: () => {
            void submit();
          },
        },
        'Guardar'
      )
    )
  );
}
