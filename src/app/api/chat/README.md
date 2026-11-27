# Módulo de Chat API (`src/app/api/chat/`)

## 1. Qué hace
Gestiona la mensajería interna en tiempo real asociada a cada pedido, permitiendo la comunicación entre el comprador, el chofer asignado y la sucursal emisora.

## 2. De dónde viene
- Disparado desde `src/modulos/repartidor/ui/OrderChatSheet.tsx` (chofer).
- Disparado desde `src/modulos/tienda/ui/MensajesClienteSheet.tsx` (comprador).

## 3. Archivos y Rutas
- `[orderId]/route.ts`: Envía y recupera el historial de mensajes de un pedido específico.
- `unread/route.ts`: Devuelve el conteo de mensajes no leídos para mostrar indicadores numéricos en las campanas de notificación.

## 4. Hacia dónde sale
- Hacia la tabla `public.repartofacil_chat_mensajes` en PostgreSQL 16 local.
- Hacia Firebase Firestore para eventos de notificación push.
