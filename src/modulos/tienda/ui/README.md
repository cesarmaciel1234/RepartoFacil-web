# Subcarpeta: Interfaz de Usuario Tienda

**Ubicación:** `src/modulos/tienda/ui/`  
**Rol:** Componentes visuales y pantallas interactivas del perfil tienda (catálogo, filtros, carrito y checkout).

---

## 1. Qué hace
Renderiza la experiencia de compra estilo ecommerce (Rappi / Uber Eats / Mercado Libre) para clientes:
- Encabezado con estado de entrega y acceso al Modo Repartidor.
- Buscador reactivo y barra de desplazamiento de categorías de carnicería (Vacuno, Cerdo, Pollo, Combos, etc.).
- Tarjetas de productos con imágenes reales de cortes, badges y control de cantidades.
- Carrito lateral/inferior tipo Drawer (Sheet) con cálculo de envío gratis.
- Diálogo modal de Checkout con validación de datos de contacto y confirmación para WhatsApp.

---

## 2. Funciones y Componentes Principales
- `HeaderTienda`: Barra superior fija con branding "RF Reparto Fácil MARKET", indicador de sucursal Maciel, botón de alternancia a "Modo Repartidor" y disparador de carrito con contador.
- `FiltroCategorias`: Barra de búsqueda rápida de cortes de carne y píldoras horizontales deslizables de categorías.
- `TarjetaProducto`: Card moderna de producto con badges de popularidad/oferta, precio formateado por kg/unidad y botones reactivos +/-.
- `DrawerCarrito`: Sheet lateral con resumen de la compra, costo de envío dinámico y botón para proceder al pago.
- `ModalCheckout`: Diálogo modal que solicita nombre, WhatsApp, dirección y medio de pago, y presenta el comprobante final con enlace a WhatsApp.

---

## 3. Cómo funciona (Flujo interno)
1. `FiltroCategorias` capta las consultas del cliente y filtra los productos de `INITIAL_PRODUCTS`.
2. Las `TarjetaProducto` llaman a `onAddToCart` o `onUpdateQuantity`, actualizando el estado de `useCart`.
3. Al hacer clic en el botón del carrito en `HeaderTienda`, se abre `DrawerCarrito`.
4. Al presionar "Continuar y Pagar", se cierra el carrito y se abre `ModalCheckout`.
5. Al completar el formulario y confirmar, se invoca `createOrder()` y se muestra la ventana de pedido confirmado con el botón de WhatsApp.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** `TiendaPiramidal.tsx` (ensamblador maestro de la rama).
- **Va a:** El motor de la tienda (`useCart`, `pedidoService`) y a los hooks de notificación (`useToast`).

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Cero bloqueos:** Navegación 100% libre; no forzar pantalla de login al ingresar a la tienda.
- **Mobile First:** Todo componente debe funcionar con suavidad en pantallas pequeñas (360px a 390px) sin desbordes horizontales.
- **Tipografía y Pesos:** Respetar la jerarquía visual oscura y los precios en moneda local (`es-AR`).
