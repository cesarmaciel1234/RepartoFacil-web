# Módulos de Dominio (`src/modulos/`)

## 1. Qué hace
Contiene la implementación piramidal de las dos experiencias centrales del negocio: la experiencia de compra multitienda del cliente (`tienda/`) y la aplicación táctil de reparto para choferes (`repartidor/`).

## 2. De dónde viene
- Invocados y orquestados por `src/app/page.tsx` según el rol y sesión del usuario:
  - Sesión de chofer válida -> `<RepartidorPiramidal />`.
  - Navegación general de cliente -> `<TiendaPiramidal />`.

## 3. Subdirectorios
- `tienda/`: E-commerce del comprador (catálogo multitienda, carrito persistente, checkout, perfil de cliente y seguimiento de pedidos).
- `repartidor/`: PWA de choferes (radar de órdenes, mapa Leaflet con ruteo, liquidaciones de cobranzas y chat con cliente).
- `logica_negocio.md`: Documento de invariantes y reglas de checkout, tarifas y autenticación.

## 4. Hacia dónde sale
- Hacia las vistas del usuario montadas en `src/app/page.tsx`.
- Hacia las APIs internas en `src/app/api/` y los servicios compartidos en `src/lib/`.
