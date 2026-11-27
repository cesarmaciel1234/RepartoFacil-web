# Módulo de Integración con Cobro Fácil (`src/app/api/cobrofacil/`)

## 1. Qué hace
Sincroniza el catálogo de empresas, sucursales y productos del backend de Cobro Fácil con el e-commerce de Reparto Fácil, combinando lecturas locales rápidas de PostgreSQL con llamadas al servicio Flask.

## 2. De dónde viene
- Invocado por el hook `src/modulos/tienda/catalogo/hooks/useCatalogoTienda.ts`.
- Consultas de empresas en `src/modulos/tienda/ui/VistaMercadosEmpresas.tsx`.

## 3. Archivos y Rutas
- `[...path]/route.ts`: Endpoint dinámico que atiende `GET /api/cobrofacil/companies`, `GET /api/cobrofacil/companies/[id]` y catálogos de sucursales consultando la tabla `public.pos_base` y `public.sucursales`.
- `products/route.ts`: Consulta de inventario de productos por sucursal y categoría.

## 4. Hacia dónde sale
- Hacia las tablas `public.pos_base`, `public.sucursales` y `public.empresas` en PostgreSQL 16 local.
- Fallback hacia `http://127.0.0.1:5005` (Cobro Fácil VPS).
