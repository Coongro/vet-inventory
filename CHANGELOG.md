# @coongro/vet-inventory

## 0.2.0

### Minor Changes

- cdcac8e: Plugin inicial. Aloja la vista "Lotes y stock" movida desde `kit-veterinary` (COONG-241): compone la `BatchesView` genérica de `products` con clasificadores (vacuna/medicamento) y resolvers de trazabilidad (proveedor, paciente, laboratorio) vía RPCs blandos de vaccination/vet-pharmacy/vademecum. El kit veterinario lo consume y organiza su menú en la sección "Inventario".
