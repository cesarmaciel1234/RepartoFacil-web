# Componentes Visuales Compartidos (`src/components/`)

## 1. Qué hace
Contiene la biblioteca de componentes reutilizables de la interfaz (la "Cara"), abarcando elementos base de diseño (shadcn UI), formularios modales, layouts y mapas interactivos.

## 2. De dónde viene
- Consumidos transversalmente por `src/app/`, `src/modulos/tienda/` y `src/modulos/repartidor/`.

## 3. Subdirectorios y Archivos
- `ui/`: Primitivas de diseño atómico basadas en Radix UI y Tailwind CSS (`button`, `dialog`, `drawer`, `sheet`, `input`, etc.).
- `map/`: Submódulos del mapa interactivo (íconos Leaflet, capas de marcadores en viaje y exploración, rutas OSRM y controlador).
- `sidebar/`: Submódulos del menú lateral (hooks de autenticación, vistas exclusivas de repartidor y comprador, pie con PWA cache).
- `auth/`: Modales y formularios de inicio de sesión genéricos.
- `dashboard/`: Paneles y tarjetas de métricas operativas.
- `ecommerce/`: Tarjetas de producto, contadores de ítems y carritos flotantes.
- `InteractiveMap.tsx`: Fachada orquestadora del mapa Leaflet dinámico con tracking en tiempo real.
- `LocationPickerMap.tsx`: Selector interactivo de dirección y geolocalización de entrega.
- `SidebarGeneral.tsx`: Menú lateral de navegación global DiDi/PedidosYa.

## 4. Hacia dónde sale
- Renderizado visual directamente en el DOM del navegador.
