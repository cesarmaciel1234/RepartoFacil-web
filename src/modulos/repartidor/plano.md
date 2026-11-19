# Plano de Rama: Perfil Repartidor (Logística y Reparto)

**Ubicación de la rama:** `src/modulos/repartidor/`  
**Propósito:** Proporciona la interfaz operativa completa para el repartidor/motomensajero con estándar estilo Uber Eats / PedidosYa: geolocalización en mapa interactivo Leaflet, visualización de métricas de conveniencia (distancia a market, distancia a entrega, ganancia estimada y cobro en efectivo), toma de pedidos con identificación ágil justa a tiempo, simulación de navegación GPS en marcha, geocerca de seguridad de 100 metros para entrega, y cartera/billetera con acreditación en vivo de ingresos.

---

## 1. De dónde viene (Entradas / Triggers)
- **Disparador:** Botón "Modo Repartidor" desde el encabezado de la tienda o alternancia en `src/app/page.tsx`.
- **Ruta de entrada:** `src/app/page.tsx -> <RepartidorPiramidal onSwitchToStore={...} />`.
- **Parámetros recibidos:** `onSwitchToStore: () => void`.

---

## 2. Frente (Interfaz Visual)
- **Qué ve el usuario:**
  - Barra superior fija con estado GPS en vivo, botón de Cartera (`💼 $X.XXX`), botón de regreso inmediato a la Tienda, acceso al Copiloto IA ("Copo") y menú de conductor.
  - Mapa interactivo de pantalla completa (Leaflet) con radar de pedidos y posición del móvil en tiempo real.
  - Botones flotantes para centrado rápido del mapa y modo navegación.
  - Panel táctil inferior deslizable (Sheet) con 3 pestañas:
    - **"Disponibles":** Tarjetas estilo Uber con ganancia neta destacada (`+$X.XXX`), badge de tarifa dinámica pico (`⚡ 1.35x`), desglose dual (distancia al market + distancia al domicilio), aviso de cobro en efectivo en mano (`💵 Cobrar en efectivo al cliente`) y botón "Aceptar Pedido".
    - **"Mi Ruta":** Entregas activas asignadas con simulación en marcha GPS (`🚀 Simular en Marcha`), velocímetro en tiempo real (km/h), distancia restante en metros y **regla de geocerca de 100m** (botón de entrega bloqueado a >100m y habilitado con animación verde brillante a <=100m).
    - **"Alertas":** Estado del tráfico y avisos de entrega.
  - Diálogo modal de identificación rápida (`ModalDriverAuth`) que solicita nombre y vehículo (Moto, Bici, Auto).
  - Modal de Cartera de Repartidor (`ModalCarteraRepartidor`) con ganancias netas, efectivo cobrado en mano y movimientos recientes.
  - Sheet del asistente de IA `DriverCopilotSheet` para optimización de ruta.

---

## 3. Fondo (Lógica y Motores)
- **Controlador principal:** `RepartidorPiramidal.tsx` orquesta la interacción entre el mapa y el panel táctil.
- **Motores auxiliares:**
  - `motor/useDriverOrders.ts`: Unifica los pedidos de Firestore y `localStorage`, expone `handleTakeOrder()`, `handleCompleteDelivery()` y `wallet`, y reacciona al evento `rf-orders-updated` y `rf-wallet-updated`.
  - `motor/driverService.ts`: Persiste las asignaciones en `rf_orders_history` y ejecuta `completeOrderDelivery()`.
  - `motor/walletService.ts`: Administra `rf_driver_wallet`, acreditando las ganancias y registrando efectivo en mano.
  - `motor/useDriverGps.ts`: Monitorea la posición del GPS con `navigator.geolocation.watchPosition` de alta precisión.
- **Flujo de ejecución:**
  1. Paso 1: El conductor ingresa y visualiza pedidos con ganancias y distancias sin restricciones.
  2. Paso 2: Al tocar "Aceptar Pedido" (con identificación justa a tiempo), la orden pasa a "Mi Ruta".
  3. Paso 3: En "Mi Ruta", se activa el simulador GPS en marcha. La distancia se reduce progresivamente.
  4. Paso 4: A menos de 100 metros del domicilio, el botón "Confirmar Entrega" se desbloquea.
  5. Paso 5: Al pulsar "Confirmar Entrega", la orden pasa a `Delivered` y el saldo de la cartera se eleva inmediatamente.

---

## 4. A dónde va (Salidas e Impacto)
- **Destino inmediato:** Trazado de ruta en el mapa, pestaña "Mi Ruta" y Cartera de Repartidor.
- **Persistencia:** `localStorage` (`rf_orders_history`, `repartofacil_user`, `rf_driver_wallet`) y Firestore (`orders`, `driverProfiles`).

---

## 5. Qué NO romper (Invariantes Sagrados)
1. **Acceso Abierto Inicial:** Nunca bloquear la pantalla del repartidor con un login previo.
2. **Geocerca de 100 metros:** No permitir confirmar entrega si la distancia GPS simulada/real supera los 100 metros.
3. **Elevación de Cartera:** Cada entrega exitosa debe impactar en el saldo de la cartera en tiempo real.
4. **Límite de líneas:** Ningún archivo debe exceder las 500 líneas de código.
