---
'@coongro/vet-inventory': minor
---

feat(lotes): «Ingreso manual» + aviso que encauza la compra a Salidas (COONG-254)

La vista de Lotes y stock ahora inyecta en `BatchesView` (products) las props nuevas:

- **`createLabel: 'Ingreso manual'`** — el alta manual deja de llamarse "Cargar lote". El alta de lote acá NO mueve dinero, así que el nombre ya no compite con el flujo real de abastecimiento.
- **`createHint`** — aviso arriba del formulario de alta: si estás comprando mercadería, va por **Salidas → Compra** (que registra el gasto y el costo del lote). Incluye un botón que abre directo el drawer de Compra.

Motivo: había dos caminos compitiendo sin señalización. Cargar una compra por el alta manual dejaba el stock bien pero el gasto y el margen mal, en silencio. El ingreso manual queda para carga inicial, donaciones o ajustes.
