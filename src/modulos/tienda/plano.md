# Plano de Rama: Perfil Tienda (Ecommerce Delivery)

**Ubicación de la rama:** `src/modulos/tienda/`  
**Propósito:** Provee la experiencia completa de compra de carnicería online tipo Rappi / Uber Eats / Mercado Libre para clientes particulares y familias, con catálogo abierto, carrito en tiempo real, motor de tarifas dinámicas por km y horario pico, checkout ágil (pago al entregar) y derivación automática a WhatsApp y al radar de repartidores.

---

## 1. De dónde viene (Entradas / Triggers)
- **Disparador:** Carga inicial de la aplicación web en `src/app/page.tsx` o botón "Volver a la Tienda" desde el Modo Repartidor.
- **Ruta de entrada:** `src/app/page.tsx -> <TiendaPiramidal onSwitchToDriver={...} />`.
- **Parámetros recibidos:** `onSwitchToDriver: () => void`.

---

## 2. Frente (Interfaz Visual)
- **Qué ve el usuario:**
  - Encabezado con logo "RF Reparto Fácil MARKET", indicador de sucursales Frigorífico Maciel, acceso al Modo Repartidor y badge reactivo del carrito.
  - Barra de búsqueda de cortes y carrusel de categorías (Vacuno, Cerdo, Pollo, Achuras, Combos, Carbón).
  - Grilla de tarjetas de productos con fotografía de cortes, badges de ahorro/popularidad y botones de control de cantidad (+/-) optimizados para móviles de 390px.
  - Barra flotante inferior de acceso rápido al carrito cuando hay productos agregados.
  - Drawer lateral deslizable (Sheet) para revisión del carrito con cálculo dinámico de envío gratis (> $35.000).
  - Modal de Checkout con desglose de tarifa estándar estilo Uber/PedidosYa (tarifa base, distancia estimada por km y recargo dinámico en horario pico 1.35x), opciones de entrega y medio de pago (Efectivo al recibir por defecto).
  - Diálogo de confirmación con número de orden `#RF-XXXX` y botón directo para enviar el ticket formateado a WhatsApp.

---

## 3. Fondo (Lógica y Motores)
- **Controlador principal:** `TiendaPiramidal.tsx` coordina los subcomponentes visuales con los motores de negocio.
- **Motores auxiliares:**
  - `motor/useCart.ts`: Gestión del estado del carrito, sincronización reactiva en `localStorage` (`rf_cart`), cálculo de subtotales y cantidades.
  - `motor/tarifaUberService.ts`: Cálculo de tarifas de entrega estilo Uber/PedidosYa: tarifa base ($1.200) + tarifa por distancia ($450/km) + recargo dinámico de horario pico (1.35x) y geocodificación de prueba cercana a la central.
  - `motor/pedidoService.ts`: Generación de órdenes con id único `#RF-XXXX`, almacenamiento en historial (`rf_orders_history`), emisión de eventos en tiempo real (`rf-orders-updated`) y persistencia no bloqueante en Firestore.
- **Flujo de ejecución:**
  1. Paso 1: El usuario agrega productos y `useCart` actualiza el estado y persiste en `localStorage`.
  2. Paso 2: El usuario presiona "Continuar y Pagar", abriendo `ModalCheckout`.
  3. Paso 3: Al ingresar la dirección (ej. San Lorenzo 2040), el motor calcula la distancia y la tarifa de envío en tiempo real.
  4. Paso 4: Al confirmar, `createOrder` genera el pedido `#RF-XXXX` en estado `"Pending"` con las coordenadas y ganancias del repartidor.
  5. Paso 5: La orden impacta inmediatamente en la pestaña "Disponibles" del perfil del repartidor.

---

## 4. A dónde va (Salidas e Impacto)
- **Destino inmediato:** Pantalla de confirmación con enlace directo a WhatsApp.
- **Persistencia:** `localStorage` (`rf_cart`, `rf_customer_data`, `rf_orders_history`) y Firestore (colección `orders`).
- **Integración:** Alimenta en tiempo real la pestaña "Disponibles" del perfil del repartidor.

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Navegación 100% libre:** Nunca bloquear el catálogo ni el carrito con pantallas de login inicial.
- **Moneda y formato:** Todos los precios deben formularse en pesos argentinos (`es-AR`).
- **Modularidad:** Ningún archivo de la rama debe superar las 500 líneas.
