# Subcarpeta: Pantallas de Tienda (`src/modulos/tienda/pantallas`)

## 1. Qué hace
Contiene las vistas principales que se presentan al comprador según la pestaña activa de navegación.

## 2. De dónde viene
- Selecciones de navegación en `NavegacionTienda.tsx` orquestadas por `TiendaPiramidal.tsx`.

## 3. Archivos principales
- `PerfilCliente.tsx`: Muestra datos personales, dirección de entrega, botón de acceso/cierre de sesión del comprador y acceso a "Conectarse como repartidor" (disponible tanto para invitados como para compradores logueados).
- `InicioTienda.tsx`: Feed principal de productos, banners y comercios.
- `SupermercadosTienda.tsx`: Lista de mercados y comercios adheridos.
- `PromocionesTienda.tsx`: Ofertas y descuentos destacados.
- `HistorialPedidosTienda.tsx`: Lista de pedidos en curso e historial del comprador.
- `tipos.ts`: Tipos locales de pantalla.

## 4. Hacia dónde sale
Hacia `TiendaPiramidal.tsx` y los modales de autenticación y checkout.
