# Hooks del Catálogo de Tienda (`src/modulos/tienda/catalogo/hooks/`)

## 1. Qué hace
Encapsula la lógica de petición, reintentos, fallback local y caché persistente en `localStorage` para empresas y productos del e-commerce.

## 2. De dónde viene
- Invocado principalmente por `src/modulos/tienda/TiendaPiramidal.tsx` y las pantallas de catálogo.

## 3. Archivos principales
- `useCatalogoTienda.ts`: Orquesta la carga de empresas y productos desde `/api/cobrofacil`, calcula advertencias de inventario y provee función de recarga en caliente.

## 4. Hacia dónde sale
- Hacia `/api/cobrofacil/companies`, `/api/cobrofacil/products`, y fallback a `src/data/fallbackCatalog.ts`.
