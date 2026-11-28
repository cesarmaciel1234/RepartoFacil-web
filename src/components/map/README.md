# Módulo de Mapa (`src/components/map/`)

## 1. Qué hace
Provee los submódulos especializados del mapa interactivo Leaflet para repartidores y clientes: íconos dinámicos SVG, cálculo de rutas OSRM, controlador de cámara y capas de marcadores separadas por modo (En Viaje vs Exploración).

## 2. De dónde viene
- Consumido principalmente por `src/components/InteractiveMap.tsx`.
- Recibe coordenadas del repartidor, comercios y clientes desde `src/modulos/repartidor/` o la vista de tracking de pedidos.

## 3. Subdirectorios y Archivos
- `mapIcons.tsx`: Fábrica de íconos Leaflet (`divIcon`) para repartidor propio, flota, comercios y pines de pedidos con estados.
- `useMapRoutes.ts`: Hook reactivo que calcula rutas vehiculares y alternativas mediante la API OSRM y distancia Haversine.
- `MapController.tsx`: Controlador de vista centrado y zoom dinámico para Leaflet según modo navegación.
- `TripMarkers.tsx`: Capa de marcadores para "Modo En Viaje" (Parada 1: Retiro en Comercio, Parada 2: Entrega a Cliente).
- `ExplorationMarkers.tsx`: Capa de marcadores para "Modo Exploración" (Comercios con pedidos, Paquetes disponibles en azul y Flota).

## 4. Hacia dónde sale
- Renderizado directamente en el contenedor Leaflet `<MapContainer>` en pantalla.
