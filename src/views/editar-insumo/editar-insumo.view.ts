/**
 * Editar insumo — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { useEditarInsumoView } from './use-editar-insumo.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function EditarInsumoView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, submit, editingId } = useEditarInsumoView();

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
          { icon: 'Package', title: 'Datos del insumo' },
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
              { 'data-cg-block-id': 'f_name', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'name', style: { display: 'block', marginBottom: '6px' } },
                  'Nombre',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                ),
                h(UI.Input, {
                  id: 'name',
                  type: 'text',
                  value: String(values['name'] ?? ''),
                  placeholder: 'Ej: Jeringa 5ml',
                  onChange: (e: any) => setField('name', e.target.value),
                }),
                errors['name']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['name']
                    )
                  : null
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_unit', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'unit', style: { display: 'block', marginBottom: '6px' } },
                    'Unidad',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['unit'] ?? ''),
                      onValueChange: (v: string) => setField('unit', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(
                      UI.SelectItem,
                      {
                        key: 'unidad',
                        value: 'unidad',
                        icon: h(UI.DynamicIcon, { icon: 'Hash', size: 16 }),
                      },
                      'unidad'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'caja',
                        value: 'caja',
                        icon: h(UI.DynamicIcon, { icon: 'Box', size: 16 }),
                      },
                      'caja'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'par',
                        value: 'par',
                        icon: h(UI.DynamicIcon, { icon: 'Layers2', size: 16 }),
                      },
                      'par'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'rollo',
                        value: 'rollo',
                        icon: h(UI.DynamicIcon, { icon: 'Scroll', size: 16 }),
                      },
                      'rollo'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'blíster',
                        value: 'blíster',
                        icon: h(UI.DynamicIcon, { icon: 'Grid3x3', size: 16 }),
                      },
                      'blíster'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'frasco',
                        value: 'frasco',
                        icon: h(UI.DynamicIcon, { icon: 'FlaskConical', size: 16 }),
                      },
                      'frasco'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'ml',
                        value: 'ml',
                        icon: h(UI.DynamicIcon, { icon: 'Droplet', size: 16 }),
                      },
                      'ml'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'l',
                        value: 'l',
                        icon: h(UI.DynamicIcon, { icon: 'Droplets', size: 16 }),
                      },
                      'l'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'g',
                        value: 'g',
                        icon: h(UI.DynamicIcon, { icon: 'Scale', size: 16 }),
                      },
                      'g'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'kg',
                        value: 'kg',
                        icon: h(UI.DynamicIcon, { icon: 'Weight', size: 16 }),
                      },
                      'kg'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'm',
                        value: 'm',
                        icon: h(UI.DynamicIcon, { icon: 'Ruler', size: 16 }),
                      },
                      'm'
                    )
                  ),
                  errors['unit']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['unit']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_category', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'category', style: { display: 'block', marginBottom: '6px' } },
                    'Categoría'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['category'] ?? ''),
                      onValueChange: (v: string) => setField('category', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(
                      UI.SelectItem,
                      {
                        key: 'jeringas',
                        value: 'jeringas',
                        icon: h(UI.DynamicIcon, { icon: 'Syringe', size: 16 }),
                      },
                      'Jeringas y agujas'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'curacion',
                        value: 'curacion',
                        icon: h(UI.DynamicIcon, { icon: 'Bandage', size: 16 }),
                      },
                      'Curación'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'proteccion',
                        value: 'proteccion',
                        icon: h(UI.DynamicIcon, { icon: 'Shield', size: 16 }),
                      },
                      'Protección'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'higiene',
                        value: 'higiene',
                        icon: h(UI.DynamicIcon, { icon: 'SprayCan', size: 16 }),
                      },
                      'Higiene y limpieza'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'otros',
                        value: 'otros',
                        icon: h(UI.DynamicIcon, { icon: 'Package', size: 16 }),
                      },
                      'Otros'
                    )
                  ),
                  errors['category']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['category']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_cost', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'purchase_price', style: { display: 'block', marginBottom: '6px' } },
                  'Costo (precio de compra)'
                ),
                h(UI.Input, {
                  id: 'purchase_price',
                  type: 'number',
                  value: values['purchase_price'] ?? '',
                  placeholder: 'Ej: 180',
                  onChange: (e: any) =>
                    setField(
                      'purchase_price',
                      e.target.value === '' ? null : Number(e.target.value)
                    ),
                }),
                errors['purchase_price']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['purchase_price']
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
        editingId ? 'Actualizar' : 'Guardar'
      )
    )
  );
}
