# Subcarpeta: UI Repartidor

**Ubicación:** `src/modulos/repartidor/ui/`  
**Rol:** Componentes visuales de la interfaz de repartidor: barra de navegación, pestañas deslizables, radar de pedidos, hoja de chat y diálogos modales.

---

## 1. Qué hace
- Renderiza la barra superior de conductor con estado del GPS, saldo de cartera y accesos rápidos (`DriverTopBar.tsx`).
- Muestra el listado de pedidos disponibles (`TabPedidosDisponibles.tsx`) y ruta activa (`TabMiRuta.tsx`).
- Maneja pestañas del bottom sheet (`RepartidorSheetTabs.tsx`) y modales (`RepartidorModals.tsx`).
- Conversaciones autorizadas (`CentroMensajeriaDriverSheet.tsx`, `OrderChatSheet.tsx`, `OrderChatHeader.tsx`, `OrderChatMessageList.tsx`, `DriverCopilotSheet.tsx`).
- Contenedor base PWA (`RepartidorPwaLayout.tsx`).

## 2. Hacia dónde sale
- Renderizado visual montado por `RepartidorPiramidal.tsx` en el navegador del repartidor.
