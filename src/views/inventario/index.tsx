import { getHostReact, useIsMobile } from '@coongro/plugin-sdk';

import { InsumosView } from '../insumos/insumos.view.js';
import { LotesView } from '../lotes/index.js';

const React = getHostReact();
const h = React.createElement;

/**
 * Inventario — el ÚNICO lugar de stock del kit. Compone en una sola pantalla las dos
 * naturalezas de stock que existen, cada una con las columnas que le corresponden:
 *  - Perecederos (por lote y vencimiento): la vista de lotes, embebida como sección.
 *  - Insumos (stock simple, sin lote): la vista de insumos, embebida como sección.
 *
 * Es composición pura: no reescribe ninguna de las dos vistas ni su lógica — solo las
 * apila y les provee un shell común (fondo + padding + encabezado). Reemplaza los dos
 * menús anteriores ("Lotes y stock" e "Insumos") por uno solo.
 */
export function InventarioView() {
  const isMobile = useIsMobile();

  return h(
    'div',
    {
      style: {
        minHeight: '100%',
        backgroundColor: 'var(--cg-bg-secondary)',
        padding: isMobile ? '16px' : '24px',
      },
    },
    h(
      'div',
      { style: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '24px' } },

      // Encabezado de la pantalla
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
        h(
          'h1',
          { style: { fontSize: '26px', fontWeight: 800, color: 'var(--cg-text)', margin: 0 } },
          'Inventario'
        ),
        h(
          'p',
          {
            style: {
              fontSize: '14px',
              color: 'var(--cg-text-muted)',
              marginTop: '4px',
              maxWidth: '720px',
            },
          },
          'Un solo lugar para todo el stock de la clínica. Perecederos con lote y vencimiento arriba, insumos de stock simple abajo — cada sección con las columnas que le corresponden.'
        )
      ),

      // Sección 1 — Perecederos (por lote)
      h(
        'section',
        null,
        h(LotesView, {
          embedded: true,
          title: 'Perecederos · por lote',
          subtitle: 'Vacunas y medicamentos — el stock real por lote, con vencimiento.',
        })
      ),

      // Separador entre secciones
      h('div', {
        style: { height: '1px', backgroundColor: 'var(--cg-border)', margin: '4px 0' },
      }),

      // Sección 2 — Insumos (stock simple)
      h('section', null, h(InsumosView, { embedded: true }))
    )
  );
}
