# Módulo de Pedidos API (`src/app/api/orders/`)

## 1. Qué hace
Gestiona el ciclo de vida completo de los pedidos: recepción, validación de stock y tarifas, persistencia transaccional, asignación a choferes y custodia de entrega.

## 2. De dónde viene
- Invocado por `src/modulos/tienda/motor/pedidoService.ts` tras el checkout.
- Consultas y cambios de estado desde la PWA del repartidor (`src/modulos/repartidor/motor/driverService.ts`).

## 3. Archivos y Subrutas
- `route.ts`: Atiende `POST /api/orders` (creación de orden con validación estricta de aislamiento multi-tenant y montos) y `GET /api/orders` (historial del cliente o lista de órdenes para repartidores).
- `custodio/route.ts`: Protocolo de entrega segura con PIN, firma o código QR para liberar cobranzas contra entrega.

## 4. Hacia dónde sale
- Hacia la tabla `public.repartofacil_pedidos` en PostgreSQL 16 local.
- Hacia el módulo de sincronización en tiempo real (Firebase/WebSockets) para notificar a la tienda y al chofer.
