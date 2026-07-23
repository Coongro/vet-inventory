/**
 * AUTO-GENERADO por Coongro Builder — NO editar a mano.
 * Se regenera al guardar la página de settings desde /dev/builder.
 * La lógica de negocio va en un hook de dominio que consume esto.
 */
/* eslint-disable */

import { useSettings } from '@coongro/plugin-sdk';

function toNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

/** Tipo de cada setting por su key punteada (para getSetting). */
export interface VetInventorySettingsByKey {
  'vet-inventory.insumos.defaultMinimum': number;
}

/** Settings del plugin con defaults aplicados y coerción por tipo. */
export interface VetInventorySettings {
  /** Stock mínimo por defecto — Nivel por debajo del cual un insumo se marca "bajo mínimo" en Inventario. Se aplica a todos los insumos que no tengan un mínimo propio. 0 = sin aviso. · `vet-inventory.insumos.defaultMinimum` · default: `5` */
  readonly insumosDefaultMinimum: number;
}

/** Nombre de prop → key punteada del manifest. */
export const SETTING_KEYS = {
  insumosDefaultMinimum: 'vet-inventory.insumos.defaultMinimum',
} as const;

/** Valores por defecto (los mismos del manifest). */
export const SETTING_DEFAULTS = {
  'vet-inventory.insumos.defaultMinimum': 5,
} as const;

const COERCE: {
  [K in keyof VetInventorySettingsByKey]: (
    values: Record<string, unknown>
  ) => VetInventorySettingsByKey[K];
} = {
  'vet-inventory.insumos.defaultMinimum': (values) =>
    toNum(values['vet-inventory.insumos.defaultMinimum'], 5),
};

/** Lee UNA setting tipada desde los valores crudos del tenant (para handlers). */
export function getSetting<K extends keyof VetInventorySettingsByKey>(
  values: Record<string, unknown>,
  key: K
): VetInventorySettingsByKey[K] {
  return COERCE[key](values);
}

/** Construye el objeto tipado desde los valores crudos (sin hook: handlers/tests). */
export function readVetInventorySettings(values: Record<string, unknown>): VetInventorySettings {
  return {
    insumosDefaultMinimum: COERCE['vet-inventory.insumos.defaultMinimum'](values),
  };
}

/**
 * Hook reactivo: settings tipadas del plugin con defaults aplicados.
 * Envolvé esto en un hook de dominio si necesitás lógica de negocio.
 */
export function useVetInventorySettings(): { settings: VetInventorySettings; loading: boolean } {
  const { values, loading } = useSettings('vet-inventory.');
  return { settings: readVetInventorySettings(values), loading };
}
