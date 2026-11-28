# Módulo de Integración con Cobro Fácil (`src/app/api/cobrofacil/`)

## 1. Qué hace
Sincroniza y expone el catálogo de comercios, sucursales y productos unificados (114 productos certificados de Maciel #1 y base TPV) de Cobro Fácil en endpoints ligeros y desacoplados.

## 2. De dónde viene
- Llamadas desde `useCatalogoTienda.ts`, `VistaMercadosEmpresas.tsx` y fetch directo de clientes web.
- Peticiones HTTP a `/api/cobrofacil/products` y `/api/cobrofacil/[...path]`.

## 3. Archivos y Funciones
- `catalogService.ts`: Lógica de negocio (Cerebro) que consulta `pos_base`, une con `FALLBACK_PRODUCTS_SUC_1`, calcula stocks/precios y retorna datos puros.
- `companiesService.ts`: Lógica de negocio para mapear empresas, sucursales activas, geoposición y reseñas.
- `products/route.ts`: Endpoint GET puro (< 40 líneas) para inventario con soporte para `tienda`, `slug` y `sucursal_id`.
- `[...path]/route.ts`: Router dinámico (< 120 líneas) para `companies`, `tiendas` y proxy con resiliencia.

## 4. Hacia dónde sale
- Hacia la base PostgreSQL 16 (`crm_libro_local` en VPS) y fallback local de alta disponibilidad.
