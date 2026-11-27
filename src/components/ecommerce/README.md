# Componentes de E-commerce (`src/components/ecommerce/`)

## 1. Qué hace
Componentes visuales orientados al catálogo: tarjetas de producto con selector de cantidad, banners promocionales y chips de categoría.

## 2. De dónde viene
- Invocados por las vistas de tienda en `src/modulos/tienda/catalogo/` e `InicioTienda.tsx`.

## 3. Archivos principales
- `ProductCard.tsx`: Tarjeta visual del producto con foto, precio, badges y botón de agregar al carrito.
- `CategoryFilter.tsx`: Selector horizontal de categorías y rubros.

## 4. Hacia dónde sale
- Hacia el hook `useCart` para registrar agregados o cambios de cantidad.
