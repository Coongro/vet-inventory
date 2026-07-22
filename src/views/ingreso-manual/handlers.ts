/**
 * Lógica custom de «Ingreso manual» (IngresoManualView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`ingreso-manual.view.ts`,
 * `use-ingreso-manual.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import { ensureInsumoSubcategory, ensureInsumosRootCategory } from '../../lib/insumo-categories.js';

type Execute = <T = unknown>(id: string, args?: unknown) => Promise<T>;

interface HandlerCtx {
  execute: Execute;
  toast?: {
    success: (title: string, msg: string) => void;
    error: (title: string, msg: string) => void;
    warning: (title: string, msg: string) => void;
    info: (title: string, msg: string) => void;
  };
  values?: Record<string, unknown>;
}

export interface CustomHandlers {
  /** Reemplaza el submit por defecto del formulario. */
  onSubmit?: (values: Record<string, unknown>, ctx: HandlerCtx) => Promise<void>;
  /** Reemplaza la carga de datos de la tabla/lista. */
  loadData?: (ctx: HandlerCtx) => Promise<unknown[]>;
  /** Mapea una fila cruda a las celdas de la tabla (en el orden de las columnas). */
  mapRow?: (row: Record<string, unknown>) => unknown[];
  /** Etiqueta visible para las opciones de un campo Relación. */
  refLabel?: (row: Record<string, unknown>) => string;
  /** Intercepta las acciones de servidor de los botones. */
  onAction?: (actionId: string, ctx: HandlerCtx) => Promise<void>;
  /** Recibe la fecha/rango elegido en un DateScope sin acción cableada. */
  onDateScope?: (range: { preset: string; day: string }) => void;
  /** Render de componentes contribuidos por plugins (no-core). */
  renderComponent?: (
    comp: string,
    props: Record<string, unknown>,
    h: (...args: unknown[]) => unknown
  ) => unknown;
}

export const customHandlers: CustomHandlers = {
  /**
   * Alta manual de un insumo: lo crea en el catálogo genérico de products (categoría "Insumos",
   * en la subcategoría elegida si se cargó una) y, si se cargó stock inicial, registra el
   * movimiento de entrada. NO toca products — solo usa sus RPCs genéricos (categorías / items /
   * stock). El stock_current lo actualiza el propio movimiento 'in' de products.stock.
   */
  onSubmit: async (values, { execute }) => {
    const name = String(values.name ?? '').trim();
    const unit = String(values.unit ?? '').trim();
    const stockInitial = Number(values.stock_initial ?? 0) || 0;
    const rawCost = values.purchase_price;
    const purchasePrice =
      rawCost === null || rawCost === undefined || rawCost === '' ? null : String(Number(rawCost));
    const categorySlug = values.category ? String(values.category) : null;

    const rootId = await ensureInsumosRootCategory(execute);
    const categoryId = (await ensureInsumoSubcategory(execute, rootId, categorySlug)) ?? rootId;

    const createdProd = await execute<{ id: string }[] | { id: string }>('products.items.create', {
      data: {
        name,
        unit,
        category_id: categoryId,
        purchase_price: purchasePrice,
        is_active: true,
      },
    });
    const product = Array.isArray(createdProd) ? createdProd[0] : createdProd;

    if (product?.id && stockInitial > 0) {
      await execute('products.stock.create', {
        data: {
          product_id: product.id,
          type: 'in',
          quantity: String(stockInitial),
          reference_type: 'insumo_initial',
          notes: 'Ingreso manual · stock inicial',
        },
      });
    }
  },
};
