# Hooks de Pedidos y Notificaciones (`src/modulos/tienda/pedidos/hooks/`)

## 1. Qué hace
Monitorea reactivamente los pedidos del cliente logueado, consulta estados en tiempo real y calcula mensajes no leídos para badges en la UI.

## 2. De dónde viene
- Invocado por `TiendaPiramidal.tsx`, `HeaderTienda.tsx` y el centro de pedidos.

## 3. Archivos principales
- `usePedidosCliente.ts`: Consulta periódica a `/api/orders` para actualizar el estado de los pedidos del cliente.
- `useMensajesNoLeidos.ts`: Polling ligero a `/api/chat/unread` para mostrar alertas de nuevos mensajes del chofer.

## 4. Hacia dónde sale
- Hacia los endpoints `/api/orders` y `/api/chat/unread`.
