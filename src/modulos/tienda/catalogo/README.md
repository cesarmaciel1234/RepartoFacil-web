# Dominio de catálogo

**Ubicación:** `src/modulos/tienda/catalogo/`

Este dominio carga los comercios/productos y prepara la información usada por
Inicio, Súper, Promociones y el catálogo de un comercio.

## Estructura

- `hooks/useCatalogoTienda.ts`: obtiene datos dinámicos con respaldo local,
  calcula distancia aproximada y deriva departamentos/productos filtrados.
- `pantallas/CatalogoEmpresaTienda.tsx`: presenta el catálogo del comercio
  seleccionado y emite acciones por callbacks.

## Contrato

El hook recibe comercio, categoría, texto de búsqueda y coordenadas de entrega.
Retorna comercios/productos y resultados derivados. La pantalla no realiza
peticiones ni decide cómo se sincroniza el catálogo.

Al agregar una capacidad de catálogo, mantener su obtención/transformación en el
hook y su presentación en la pantalla; la selección de navegación permanece en
`TiendaPiramidal.tsx`.
