/**
 * Lógica custom de «Ajustar stock» (AjustarStockView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`ajustar-stock.view.ts`,
 * `use-ajustar-stock.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

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
  /** record con el que se abrió la vista (la fila de la lista): trae el product_id del insumo. */
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
   * Da de baja stock de un insumo: registra un movimiento 'out' en products.stock (el motivo va
   * en las notas). El product_id llega en ctx.record — la fila de la lista desde la que se abrió
   * el diálogo. NO toca products; solo usa su RPC genérico de stock (que descuenta stock_current).
   */
  onSubmit: async (values, { execute, toast, record }) => {
    const rawId = record?.id;
    const productId = rawId ? String(rawId) : null;
    if (!productId) {
      toast?.error('Sin insumo', 'No se pudo identificar el insumo a dar de baja.');
      return;
    }
    const qty = Number(values.quantity ?? 0) || 0;
    if (qty <= 0) {
      toast?.warning('Cantidad inválida', 'Ingresá una cantidad mayor a 0.');
      return;
    }
    const reason = String(values.reason ?? '').trim();
    const note = String(values.notes ?? '').trim();
    const detail = [reason, note].filter(Boolean).join(' · ');
    await execute('products.stock.create', {
      data: {
        product_id: productId,
        type: 'out',
        // products.stock hace stock_current += quantity (el signo va en la cantidad, no en el
        // type): una baja resta, así que la cantidad va NEGATIVA. Los 'out' se guardan negativos.
        quantity: String(-qty),
        reference_type: 'insumo_baja',
        notes: detail || 'Baja de stock',
      },
    });
  },
};
