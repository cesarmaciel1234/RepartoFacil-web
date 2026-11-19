# Subcarpeta: Motor Repartidor

**Ubicación:** `src/modulos/repartidor/motor/`  
**Rol:** Lógica de asignación de pedidos, cálculo de conveniencia (ganancias, distancias al market y al cliente), seguimiento GPS, geocerca de seguridad de 100m y administración de la cartera/billetera del repartidor.

---

## 1. Qué hace
- Provee la fuente de datos unificada de pedidos disponibles con métricas estándar Uber / PedidosYa.
- Administra la geolocalización continua (`navigator.geolocation.watchPosition`) y el rumbo del repartidor.
- Ejecuta las transiciones de estado de las órdenes (`Pending` -> `Assigned` -> `Delivered`).
- Acredita automáticamente los ingresos de cada reparto a la Cartera (`DriverWallet`) al confirmar entrega.
- Gestiona la sesión ágil del conductor (`DriverProfile`) sin forzar pantallas de inicio bloqueantes.

---

## 2. Funciones y Clases Principales
- `useDriverOrders(driverId)`: Hook maestro que combina pedidos de Firestore y de `localStorage`, expone `handleTakeOrder()`, `handleCompleteDelivery()` y `wallet`, y administra el disparador del modal de identificación.
- `useDriverGps(driverId)`: Hook de geolocalización de alta precisión para el trazado de ruta en el mapa interactivo.
- `assignOrderToDriver(orderId, driverId, firestore)`: Asigna la orden al repartidor y persiste el cambio atómicamente.
- `completeOrderDelivery(orderId, firestore)`: Marca la orden como `"Delivered"` y acredita inmediatamente la ganancia del viaje en `rf_driver_wallet`.
- `loadDriverWallet()` y `creditDeliveryEarning(orderId, earning, cashCollected)`: Administra el saldo disponible y efectivo retenido en la billetera.
- `loadDriverProfile()` y `saveDriverProfile(profile)`: Manejo ágil del usuario conductor en `localStorage`.

---

## 3. Cómo funciona (Flujo interno)
1. Al cargar el modo repartidor, `useDriverOrders` lee `rf_orders_history` y `rf_driver_wallet`.
2. El repartidor explora los pedidos con su ganancia neta estimada (`+$2.450`), distancia al market (`0.8 km`) y al cliente (`1.4 km`).
3. Al presionar "Aceptar Pedido":
   - Si no hay sesión iniciada, guarda la orden en `pendingAcceptOrder` y abre `ModalDriverAuth`.
   - Si está identificado, llama inmediatamente a `assignOrderToDriver()`.
4. La orden pasa a "Mi Ruta". El repartidor inicia la simulación GPS o navegación real.
5. Al llegar a menos de 100 metros del destino (`<=100m`), se activa el botón de entrega.
6. Al pulsar "Confirmar Entrega", se ejecuta `completeOrderDelivery()`, elevando el saldo de la cartera instantáneamente.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** Componentes UI del repartidor (`TabPedidosDisponibles`, `TabMiRuta`, `ModalCarteraRepartidor`, `DriverTopBar`).
- **Va a:** Persistencia en `localStorage` (`rf_orders_history`, `repartofacil_user`, `rf_driver_wallet`), eventos del DOM (`rf-wallet-updated`) y Firestore (`orders`, `driverProfiles`).

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Visualización abierta:** El repartidor DEBE poder ver todos los pedidos, rutas, ítems y montos antes de iniciar sesión.
- **Geocerca 100m:** La confirmación de entrega no se puede efectuar a más de 100 metros del destino.
- **Acreditación en Cartera:** Cada entrega exitosa debe reflejarse en tiempo real en la cartera.
