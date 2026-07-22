---
'@coongro/vet-inventory': minor
---

feat(insumos): vista de Insumos + alta, edición y ajuste de stock (COONG-256)

Nueva sección **Insumos** bajo INVENTARIO en el kit veterinario: los descartables/
consumibles que no son vacuna ni medicamento tenían dueño (el bucket se definía por
descarte en Compra) pero no dónde verse ni gestionarse.

- **Vista lista** (DataTable): nombre · categoría · unidad · stock · costo. Categoría
  y unidad se muestran como píldora con ícono.
- **Alta "Ingreso manual"**: crea el producto en la categoría "Insumos" (+ stock inicial).
- **Editar** insumo y **ajuste** de stock (in/out con motivo).

La "insumo-ness" la define la categoría (dueño del concepto = este plugin); products
no se toca, se consume por RPCs genéricos. Compuesto con el View Builder.
