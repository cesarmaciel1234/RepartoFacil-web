# Subcarpeta: Motor Tienda

**Ubicación:** `src/modulos/tienda/motor/`  
**Rol:** Gestión del estado del carrito, cálculo de tarifas estilo Uber/PedidosYa (tarifa base, distancia por km y recargo dinámico en horario pico), generación y persistencia de órdenes de compra.

---

## 1. Qué hace
- Mantiene el carrito de compras del usuario en memoria y sincronizado en `localStorage`.
- Calcula dinámicamente el costo de entrega según la distancia entre la carnicería (`Tucumán 2130, Rosario`) y el domicilio del cliente, contemplando horarios pico de almuerzo y cena.
- Calcula la ganancia neta para el repartidor y el tiempo estimado de entrega.
- Genera el pedido estructurado `#RF-XXXX`, lo persiste localmente y lo sincroniza con Firestore.
- Formatea el mensaje para confirmación vía WhatsApp.

---

## 2. Funciones Principales
- `useCart()`: Hook que expone `cart`, `addToCart()`, `updateQuantity()`, `removeFromCart()`, `clearCart()`, `cartTotal` y `cartItemsCount`.
- `calcularTarifaEnvio(address, forcePeak)`: Algoritmo de tarifas: tarifa base ($1.200) + $450/km con multiplicador de horario pico (1.35x), devolviendo desglose y ganancia neta del repartidor.
- `createOrder(cart, formData, firestore)`: Genera el objeto `OrderData`, persiste en `rf_orders_history` y dispara el evento `rf-orders-updated`.
- `buildWhatsAppLink(order, phoneNumber)`: Genera el link de WhatsApp con el ticket de compra.

---

## 3. Cómo funciona (Flujo interno)
1. Al agregar un producto, `useCart` valida stock y actualiza cantidades.
2. Al ingresar al Checkout y escribir la dirección (ej. "San Lorenzo 2040"), `calcularTarifaEnvio` calcula la distancia (~0.9km) y el costo de envío.
3. Si el subtotal de productos supera los $35.000, el envío se bonifica a $0.
4. Al confirmar, `createOrder` genera el pedido con coordenadas y ganancia del repartidor, y lo guarda en `rf_orders_history`.
5. El evento `rf-orders-updated` despierta la pestaña "Disponibles" del repartidor sin necesidad de recargar la página.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** `TiendaPiramidal.tsx`, `DrawerCarrito.tsx` y `ModalCheckout.tsx`.
- **Va a:** `localStorage` (`rf_cart`, `rf_orders_history`), eventos del DOM (`rf-orders-updated`), API de WhatsApp y Firestore (`orders`).

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Transparencia en el precio:** Todos los subtotales, recargos y envíos deben coincidir con la moneda en pesos argentinos (`es-AR`).
- **Resiliencia offline:** Si la red o Firestore fallan, la orden debe guardarse y emitirse localmente para no interrumpir la experiencia de compra.
