# Interfaz de Tienda

**Ubicación:** `src/modulos/tienda/ui/`  
**Rol:** Componentes visuales compartidos para navegación, catálogo, carrito,
checkout y seguimiento de pedidos.

---

## 1. Qué hace
- Mantiene elementos reutilizables del catálogo y la navegación principal.
- Presenta el carrito y los formularios transitorios de dirección, autenticación y checkout.
- Muestra el panel del camioncito para consultar pedidos activos y abrir su chat.
- Deja el historial completo en `pantallas/HistorialPedidosTienda.tsx`, como módulo
  de navegación independiente.
- El perfil del comprador muestra la versión instalada y si coincide con la publicada.

---

## 2. Componentes Principales
- `HeaderTienda.tsx`: Dirección de entrega en las vistas de comercios, nombre del local en su catálogo, carrito y seguimiento en vivo.
- `NavegacionTienda.tsx`: Barra inferior para Inicio, Súper, Promociones, Pedidos y Perfil.
- `VistaMercadosEmpresas.tsx`: Descubrimiento de comercios y tarjetas de productos en búsqueda.
- `FiltroCategorias.tsx` y `TarjetaProducto.tsx`: Filtros de catálogo y acciones de producto.
- `DrawerCarrito.tsx`, `ModalCheckout.tsx`: Revisión del carrito y confirmación de compra.
- `ModalCambiarDireccion.tsx`, `ModalClientAuth.tsx`: Flujos de dirección e identidad del comprador.
- `CentroPedidosClienteSheet.tsx`: Detalle y seguimiento de pedidos activos; no renderiza historial.

---

## 3. Cómo funciona (Flujo visual)
1. `TiendaPiramidal` selecciona la pantalla y conecta sus callbacks.
2. El usuario agrega productos desde las tarjetas al hook `motor/useCart.ts`.
3. `DrawerCarrito` abre `ModalCheckout` al continuar con la compra.
4. `CentroPedidosClienteSheet` muestra pedidos activos; el historial usa su propia pantalla.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** `TiendaPiramidal.tsx` o una pantalla de `pantallas/`.
- **Va a:** Hooks/servicios del dominio mediante props y callbacks tipados.

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Cero bloqueo:** No exigir login para explorar o agregar al carrito.
- **Responsividad móvil:** No generar scroll horizontal en pantallas de 390px.
- **Separación de pantallas:** El historial no se vuelve a incrustar en el panel de pedidos activos.
- **Checkout:** Usa el nombre y teléfono registrados sin mostrarlos; pide solo los
  que faltan y los guarda en el perfil antes de confirmar. La dirección de envío
  sigue editable para cada pedido. Al iniciar sesión se recupera el perfil privado
  sin reemplazar sus datos de contacto por valores vacíos.
