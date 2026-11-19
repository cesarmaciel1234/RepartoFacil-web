# Subcarpeta: Motor Tienda

**Ubicación:** `src/modulos/tienda/motor/`  
**Rol:** Núcleo de lógica comercial, gestión de carrito y persistencia de pedidos para la tienda online.

---

## 1. Qué hace
Gestiona el estado reactivo del carrito de compras del usuario, realiza cálculos de totales y costos de envío según el monto de la compra, almacena y recupera los datos del cliente en `localStorage`, y despacha las órdenes generadas tanto a nivel local (para que los repartidores las tomen de inmediato) como al backend/Firestore de forma no bloqueante.

---

## 2. Funciones y Clases Principales
- `useCart()`: Hook React para agregar productos, ajustar cantidades, eliminar ítems y calcular subtotales y cantidades en tiempo real.
- `createOrder(cart, form, firestore)`: Genera un objeto `OrderData` con id único `#RF-XXXX`, lo persiste en `localStorage` (`rf_orders_history`), dispara el evento `rf-orders-updated` y envía la orden a la nube.
- `loadSavedCustomer()` y `saveCustomerData(form)`: Recupera y persiste automáticamente el nombre, WhatsApp y dirección del comprador para futuras compras.
- `buildWhatsAppLink(order, phone)`: Genera el enlace directo a WhatsApp con el formato profesional argentino y el detalle completo del pedido para el frigorífico.

---

## 3. Cómo funciona (Flujo interno)
1. El usuario interactúa con los productos y `useCart` actualiza el array `cart`.
2. Ante cada modificación, se sincroniza silenciosamente con `localStorage` (`rf_cart`).
3. Al proceder al checkout y confirmar datos, `createOrder()` ensambla la estructura completa del pedido.
4. Se inyecta la orden en `rf_orders_history` con estado `"Pending"`.
5. Si la conexión o base de datos falla, el pedido queda 100% resguardado localmente y el cliente recibe su confirmación y botón de WhatsApp de inmediato.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** Componentes UI de la tienda (`TarjetaProducto`, `DrawerCarrito`, `ModalCheckout`).
- **Va a:** Persistencia en `localStorage`, eventos del navegador (`CustomEvent`), Firestore (colección `orders`) y la API de WhatsApp (`wa.me`).

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Cero bloqueos:** La navegación y el uso del carrito deben ser 100% anónimos y libres; nunca pedir login para ver productos o cargar ítems.
- **Formato argentino:** Todos los montos deben respetar la notación en pesos (`es-AR`).
- **Resiliencia offline:** Si no hay internet o falla el endpoint `/api/db/`, `createOrder` no debe arrojar error fatal; debe completar la orden en local.
