# Acceso Directo de Repartidor (`src/app/repartidor/`)

## 1. Qué hace
Ruta directa para choferes y repartidores (`/repartidor`), activando el modo operativo de logística sin pasar por la vista de e-commerce.

## 2. De dónde viene
- Acceso directo de choferes o acceso mediante PWA guardada en la pantalla de inicio del teléfono móvil.

## 3. Archivos y Vistas
- `page.tsx`: Monta `<RepartidorPiramidal />` con validación de credenciales operativas.

## 4. Hacia dónde sale
- Hacia `src/modulos/repartidor/RepartidorPiramidal.tsx`.
