# Página de Pedidos (`src/app/orders/`)

## 1. Qué hace
Ruta de consulta y seguimiento directo de pedidos realizados por el cliente, permitiendo ver el estado en vivo (en preparación, en camino, entregado).

## 2. De dónde viene
- Redirección pos-checkout o acceso directo desde `/orders`.

## 3. Archivos y Vistas
- `page.tsx`: Vista de listado de pedidos y tarjeta de estado en tiempo real.

## 4. Hacia dónde sale
- Hacia `GET /api/orders` y el estado global de pedidos en `src/modulos/tienda/pedidos/`.
