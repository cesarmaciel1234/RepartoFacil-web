# Interfaz de Tienda

**Ubicación:** `src/modulos/tienda/ui/`  
**Rol:** Componentes visuales compartidos para navegación, catálogo, carrito, checkout y seguimiento de pedidos.

---

## 1. Qué hace
- Mantiene elementos reutilizables del catálogo y la navegación principal.
- Presenta el carrito y los formularios transitorios de dirección, autenticación y checkout.
- `VistaMercadosEmpresas.tsx` orquesta la exploración de locales con `EmpresaCard.tsx`, `MercadosCategoriasBar.tsx` y `MercadosProductosResults.tsx`.
- Centro de pedidos, mensajes y seguimiento en tiempo real.

## 2. Componentes Principales
- `HeaderTienda.tsx`, `NavegacionTienda.tsx`, `BotonCarritoFlotante.tsx`.
- `VistaMercadosEmpresas.tsx`, `EmpresaCard.tsx`, `MercadosCategoriasBar.tsx`, `MercadosProductosResults.tsx`.
- `DrawerCarrito.tsx`, `ModalCheckout.tsx`, `ModalCambiarDireccion.tsx`, `ModalClientAuth.tsx`.
- `CentroPedidosClienteSheet.tsx`, `CentroPedidoDetalleView.tsx`, `CentroPedidoItemRow.tsx`, `MensajesClienteSheet.tsx`, `ResenaPedidoDialog.tsx`.
- `TiendaModalesContainer.tsx`, `TiendaPwaLayout.tsx`.

## 3. Hacia dónde sale
Renderizado en el viewport del comprador a través de `TiendaPiramidal.tsx`.
