# Subcarpeta: Motor Repartidor

**Ubicación:** `src/modulos/repartidor/motor/`  
**Rol:** Lógica de asignación de pedidos, seguimiento GPS en tiempo real y persistencia del estado de ruta del conductor.

---

## 1. Qué hace
- Provee la fuente de datos unificada de pedidos disponibles (con órdenes de muestra precargadas para resiliencia offline).
- Administra la geolocalización continua (`navigator.geolocation.watchPosition`) y el rumbo del repartidor.
- Ejecuta las transiciones de estado de las órdenes (`Pending` -> `Assigned` -> `Delivered`).
- Gestiona la sesión ágil del conductor (`DriverProfile`) sin forzar pantallas de inicio bloqueantes.

---

## 2. Funciones y Clases Principales
- `useDriverOrders(driverId)`: Hook maestro que combina pedidos de Firestore y de `localStorage`, expone `handleTakeOrder()` y `handleCompleteDelivery()`, y administra el disparador del modal de identificación.
- `useDriverGps(driverId)`: Hook de geolocalización de alta precisión para el trazado de ruta en el mapa interactivo.
- `assignOrderToDriver(orderId, driverId, firestore)`: Asigna la orden al repartidor y persiste el cambio atómicamente.
- `updateOrderStatus(orderId, status, firestore)`: Cambia el estado a entregado o cancelado.
- `loadDriverProfile()` y `saveDriverProfile(profile)`: Manejo ágil del usuario conductor en `localStorage`.

---

## 3. Cómo funciona (Flujo interno)
1. Al cargar el modo repartidor, `useDriverOrders` lee `rf_orders_history`. Si no hay órdenes previas, se inicializan automáticamente con `DEFAULT_AVAILABLE_ORDERS`.
2. El repartidor explora todos los pedidos disponibles con libertad total.
3. Al presionar "Aceptar Pedido":
   - Si no hay sesión iniciada, guarda la orden en `pendingAcceptOrder` y abre `ModalDriverAuth`.
   - Si está identificado, llama inmediatamente a `assignOrderToDriver()`.
4. La orden pasa a "Mi Ruta" y se notifica al usuario con un Toast de confirmación.
5. Al entregar, se marca como `"Delivered"`, liberando la ruta activa.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** Componentes UI del repartidor (`TabPedidosDisponibles`, `TabMiRuta`, `ModalDriverAuth`).
- **Va a:** Persistencia en `localStorage` (`rf_orders_history`, `repartofacil_user`), API de geolocalización del navegador y Firestore (`orders`, `driverProfiles`).

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Visualización abierta:** El repartidor DEBE poder ver todos los pedidos, rutas, ítems y montos antes de iniciar sesión.
- **Identificación justa a tiempo:** El diálogo de identificación solo debe abrirse cuando el usuario pulsa "Aceptar Pedido".
- **Resiliencia:** Si la base de datos externa o el servidor local están desconectados, el flujo completo debe continuar funcionando en local.
