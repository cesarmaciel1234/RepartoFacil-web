# Dominio de pedidos del cliente

**Ubicación:** `src/modulos/tienda/pedidos/`

Este dominio sincroniza los pedidos del comprador y deriva cuántos siguen activos.

## Estructura

- `hooks/usePedidosCliente.ts`: combina el historial local filtrado por cliente
  con la API y escucha eventos de actualización.
- `../pantallas/HistorialPedidosTienda.tsx`: historial completo como pantalla.
- `../ui/CentroPedidosClienteSheet.tsx`: seguimiento de pedidos activos desde el
  botón del camión.

## Separación de responsabilidades

El hook no presenta UI; la pantalla de historial y el panel en vivo reciben los
pedidos y reportan acciones por callbacks. No se debe volver a agregar el
historial dentro del panel de seguimiento.
