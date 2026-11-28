# API de Pedidos (`src/app/api/orders/`)

## 1. Qué hace
Punto de entrada HTTP REST de Reparto Fácil para la consulta, registro y actualización del ciclo de vida de los pedidos.

## 2. De dónde viene
Llamadas fetch desde el frontend del comprador (`pedidoService.ts`, `CentroPedidosClienteSheet.tsx`) y del repartidor (`driverService.ts`, `TabMiRuta.tsx`).

## 3. Archivos y subcarpetas
- **`route.ts`**: Router ultraliviano que delega cada verbo HTTP a su respectiva acción en `core/`.
- **`core/`**: Submódulos especializados con mapeadores, queries y handlers de base de datos.
- **`custodio/`**: Microservicio custodio que audita inmovilidad o desconexión de choferes asignados.

## 4. Hacia dónde sale
Hacia el `core/` de pedidos y la base de datos PostgreSQL en el VPS de Oracle Cloud.
