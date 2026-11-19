# Subcarpeta: Motor Repartidor

**Ubicación:** `src/modulos/repartidor/motor/`  
**Rol:** Lógica de datos, sincronización y servicios para el perfil del repartidor: órdenes locales y de nube, estado de ruta, geocodificación y billetera virtual en tiempo real.

---

## 1. Qué hace
- Provee los contratos de datos en `tipos.ts` (DriverOrder, DriverProfile, OrderStatus, DriverWallet, WalletTransaction).
- Persiste y actualiza las asignaciones de pedidos en `driverService.ts` (`rf_orders_history`).
- Maneja la cartera del repartidor en `walletService.ts` (`rf_driver_wallet`), sumando ganancias netas acreditadas, registrando efectivo cobrado y emitiendo el evento reactivo `rf-wallet-updated`.
- Proporciona el hook `useDriverOrders.ts` para unificar órdenes locales y de Firestore, exponiendo `handleTakeOrder()`, `handleCompleteDelivery()` y `wallet`.
- Proporciona el hook `useDriverGps.ts` para seguimiento por geolocalización del navegador.

---

## 2. Componentes y Funciones Principales
- `tipos.ts`: Define las interfaces de órdenes con métricas Uber (`driverEarnings`, `distanceToStoreKm`, `distanceToDeliveryKm`, `destinationCoords`), perfiles y billetera (`DriverWallet`).
- `driverService.ts`:
  - `loadLocalOrders()` / `saveLocalOrders()`: Persistencia en `localStorage` con fallback a `DEFAULT_AVAILABLE_ORDERS`.
  - `assignOrderToDriver(orderId, driverId)`: Pasa la orden a `"Assigned"`.
  - `completeOrderDelivery(orderId)`: Pasa la orden a `"Delivered"`, calcula la ganancia y llama a `creditDeliveryEarning()`.
- `walletService.ts`:
  - `loadDriverWallet()` / `saveDriverWallet()`: Persistencia reactiva de la cartera (`rf_driver_wallet`).
  - `creditDeliveryEarning(orderId, earningAmount, cashCollected)`: Acredita la ganancia y registra el efectivo recibido.
- `useDriverOrders.ts`: Hook reactivo que escucha eventos `rf-orders-updated` y `rf-wallet-updated`.
- `useDriverGps.ts`: Hook para telemetría GPS con `navigator.geolocation.watchPosition`.

---

## 3. Cómo funciona (Flujo paso a paso)
1. `useDriverOrders` carga las órdenes iniciales y la billetera mediante `walletService`.
2. Al tomar un pedido, `assignOrderToDriver` actualiza el estado a `"Assigned"` y emite `rf-orders-updated`.
3. Al entregar el pedido, `completeOrderDelivery` marca el estado como `"Delivered"`, llama a `creditDeliveryEarning`, suma la ganancia al balance y emite `rf-wallet-updated`.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** Acciones del usuario en `RepartidorPiramidal.tsx` y subcomponentes UI (`TabMiRuta`, `TabPedidosDisponibles`).
- **Va a:** `localStorage` (`rf_orders_history`, `rf_driver_wallet`) y Firestore (`orders`).

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Persistencia atómica:** Siempre actualizar la orden y la cartera de forma sincronizada.
- **Eventos reactivos:** Emitir `rf-wallet-updated` y `rf-orders-updated` para actualización instantánea sin recarga.
