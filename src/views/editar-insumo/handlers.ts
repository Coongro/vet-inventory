/**
 * Lógica custom de «Editar insumo» (EditarInsumoView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`editar-insumo.view.ts`,
 * `use-editar-insumo.ts`, `index.ts`) invocan estos puntos de extensión si
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
  /** id del registro en edición (form abierto con { record } sobre una entidad). */
  editingId?: string | null;
  /** record con el que se abrió la vista (views.open(id, { record })) — ej. la fila de una lista. */
  record?: Record<string, unknown> | null;
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
   * Actualiza el insumo (nombre/unidad/costo/categoría). El prefill lo hace el ciclo nativo
   * (repositoryPrefix de products.items); el submit va custom porque `products.items.update`
   * espera `{ id, data }` y el update nativo del Builder manda los campos al tope. El id llega
   * por editingId/record. No toca stock.
   */
  onSubmit: async (values, { execute, editingId, record }) => {
    const rawId = record?.id;
    const id = editingId ?? (rawId ? String(rawId) : null);
    if (!id) return;
    const rawCost = values.purchase_price;
    const rawMin = values.stock_minimum;
    // Mínimo propio del insumo (override del global). Vacío → 0 (vuelve a usar el global).
    const stockMinimum =
      rawMin === null || rawMin === undefined || rawMin === '' ? '0' : String(Number(rawMin));
    const categorySlug = values.category ? String(values.category) : null;
    const rootId = await ensureInsumosRootCategory(execute);
    const categoryId = (await ensureInsumoSubcategory(execute, rootId, categorySlug)) ?? rootId;
    await execute('products.items.update', {
      id,
      data: {
        name: String(values.name ?? '').trim(),
        unit: String(values.unit ?? '').trim(),
        purchase_price:
          rawCost === null || rawCost === undefined || rawCost === ''
            ? null
            : String(Number(rawCost)),
        stock_minimum: stockMinimum,
        category_id: categoryId,
      },
    });
  },
};
