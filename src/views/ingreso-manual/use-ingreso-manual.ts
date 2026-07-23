/**
 * Ingreso manual — datos y estado.
 *
 * A diferencia de "Nuevo insumo" (que da de alta un insumo en el catálogo), esta vista
 * SUMA STOCK a un insumo YA EXISTENTE — mismo patrón que el ingreso manual de lote de
 * perecederos: elegís el producto (ya dado de alta) y cargás cuánto entra.
 *
 * NOTA: el diseño se intentó hacer 100% vía Coongro Builder (fieldType "ref" en el
 * campo Insumo), pero el codegen del Builder para un campo ref dentro de un form
 * standalone (fuera de un CRUD con repositoryPrefix) genera el JSX referenciando
 * `refOptions`/`refLabel` sin generar el código que los carga — build roto en
 * runtime ("refOptions is not defined"). Reportado como gap del Builder (ver
 * agent-workspace/pendientes/builder-ref-field-standalone-form.md). Esta vista
 * carga las opciones a mano mientras tanto.
 */
import { actions, getHostReact, usePlugin, views } from '@coongro/plugin-sdk';

import { findInsumosRootCategory, insumoCategoryIds } from '../../lib/insumo-categories.js';

import { customHandlers } from './handlers.js';

const React = getHostReact();
const { useState, useEffect, useCallback } = React;

export interface InsumoOption {
  id: string;
  name: string;
  unit: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  unit: string | null;
  category_id: string | null;
  is_active?: boolean;
}
interface CategoryRow {
  id: string;
  name: string;
  parent_id?: string | null;
}

export function useIngresoManualView() {
  const {
    toast,
    views: { closeDialog },
  } = usePlugin();
  const [values, setValues] = useState<Record<string, any>>({
    product_id: null,
    quantity: null,
    purchase_price: null,
    notes: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setField = useCallback((k: string, v: any) => {
    setValues((prev: any) => ({ ...prev, [k]: v }));
    setErrors((e: any) => ({ ...e, [k]: undefined }));
  }, []);

  // Insumos existentes para elegir (igual filtro que la tabla de Insumos).
  const [insumos, setInsumos] = useState<InsumoOption[]>([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [cats, items] = await Promise.all([
          actions.execute<CategoryRow[]>('products.categories.list'),
          actions.execute<ProductRow[]>('products.items.list'),
        ]);
        const root = findInsumosRootCategory(cats ?? []);
        if (!root) {
          if (active) setInsumos([]);
          return;
        }
        const validIds = insumoCategoryIds(cats ?? [], root.id);
        const options = (items ?? [])
          .filter((p) => !!p.category_id && validIds.has(p.category_id) && p.is_active !== false)
          .map((p) => ({ id: p.id, name: p.name, unit: p.unit }))
          .sort((a, b) => a.name.localeCompare(b.name));
        if (active) setInsumos(options);
      } catch {
        if (active) setInsumos([]);
      } finally {
        if (active) setLoadingInsumos(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const initialRecord = ((views.params as any)?.record ?? null) as Record<string, any> | null;

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!values['product_id']) errs['product_id'] = '«Insumo» es requerido';
    if (
      values['quantity'] === null ||
      values['quantity'] === undefined ||
      values['quantity'] === '' ||
      Number(values['quantity']) <= 0
    )
      errs['quantity'] = '«Cantidad» debe ser mayor a 0';
    return errs;
  }, [values]);

  const submit = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.warning('Revisá el formulario', 'Hay campos con errores.');
      return;
    }
    try {
      const ctx = {
        execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
          return actions.execute<T>(id, args);
        },
        toast,
        record: initialRecord,
      };
      await customHandlers.onSubmit?.(values, ctx);
      toast.success('Stock ingresado', `+${Number(values.quantity)} unidades`);
      setValues({ product_id: null, quantity: null, purchase_price: null, notes: null });
      closeDialog();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    }
    // deps intencionalmente fijas: el efecto corre una sola vez
  }, [values, validate]);

  return {
    values,
    errors,
    setField,
    submit,
    insumos,
    loadingInsumos,
    record: initialRecord,
  };
}
