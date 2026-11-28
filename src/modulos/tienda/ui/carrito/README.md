# Subcarpeta: Carrito de Compras

**Ubicación:** `src/modulos/tienda/ui/carrito/`  
**Rol:** Subcomponentes modulares de visualización para el cajón del carrito multitienda.

---

## 1. Qué hace
- Provee las tarjetas individuales de comercios con pedidos pendientes en el carrito.
- Renderiza las filas de productos con controles de suma/resta/eliminación y validación de stock TPV.
- Presenta el pie de página con cálculo dinámico de envío, umbral de envío gratis y botón de pago.

---

## 2. Componentes
- `DrawerCarritoCompanyCard.tsx`: Tarjeta de comercio con imagen, distancia, tiempo y subtotal.
- `DrawerCarritoItem.tsx`: Fila de producto en el carrito con selector de cantidades y alertas de stock.
- `DrawerCarritoFooter.tsx`: Barra de totales, subsidio de envío gratis y botón "Ir a pagar".

---

## 3. Conexiones
- **Viene de:** `DrawerCarrito.tsx`.
- **Va a:** `pedidoService.ts` y `ModalCheckout.tsx` al avanzar al pago.
