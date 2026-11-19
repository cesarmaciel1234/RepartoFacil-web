# Plano de Rama: Perfil Tienda (Ecommerce Delivery)

**Ubicación de la rama:** `src/modulos/tienda/`  
**Propósito:** Provee la experiencia completa de compra de carnicería online tipo Rappi / Uber Eats / Mercado Libre para clientes particulares y familias, con catálogo abierto, carrito en tiempo real, checkout y derivación automática a WhatsApp y al radar de repartidores.

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
  - Grilla de tarjetas de productos con fotografía de cortes, badges de ahorro/popularidad y botones de control de cantidad (+/-).
  - Barra flotante inferior de acceso rápido al carrito cuando hay productos agregados.
  - Drawer lateral deslizable (Sheet) para revisión del carrito con cálculo dinámico de envío gratis (> $30.000).
  - Modal de Checkout para captura ágil de datos de contacto (Nombre, WhatsApp, Dirección de entrega o Sucursal para retiro) y medio de pago.
  - Diálogo de confirmación con número de orden `#RF-XXXX` y botón directo para enviar el ticket formateado a WhatsApp.
- **Estados visuales:** Indicadores de stock, badges destacados, toasts de confirmación al añadir productos.
- **Qué NO pinta:** Formularios de registro o login previo para poder ver productos o armar el carrito.

---

## 3. Fondo (Lógica y Motores)
- **Controlador principal:** `TiendaPiramidal.tsx` coordina los subcomponentes visuales con los motores de negocio.
- **Motores auxiliares:**
  - `motor/useCart.ts`: Gestión del estado del carrito, sincronización reactiva en `localStorage` (`rf_cart`), cálculo de subtotales y cantidades.
  - `motor/pedidoService.ts`: Generación de órdenes con id único `#RF-XXXX`, almacenamiento en historial (`rf_orders_history`), emisión de eventos en tiempo real (`rf-orders-updated`) y persistencia no bloqueante en Firestore.
- **Flujo de ejecución:**
  1. Paso 1: El usuario agrega productos y `useCart` actualiza el estado y persiste en `localStorage`.
  2. Paso 2: El usuario presiona "Continuar y Pagar", abriendo `ModalCheckout`.
  3. Paso 3: Al completar datos y confirmar, `createOrder` genera el pedido `#RF-XXXX` en estado `"Pending"`.
  4. Paso 4: La orden queda registrada de inmediato para los repartidores en `rf_orders_history` y en Firestore.
  5. Paso 5: Se muestra la pantalla de éxito con el enlace a WhatsApp listo para enviar.

---

## 4. A dónde va (Salidas e Impacto)
- **Destino inmediato:** Pantalla de confirmación con enlace directo a WhatsApp.
- **Persistencia:** `localStorage` (`rf_cart`, `rf_customer_data`, `rf_orders_history`) y Firestore (colección `orders`).
- **Integración:** Alimenta en tiempo real la pestaña "Disponibles" del perfil del repartidor.

---

## 5. Modo Offline y Resiliencia
- **Blindaje ante corte de conexión:** Todo el catálogo y el carrito funcionan de manera 100% offline.
- **Fallback de red:** Si las llamadas a `/api/db/` o Firestore fallan, la orden se guarda localmente en `rf_orders_history`, asegurando que no se pierdan compras ni se interrumpa el flujo del cliente.
- **Recuperación:** Los datos del cliente se guardan en el dispositivo para autocompletar futuros pedidos.

---

## 6. Qué NO romper (Invariantes Sagrados)
- **Navegación 100% libre:** Nunca bloquear el catálogo ni el carrito con pantallas de login inicial.
- **Moneda y formato:** Todos los precios deben formularse en pesos argentinos (`es-AR`).
- **Modularidad:** Ningún archivo de la rama debe superar las 300 líneas (límite del proyecto: 500-700 líneas).
