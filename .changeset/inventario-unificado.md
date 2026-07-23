---
'@coongro/vet-inventory': minor
---

feat: inventario unificado — perecederos + insumos en una sola pantalla (COONG-263)

Un solo menú **Inventario** compone dos secciones: los perecederos (vacunas/medicamentos por lote, sin cambios) arriba, y los insumos (stock simple) abajo con barra de disponibilidad y aviso "Bajo mínimo" contra un mínimo propio o global (setting nueva `vet-inventory.insumos.defaultMinimum`, default 5).

El detalle de un insumo ahora es un panel lateral (como el detalle de lote): ciclo de stock (ingresos − salidas = disponible), historial de movimientos con link a la compra que los originó, y acciones editar/dar de baja.

Se separan dos acciones que antes estaban mezcladas:
- **Nuevo insumo** (menú Insumos, catálogo): da de alta el insumo. Sin stock inicial (nace en 0); costo obligatorio (0 si no se conoce todavía).
- **Ingreso manual** (Inventario, sección insumos): suma stock a un insumo ya existente (selector + cantidad/costo/notas) — no crea nada.

El menú "Insumos" pasa a ser puramente el catálogo (Nombre/Categoría/Unidad/Costo); el stock se ve solo en Inventario.
