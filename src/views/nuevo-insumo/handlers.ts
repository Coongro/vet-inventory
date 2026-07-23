/**
 * Lógica custom de «Nuevo insumo» (NuevoInsumoView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`nuevo-insumo.view.ts`,
 * `use-nuevo-insumo.ts`, `index.ts`) invocan estos puntos de extensión si
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
   * Alta de un insumo NUEVO en el catálogo genérico de products (categoría "Insumos",
   * en la subcategoría elegida si se cargó una). Nace con stock 0 — para cargarle
   * stock está el "Ingreso manual" de Inventario (selecciona el insumo, no lo crea).
   * NO toca products — solo usa sus RPCs genéricos (categorías / items).
   */
  onSubmit: async (values, { execute }) => {
    const name = String(values.name ?? '').trim();
    const unit = String(values.unit ?? '').trim();
    // Costo obligatorio: si no se conoce todavía, se carga 0 explícito (nunca null) —
    // evita costos ambiguos si el insumo se usa en un consumo antes de cargarle precio.
    const rawCost = values.purchase_price;
    const purchasePrice =
      rawCost === null || rawCost === undefined || rawCost === '' ? '0' : String(Number(rawCost));
    const rawMin = values.stock_minimum;
    const stockMinimum =
      rawMin === null || rawMin === undefined || rawMin === '' ? null : String(Number(rawMin));
    const categorySlug = values.category ? String(values.category) : null;

    const rootId = await ensureInsumosRootCategory(execute);
    const categoryId = (await ensureInsumoSubcategory(execute, rootId, categorySlug)) ?? rootId;

    await execute('products.items.create', {
      data: {
        name,
        unit,
        category_id: categoryId,
        purchase_price: purchasePrice,
        ...(stockMinimum !== null ? { stock_minimum: stockMinimum } : {}),
        is_active: true,
      },
    });
  },
};
