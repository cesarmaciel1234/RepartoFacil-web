# Submódulo UI de Checkout (`src/modulos/tienda/ui/checkout/`)

## 1. Qué hace
Componentes visuales modulares que conforman el formulario y flujo de confirmación del checkout en la tienda.

## 2. De dónde viene
Invocados directamente por `ModalCheckout.tsx` cuando el usuario abre el diálogo para finalizar su compra.

## 3. Archivos y funciones
- **`CheckoutDeliveryTypeSelector.tsx`**: Selector de modalidad ("Envío a Domicilio" vs "Retiro en Local").
- **`CheckoutAddressSection.tsx`**: Formulario de calle, altura, depto, tarjeta GPS y preview de tarifa.
- **`CheckoutPaymentSelector.tsx`**: Selector de medios de pago (efectivo, transferencia, tarjeta).
- **`CheckoutTarifaPreview.tsx`**: Indicador visual de tarifa dinámica Uber/PedidosYa y horario pico/normal.
- **`ModalPedidoConfirmado.tsx`**: Diálogo de éxito con enlace directo a WhatsApp y resumen de la orden.

## 4. Hacia dónde sale
Devuelve eventos de cambio de estado y submit hacia `ModalCheckout.tsx` y de allí a `pedidoService.ts`.
