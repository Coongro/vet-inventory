/**
 * Subcategorías de "Insumos" — hijas reales de products.categories (no un enum aparte),
 * para heredar ícono nativo (categoryTable.icon) y dejar la puerta abierta a filtrar/
 * reportar por tipo de insumo. Fuente de verdad de qué tipos existen: este archivo.
 */

export const INSUMO_CATEGORIES = [
  { value: 'jeringas', label: 'Jeringas y agujas', icon: 'Syringe' },
  { value: 'curacion', label: 'Curación', icon: 'Bandage' },
  { value: 'proteccion', label: 'Protección', icon: 'Shield' },
  { value: 'higiene', label: 'Higiene y limpieza', icon: 'SprayCan' },
  { value: 'otros', label: 'Otros', icon: 'Package' },
] as const;

export type InsumoCategorySlug = (typeof INSUMO_CATEGORIES)[number]['value'];

type Execute = <T = unknown>(id: string, args?: unknown) => Promise<T>;

export interface ProductCategoryRow {
  id: string;
  name: string;
  parent_id?: string | null;
  icon?: string | null;
}

const INSUMOS_ROOT_NAME = 'Insumos';

/** Encuentra la categoría raíz "Insumos" en una lista ya cargada (no crea, no pega a la API). */
export function findInsumosRootCategory(
  cats: ProductCategoryRow[]
): ProductCategoryRow | undefined {
  return cats.find(
    (c) => (c.name ?? '').trim().toLowerCase() === INSUMOS_ROOT_NAME.toLowerCase() && !c.parent_id
  );
}

/** Categoría raíz "Insumos" — la crea si no existe. */
export async function ensureInsumosRootCategory(execute: Execute): Promise<string> {
  const cats = await execute<ProductCategoryRow[]>('products.categories.list');
  const existing = findInsumosRootCategory(cats ?? []);
  if (existing) return existing.id;
  const created = await execute<ProductCategoryRow[] | ProductCategoryRow>(
    'products.categories.create',
    { data: { name: INSUMOS_ROOT_NAME, icon: 'Package' } }
  );
  const row = Array.isArray(created) ? created[0] : created;
  return row.id;
}

/** Subcategoría (hija de "Insumos") para el tipo elegido — la crea si no existe. `null` = sin tipo. */
export async function ensureInsumoSubcategory(
  execute: Execute,
  rootId: string,
  slug: string | null | undefined
): Promise<string | null> {
  const def = INSUMO_CATEGORIES.find((c) => c.value === slug);
  if (!def) return null;
  const cats = await execute<ProductCategoryRow[]>('products.categories.list');
  const existing = (cats ?? []).find(
    (c) => c.parent_id === rootId && (c.name ?? '').trim().toLowerCase() === def.label.toLowerCase()
  );
  if (existing) return existing.id;
  const created = await execute<ProductCategoryRow[] | ProductCategoryRow>(
    'products.categories.create',
    { data: { name: def.label, icon: def.icon, parent_id: rootId } }
  );
  const row = Array.isArray(created) ? created[0] : created;
  return row.id;
}

/** Todos los category_id que cuentan como "es un insumo": la raíz + sus subcategorías. */
export function insumoCategoryIds(cats: ProductCategoryRow[], rootId: string): Set<string> {
  const ids = new Set<string>([rootId]);
  for (const c of cats) if (c.parent_id === rootId) ids.add(c.id);
  return ids;
}

/** Slug de subcategoría a partir del category_id de un producto (null = raíz / sin tipo). */
export function slugFromCategoryId(
  categoryId: string | null | undefined,
  cats: ProductCategoryRow[],
  rootId: string
): InsumoCategorySlug | null {
  if (!categoryId || categoryId === rootId) return null;
  const cat = cats.find((c) => c.id === categoryId);
  if (!cat) return null;
  const def = INSUMO_CATEGORIES.find(
    (d) => d.label.toLowerCase() === (cat.name ?? '').toLowerCase()
  );
  return def?.value ?? null;
}
