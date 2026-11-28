# Interfaz de Tienda (`src/modulos/tienda/ui/`)

## 1. Qué hace
Componentes visuales puros (Cara) para navegación, catálogo, carrito, checkout y modales de la tienda web.

## 2. De dónde viene
Montado por `TiendaPiramidal.tsx` y sub-pantallas del comprador.

## 3. Componentes Principales
- `TiendaActiveTabContent.tsx`: Sub-enrutador visual desacoplado para pestañas activas y vista de comercio.
- `ModalCheckout.tsx`: Diálogo de checkout (< 300 líneas) que delega su estado a `useModalCheckoutState`.
- `HeaderTienda.tsx`, `NavegacionTienda.tsx`, `BotonCarritoFlotante.tsx`: Barras de navegación superior, inferior y botón flotante.
- `DrawerCarrito.tsx`: Carrito lateral deslizable por comercio.
- `VistaMercadosEmpresas.tsx`, `EmpresaCard.tsx`: Explorador y tarjetas de comercios.
- `TiendaModalesContainer.tsx`: Contenedor modular de modales, sheets y diálogos.

## 4. Hacia dónde sale
Renderizado en el DOM para la interacción visual del usuario final.
