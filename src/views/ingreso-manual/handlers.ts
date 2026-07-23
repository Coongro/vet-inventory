/**
 * Lógica custom de «Ingreso manual» (IngresoManualView).
 *
 * Este archivo es TUYO: no se regenera. Suma stock a un insumo YA EXISTENTE
 * (elegido con el selector) — para dar de alta un insumo nuevo está "Nuevo insumo".
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
  record?: Record<string, unknown> | null;
}

export interface CustomHandlers {
  onSubmit?: (values: Record<string, unknown>, ctx: HandlerCtx) => Promise<void>;
}

export const customHandlers: CustomHandlers = {
  /**
   * Suma stock a un insumo existente: un movimiento 'in' en products.stock. NO crea
   * insumos — el product_id viene del selector, que solo lista insumos ya dados de alta.
   */
  onSubmit: async (values, { execute }) => {
    const productId = String(values.product_id);
    const quantity = Number(values.quantity);
    const rawCost = values.purchase_price;
    await execute('products.stock.create', {
      data: {
        product_id: productId,
        type: 'in',
        quantity: String(quantity),
        unit_cost:
          rawCost === null || rawCost === undefined || rawCost === ''
            ? null
            : String(Number(rawCost)),
        reference_type: 'insumo_manual_in',
        notes: values.notes ? String(values.notes).trim() : 'Ingreso manual',
      },
    });
  },
};
