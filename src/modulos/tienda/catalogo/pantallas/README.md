# Pantallas de Catálogo de Comercio (`src/modulos/tienda/catalogo/pantallas/`)

## 1. Qué hace
Muestra el catálogo detallado de una empresa o sucursal seleccionada, permitiendo filtrar por categorías, buscar productos y añadirlos al carrito con animación reactiva.

## 2. De dónde viene
- Montado en `TiendaPiramidal.tsx` cuando el usuario hace clic en una empresa desde la vista general de comercios.

## 3. Archivos principales
- `CatalogoEmpresaTienda.tsx`: Pantalla completa de la tienda del comercio, encabezado con datos de sucursal, horario, costo de envío y grilla de productos.

## 4. Hacia dónde sale
- Hacia `useCart` para modificar el carrito de esa empresa específica.
