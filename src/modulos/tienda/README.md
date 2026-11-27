# Módulo: Tienda (`src/modulos/tienda`)

## 1. Qué hace
Experiencia de compra completa del cliente: catálogo, carrito reactivo, pasarela de checkout, tracking de pedidos y perfil de usuario.

## 2. De dónde viene
Montado por `src/app/page.tsx` a través de `<TiendaPiramidal />`.

## 3. Archivos y subcarpetas principales
- `TiendaPiramidal.tsx`: Orquestador principal; gestiona estado global de tienda y monta `ModalDriverAuth` directamente sobre Mi Perfil sin alterar la pantalla de fondo.
- `catalogo/`: Carga y filtros de productos y comercios.
- `pedidos/`: Sincronización de pedidos y mensajes del cliente.
- `pantallas/`: Pantallas completas (Inicio, Súper, Promos, Pedidos, Perfil).
- `ui/`: Componentes visuales reutilizables, drawers y modales.
- `motor/`: Hooks y lógica de carrito y pedidos.

## 4. Hacia dónde sale
Hacia la API `/api/orders`, `/api/chat` y la pantalla de Repartidor (`onSwitchToDriver`).
