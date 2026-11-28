# Core de Órdenes Backend (`src/app/api/orders/core/`)

## 1. Qué hace
Contiene la lógica de negocio modular y handlers de base de datos para la gestión y ciclo de vida de los pedidos (GET, POST y PATCH).

## 2. De dónde viene
Recibe llamadas HTTP delegadas desde el enrutador Next.js `src/app/api/orders/route.ts`.

## 3. Archivos y funciones
- **`orderMappers.ts`**: Mapeo y normalización de filas SQL a interfaces de dominio `OrderData` y liquidaciones del repartidor.
- **`orderGetAction.ts`**: Consulta y filtrado de pedidos en PostgreSQL con aislamiento estricto por cliente, empresa y chofer.
- **`orderPostAction.ts`**: Validación de catálogo (`validateOrder`) e inserción de nuevos pedidos en `repartofacil_pedidos`.
- **`orderPatchAction.ts`**: Transiciones de estado (asignación, retiro, embalaje, entrega, cancelación) y emisión al chat tripartito.

## 4. Hacia dónde sale
Interactúa con PostgreSQL (`repartofacil_pedidos`, `repartofacil_chat_mensajes`, `sucursales`) y retorna respuestas JSON con códigos HTTP 200, 201, 400, 403, 409 o 500.
