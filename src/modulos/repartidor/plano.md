# Plano de Rama: Perfil Repartidor (Logística y Reparto)

**Ubicación de la rama:** `src/modulos/repartidor/`  
**Propósito:** Proporciona la interfaz operativa completa para el repartidor/motomensajero: geolocalización en mapa interactivo Leaflet, visualización abierta de pedidos disponibles, toma de pedidos con identificación ágil justa a tiempo, trazado de rutas y copiloto IA de asistencia.

---

## 1. De dónde viene (Entradas / Triggers)
- **Disparador:** Botón "Modo Repartidor" desde el encabezado de la tienda o alternancia en `src/app/page.tsx`.
- **Ruta de entrada:** `src/app/page.tsx -> <RepartidorPiramidal onSwitchToStore={...} />`.
- **Parámetros recibidos:** `onSwitchToStore: () => void`.

---

## 2. Frente (Interfaz Visual)
- **Qué ve el usuario:**
  - Barra superior fija con estado GPS en vivo, botón de regreso inmediato a la Tienda, acceso al Copiloto IA ("Copo") y menú de conductor.
  - Mapa interactivo de pantalla completa (Leaflet) con radar de pedidos y posición del móvil en tiempo real.
  - Botones flotantes para centrado rápido del mapa y modo navegación.
  - Panel táctil inferior deslizable (Sheet) con 3 pestañas:
    - **"Disponibles":** Listado de pedidos listos para entrega con km estimados, tiempo, cortes y botón verde "Aceptar Pedido".
    - **"Mi Ruta":** Entregas activas asignadas con acceso de un toque a llamada telefónica del cliente, navegación externa en Google Maps/Waze y botón "Marcar Entregado".
    - **"Alertas":** Estado del tráfico y avisos de entrega.
  - Diálogo modal de identificación rápida (`ModalDriverAuth`) que solicita nombre y vehículo (Moto, Bici, Auto).
  - Sheet del asistente de IA `DriverCopilotSheet` para optimización de ruta.
- **Qué NO pinta:** Pantallas de bloqueo inicial o login obligatorio que impidan ver el mapa y los pedidos.

---

## 3. Fondo (Lógica y Motores)
- **Controlador principal:** `RepartidorPiramidal.tsx` orquesta la interacción entre el mapa y el panel táctil.
- **Motores auxiliares:**
  - `motor/useDriverOrders.ts`: Unifica los pedidos de Firestore y `localStorage`, expone `handleTakeOrder()` y `handleCompleteDelivery()`, y reacciona al evento `rf-orders-updated`.
  - `motor/useDriverGps.ts`: Monitorea la posición del GPS con `navigator.geolocation.watchPosition` de alta precisión.
  - `motor/driverService.ts`: Persiste las asignaciones en `rf_orders_history` y `repartofacil_user`, y contiene `DEFAULT_AVAILABLE_ORDERS` para garantizar operatividad sin conexión.
- **Flujo de ejecución:**
  1. Paso 1: El conductor ingresa al modo y visualiza el mapa y los pedidos disponibles sin restricciones.
  2. Paso 2: Al tocar "Aceptar Pedido":
     - Si no está identificado, se despliega `ModalDriverAuth`.
     - Si ya está identificado, se invoca `assignOrderToDriver()`.
  3. Paso 3: La orden pasa a estado `"Assigned"` y se mueve a la pestaña "Mi Ruta".
  4. Paso 4: El repartidor viaja, se comunica con el cliente o usa la navegación GPS externa.
  5. Paso 5: Al completar la entrega, pulsa "Marcar Entregado" y la orden pasa a `"Delivered"`.

---

## 4. A dónde va (Salidas e Impacto)
- **Destino inmediato:** Trazado de ruta en el mapa y pestaña "Mi Ruta".
- **Persistencia:** `localStorage` (`rf_orders_history`, `repartofacil_user`) y Firestore (`orders`, `driverProfiles`).
- **Impacto exterior:** Llamadas a clientes vía `tel:` y navegación en apps externas vía `google.com/maps`.

---

## 5. Modo Offline y Resiliencia
- **Blindaje total:** Las órdenes predeterminadas (`DEFAULT_AVAILABLE_ORDERS`) garantizan que el repartidor nunca vea una pantalla vacía ni sufra caídas por falta de servidor o señal de internet.
- **Tolerancia a fallos:** Las llamadas a Firestore y APIs externas no bloquean la interfaz; si la red falla, la asignación y la entrega se completan limpiamente en local.

---

## 6. Qué NO romper (Invariantes Sagrados)
- **Libertad de visualización:** Ver pedidos disponibles y explorar el mapa debe ser 100% público y libre.
- **Autenticación diferida:** Solo pedir nombre y vehículo al momento de presionar "Aceptar Pedido".
- **Modularidad:** Todo archivo del módulo debe mantenerse por debajo de las 250 líneas (máximo del proyecto: 500-700 líneas).
