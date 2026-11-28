# Motor de Tienda (`src/modulos/tienda/motor/`)

## 1. Qué hace
Cerebro de la experiencia de compra: gestión de carrito, cálculo de catálogo reactivo, tarifas de envío, geocodificación de comercios y orquestación de checkout.

## 2. De dónde viene
Invocado por vistas y orquestadores en `src/modulos/tienda/` (`TiendaPiramidal`, `ModalCheckout`, `DrawerCarrito`).

## 3. Archivos y funciones
- `useTiendaCatalogoState.ts`: Hook reactivo que calcula el catálogo por empresa, departamentos y carritos agrupados.
- `useModalCheckoutState.ts`: Lógica de validación, tarifa y envío de formulario de checkout desacoplada de la UI.
- `useCompanyDistances.ts`: Geocodificación asíncrona y cálculo Haversine con caché local.
- `useCart.ts`: Hook reactivo del carrito de compras con persistencia local.
- `orderCreationService.ts`: Validación de carrito, asignación de empresa/sucursal y POST a `/api/orders`.
- `tarifaUberService.ts`: Cálculo de distancias y tarifas dinámicas por horario.
- `customerProfileService.ts`: Persistencia de cliente y datos para pedidos recurrentes.

## 4. Hacia dónde sale
Hacia los endpoints `/api/orders`, `/api/auth/register`, `/api/db/clients` y el almacenamiento local.
