# Subcarpeta: Motor Repartidor

**Ubicación:** `src/modulos/repartidor/motor/`  
**Rol:** Lógica de datos, sincronización y servicios para el perfil del repartidor: órdenes locales y de nube, telemetría y orientación fusionada, geocodificación, presencia y billetera virtual en tiempo real.

---

## 1. Qué hace
- Provee los contratos de datos en `tipos.ts` (DriverOrder, DriverProfile, OrderStatus, DriverWallet, WalletTransaction, TelemetryState, HeadingSource).
- Persiste pedidos locales en `driverService.ts` (`rf_orders_history`).
- `driverPendingActions.ts` guarda por repartidor y pedido las asignaciones y entregas pendientes, reintentando sincronización con Web Locks.
- `useDriverPresence.ts` gestiona la prueba de vida, heartbeat telemétrico a `/api/orders/custodio`, screen wake lock y permisos de notificación nativa.
- `useBottomSheetDrag.ts` encapsula la física de arrastre táctil y ratón para el panel inferior.
- `useOrderChat.ts` sincroniza mensajes del pedido con la nube, gestiona caché local, scroll automático y despacho de lectura.
- Maneja la cartera del repartidor en `walletService.ts` (`rf_driver_wallet`).
- `useDriverOrders.ts` unifica órdenes locales y remotas.
- Telemetría y orientación fusionada (`telemetryEngine.ts` & `useDriverGps.ts`).

## 2. Salida
- Hacia la interfaz visual (`../ui/`), endpoints del VPS (`/api/orders/custodio`) y estado persistido en `localStorage`.
