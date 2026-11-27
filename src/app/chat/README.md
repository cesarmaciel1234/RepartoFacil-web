# Página de Chat de Pedidos (`src/app/chat/`)

## 1. Qué hace
Provee la vista de mensajería independiente y a pantalla completa entre el comprador y el repartidor para una orden activa.

## 2. De dónde viene
- Enlaces directos desde notificaciones push o deep links (`/chat?orderId=...`).

## 3. Archivos y Vistas
- `page.tsx`: Componente de pantalla completa con entrada de texto, burbujas de mensaje y estado de lectura.

## 4. Hacia dónde sale
- Hacia `/api/chat/[orderId]` para enviar y recibir mensajes.
