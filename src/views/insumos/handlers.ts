/**
 * Lógica custom de «Insumos» (InsumosView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`insumos.view.ts`,
 * `use-insumos.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import {
  findInsumosRootCategory,
  insumoCategoryIds,
  slugFromCategoryId,
  type ProductCategoryRow,
} from '../../lib/insumo-categories.js';

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

interface ProductRow {
  id: string;
  name: string;
  unit: string | null;
  category_id: string | null;
  purchase_price: string | null;
  stock_current: string | null;
  is_active?: boolean;
}

export const customHandlers: CustomHandlers = {
  /**
   * Lista los insumos = productos del catálogo genérico en la categoría "Insumos", con su stock
   * y costo. Devuelve valores CRUDOS (el costo lo formatea la columna con format:'money', y así
   * el prefill del form de edición recibe el número real). Solo lee products por RPCs genéricos;
   * la "insumo-ness" la define la categoría (dueño del concepto = este plugin), no products.
   */
  loadData: async ({ execute }) => {
    const [cats, items] = await Promise.all([
      execute<ProductCategoryRow[]>('products.categories.list'),
      execute<ProductRow[]>('products.items.list'),
    ]);
    const insumoCat = findInsumosRootCategory(cats ?? []);
    if (!insumoCat) return [];
    const validIds = insumoCategoryIds(cats ?? [], insumoCat.id);
    return (items ?? [])
      .filter((p) => !!p.category_id && validIds.has(p.category_id) && p.is_active !== false)
      .map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit ?? '',
        category: slugFromCategoryId(p.category_id, cats ?? [], insumoCat.id) ?? '',
        stock_current: p.stock_current ?? '0',
        purchase_price: p.purchase_price ?? '',
      }));
  },
};
