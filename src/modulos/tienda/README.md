# Módulo: Tienda (`src/modulos/tienda`)

## 1. Qué hace
Experiencia de compra completa del cliente: catálogo, carrito reactivo, pasarela de checkout, tracking de pedidos y perfil de usuario.

## 2. De dónde viene
Montado por `src/app/page.tsx` a través del orquestador modular `<TiendaPiramidal />`.

## 3. Archivos y subcarpetas principales
- `TiendaPiramidal.tsx`: Orquestador principal (< 380 líneas) desacoplado en sub-hooks y sub-vistas.
- `catalogo/`: Carga, deduplicación y filtros de productos y comercios.
- `pedidos/`: Sincronización de pedidos y mensajes del cliente.
- `pantallas/`: Pantallas completas (Inicio, Súper, Promos, Pedidos, Perfil).
- `ui/`: Componentes visuales reutilizables, drawers, modales y `TiendaActiveTabContent.tsx`.
- `motor/`: Lógica de negocio (Cerebro): hooks de carrito, estado de catálogo, checkout y envíos.

## 4. Hacia dónde sale
Hacia la API `/api/orders`, `/api/chat` y la pantalla de Repartidor (`onSwitchToDriver`).
