# Datos y Catálogos Locales (`src/data/`)

## 1. Qué hace
Provee datos estáticos de inicialización, mock de empresas asociadas y el catálogo de respaldo para contingencias sin conexión a internet.

## 2. De dónde viene
- Consumido por `useCatalogoTienda.ts` cuando la red o el backend de Cobro Fácil no responden.

## 3. Archivos principales
- `fallbackCatalog.ts`: Catálogo estático de productos ordenados por empresa y rubro con precios y fotografías de respaldo.
- `mockCompanies.ts`: Lista de empresas y sucursales por defecto para modo de demostración.

## 4. Hacia dónde sale
- Hacia la memoria de la app y la vista del catálogo de la tienda.
