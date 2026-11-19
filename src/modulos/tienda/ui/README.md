# Subcarpeta: UI Tienda

**Ubicación:** `src/modulos/tienda/ui/`  
**Rol:** Componentes visuales de la tienda de carnicería online para clientes finales: encabezado, filtros, tarjetas de cortes, drawer de carrito y modal de checkout.

---

## 1. Qué hace
- Proporciona la interfaz de navegación de productos (cortes vacunos, cerdo, achuras, combos, carbón).
- Muestra el carrito con cálculo de envío gratis y botón de pago.
- Despliega el formulario de checkout con cálculo de tarifa dinámica en tiempo real y selección de medio de pago (Efectivo al recibir por defecto).
- Ofrece la confirmación del pedido con código de tracking `#RF-XXXX` y enlace directo a WhatsApp.

---

## 2. Componentes Principales
- `HeaderTienda.tsx`: Barra superior con logo Frigorífico Maciel, selector de sucursales, botón para cambiar a Modo Repartidor y badge reactivo del carrito.
- `FiltroCategorias.tsx`: Carrusel horizontal de categorías para filtrado rápido.
- `TarjetaProducto.tsx`: Tarjetas de productos cárnicos optimizadas para pantallas de 390px, con fotos sin roturas, precios por kg y botones de cantidad.
- `DrawerCarrito.tsx`: Panel lateral desplegable con lista de compras, barra de progreso para envío gratis ($35.000) y acceso a checkout.
- `ModalCheckout.tsx`: Modal con desglose de tarifa estilo Uber/PedidosYa, datos del cliente, método de pago en efectivo y diálogo de confirmación.

---

## 3. Cómo funciona (Flujo visual)
1. El usuario navega y agrega cortes al carrito desde `TarjetaProducto`.
2. Presiona la barra flotante inferior o el botón del encabezado para abrir `DrawerCarrito`.
3. Toca "Continuar y Pagar", abriendo `ModalCheckout`.
4. Ingresa su dirección y visualiza el desglose transparente de tarifa (base + km + horario pico).
5. Confirma el pedido en efectivo y recibe su número `#RF-XXXX` con botón de WhatsApp.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** `TiendaPiramidal.tsx` y hooks `useCart`.
- **Va a:** Llamadas al servicio de pedidos y almacenamiento local.

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Cero bloqueo:** No exigir login para explorar o agregar al carrito.
- **Responsividad móvil:** No generar scroll horizontal en pantallas de 390px.
