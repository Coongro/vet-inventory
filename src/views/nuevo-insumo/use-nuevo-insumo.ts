/**
 * Nuevo insumo — datos y estado (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { actions, getHostReact, usePlugin, views } from '@coongro/plugin-sdk';

import { customHandlers } from './handlers.js';

const React = getHostReact();
const { useState, useCallback } = React;

export function useNuevoInsumoView() {
  const {
    toast,
    views: { closeDialog },
  } = usePlugin();
  const [values, setValues] = useState<Record<string, any>>({
    name: null,
    unit: null,
    category: null,
    purchase_price: null,
    stock_minimum: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setField = useCallback((k: string, v: any) => {
    setValues((prev: any) => ({ ...prev, [k]: v }));
    setErrors((e: any) => ({ ...e, [k]: undefined }));
  }, []);

  // record con el que se abrió la vista (views.open(id, { record })), si hubo — lo
  // reciben los handlers en onSubmit (ej. una acción de fila que necesita el id).
  const initialRecord = ((views.params as any)?.record ?? null) as Record<string, any> | null;

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (
      values['name'] === null ||
      values['name'] === undefined ||
      values['name'] === '' ||
      values['name'] === false
    )
      errs['name'] = '«Nombre» es requerido';
    if (
      values['unit'] === null ||
      values['unit'] === undefined ||
      values['unit'] === '' ||
      values['unit'] === false
    )
      errs['unit'] = '«Unidad» es requerido';
    if (
      values['purchase_price'] === null ||
      values['purchase_price'] === undefined ||
      values['purchase_price'] === '' ||
      values['purchase_price'] === false
    )
      errs['purchase_price'] = '«Costo (precio de compra)» es requerido';
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
      if (customHandlers.onSubmit) {
        const ctx = {
          execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
            return actions.execute<T>(id, args);
          },
          toast,
          record: initialRecord,
        };
        await customHandlers.onSubmit(values, ctx);
      } else {
        toast.warning(
          'Sin destino',
          'Conectá un repositorio (binding de datos) en el Builder o implementá onSubmit en handlers.ts'
        );
        return;
      }
      toast.success('Guardado', 'El registro se guardó correctamente');
      setValues({
        name: null,
        unit: null,
        category: null,
        purchase_price: null,
        stock_minimum: null,
      });
      closeDialog();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    }
    // deps intencionalmente fijas: el efecto corre una sola vez
  }, [values, validate]);

  return { values, errors, setField, submit };
}
