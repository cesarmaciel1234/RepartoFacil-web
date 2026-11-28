# Motor de Tienda (`src/modulos/tienda/motor/`)

## 1. Qué hace
Cerebro de la experiencia de compra: gestión de carrito, tarifas de envío, geocodificación de distancias de comercios, perfiles de comprador y checkout.

## 2. De dónde viene
Invocado por vistas y componentes de `src/modulos/tienda/ui/` (`ModalCheckout`, `DrawerCarrito`, `TiendaPiramidal`, `VistaMercadosEmpresas`).

## 3. Archivos y funciones
- **`useCompanyDistances.ts`**: Geocodificación asíncrona de comercios mediante Nominatim, control de tasa y cálculo de distancias Haversine con caché local.
- **`pedidoService.ts`**: Fachada que re-exporta los servicios modulares de pedidos sin romper importaciones.
- **`customerProfileService.ts`**: Gestión de datos de cliente, persistencia local y registro automático de invitados.
- **`orderCreationService.ts`**: Validación de carrito, asignación de tenencia, cálculo de envíos y POST hacia `/api/orders`.
- **`whatsappMessageService.ts`**: Formateo de mensajes y enlace de WhatsApp con el detalle del pedido.
- **`tarifaUberService.ts`**: Cálculo de distancias (Haversine) y tarifas dinámicas por horario pico.
- **`useCart.ts`**: Hook reactivo del carrito de compras con persistencia local.

## 4. Hacia dónde sale
Hacia los endpoints `/api/orders`, `/api/auth/register`, `/api/db/clients` y el almacenamiento local.
