# Subcarpeta: UI Tienda

**Ubicación:** `src/modulos/tienda/ui/`  
**Rol:** Componentes de la interfaz visual de la carnicería online: encabezado, categorías, tarjetas de productos con control de cantidades, drawer del carrito y modal de checkout.

---

## 1. Qué hace
- Provee la navegación y presentación del catálogo de carnes y combos.
- Muestra el estado del carrito de compras y permite modificar cantidades con controles táctiles.
- Despliega el formulario de checkout con cálculo automático de envíos según la dirección ingresada y selector de medios de pago.
- Presenta el diálogo de éxito tras la confirmación de la orden.

---

## 2. Componentes Principales
- `HeaderTienda.tsx`: Encabezado con logo, selector de sucursal, acceso directo a Modo Repartidor y badge del carrito.
- `FiltroCategorias.tsx`: Barra de categorías deslizable horizontalmente.
- `TarjetaProducto.tsx`: Tarjeta de producto con foto, badges (Destacado, Oferta), precio por unidad y botón responsivo que no desborda en pantallas de 390px.
- `DrawerCarrito.tsx`: Sheet deslizable con el listado de ítems seleccionados, desglose de subtotal y botón para proceder al pago.
- `ModalCheckout.tsx`: Diálogo modal para capturar datos de entrega, desglose de tarifa estilo Uber/PedidosYa (base + km + horario pico) y medio de pago (Efectivo al recibir por defecto).

---

## 3. Cómo funciona (Flujo visual)
1. El usuario navega la tienda y filtra por categorías.
2. Al pulsar `+ Agregar`, la tarjeta cambia al stepper `- 1 +` y la barra flotante inferior muestra el total acumulado.
3. Al pulsar `Ver pedido`, se abre `DrawerCarrito`.
4. Al pulsar `Continuar y Pagar`, se abre `ModalCheckout`.
5. Al ingresar la dirección, se muestra el recargo de envío calculado y el total final.
6. Al pulsar `Confirmar y Enviar Pedido`, se muestra el modal de éxito con el ticket para enviar a WhatsApp.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** `TiendaPiramidal.tsx` y `useCart`.
- **Va a:** Handlers de carrito, checkout y navegación entre modos.

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Diseño Mobile-First:** Todos los modales y tarjetas deben caber perfectamente dentro del ancho de 390px sin desbordamiento horizontal.
- **Libertad de navegación:** El carrito y el catálogo deben permanecer 100% abiertos sin forzar registros previos.
