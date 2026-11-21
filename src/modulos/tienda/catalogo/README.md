# Dominio de catálogo

**Ubicación:** `src/modulos/tienda/catalogo/`

Este dominio carga los comercios/productos y prepara la información usada por
Inicio, Súper, Promociones y el catálogo de un comercio.

## Estructura

- `hooks/useCatalogoTienda.ts`: obtiene comercios y productos de forma
  independiente, restaura copias locales, las actualiza mientras la tienda está
  abierta y al reconectar, y deriva departamentos/productos filtrados.
- `cacheCatalogo.ts`: valida y guarda por separado las últimas respuestas completas
  de comercios y productos, con su fecha de actualización.
- `pantallas/CatalogoEmpresaTienda.tsx`: presenta el catálogo del comercio
  seleccionado y emite acciones por callbacks.

## Contrato

El hook recibe comercio, categoría, texto de búsqueda y coordenadas de entrega.
Retorna comercios/productos y resultados derivados. La pantalla no realiza
peticiones ni decide cómo se sincroniza el catálogo.

Al agregar una capacidad de catálogo, mantener su obtención/transformación en el
hook y su presentación en la pantalla; la selección de navegación permanece en
`TiendaPiramidal.tsx`.

El catálogo guardado es solo informativo: precio, stock y apertura pueden haber
cambiado. Las compras requieren una respuesta actual del inventario. Una respuesta
parcial de productos no reemplaza la última copia completa. Si el almacenamiento
falla, se informa en pantalla. El navegador no garantiza actualización cuando la
aplicación está cerrada; las imágenes solo estarán disponibles offline si el
service worker pudo guardarlas previamente.
