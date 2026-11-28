# Módulo de Menú Lateral (`src/components/sidebar/`)

## 1. Qué hace
Gestiona el menú lateral desplegable global (estilo DiDi / PedidosYa), alternando fluidamente entre la experiencia de trabajo del repartidor y los accesos rápidos del comprador.

## 2. De dónde viene
- Invocado por `src/components/SidebarGeneral.tsx` y montado en `RepartidorPiramidal` y la tienda.
- Recibe perfiles desde `driverService.ts` y eventos nativos `window.repartofacil-*`.

## 3. Subdirectorios y Archivos
- `hooks/useSidebarAuth.ts`: Hook que sincroniza perfiles de conductor/cliente, maneja desconexión en `/api/orders/custodio` y limpieza de caché PWA.
- `ui/SidebarHeader.tsx`: Cabecera de usuario con avatar, nombre, badge de rol y botones para inicio de sesión rápido.
- `ui/SidebarDriverView.tsx`: Vista exclusiva de repartidor: tarjeta de ganancias disponibles, cuadrícula 6-herramientas y ficha de vehículo.
- `ui/SidebarStoreView.tsx`: Vista exclusiva de cliente: pedidos, billetera, mercados, ofertas y enlace para conectarse como repartidor.
- `ui/SidebarFooter.tsx`: Pie con indicador de versión, recarga forzada de caché PWA y botón de cierre de sesión.

## 4. Hacia dónde sale
- Renderizado dentro de `<SheetContent>` en `SidebarGeneral.tsx`. Dispara eventos de autenticación y redirecciones a Cobro Fácil o WhatsApp de soporte.
