/**
 * Dar de baja — datos y estado (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { actions, getHostReact, usePlugin, views } from '@coongro/plugin-sdk';

import { customHandlers } from './handlers.js';

const React = getHostReact();
const { useState, useCallback } = React;

export function useAjustarStockView() {
  const {
    toast,
    views: { closeDialog },
  } = usePlugin();
  const [values, setValues] = useState<Record<string, any>>({
    quantity: null,
    reason: null,
    notes: null,
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
      values['quantity'] === null ||
      values['quantity'] === undefined ||
      values['quantity'] === '' ||
      values['quantity'] === false
    )
      errs['quantity'] = '«Cantidad a dar de baja» es requerido';
    if (
      values['reason'] === null ||
      values['reason'] === undefined ||
      values['reason'] === '' ||
      values['reason'] === false
    )
      errs['reason'] = '«Motivo» es requerido';
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
      setValues({ quantity: null, reason: null, notes: null });
      closeDialog();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    }
    // deps intencionalmente fijas: el efecto corre una sola vez
  }, [values, validate]);

  return { values, errors, setField, submit };
}
