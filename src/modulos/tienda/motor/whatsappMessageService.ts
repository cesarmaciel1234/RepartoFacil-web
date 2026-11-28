import { OrderData } from "./tipos";

export function buildWhatsAppLink(order: OrderData, phoneNumber = "5491100000000"): string {
  const paymentLabels: Record<OrderData["paymentMethod"], string> = {
    cash: "Efectivo",
    transfer: "Transferencia",
    card: "Tarjeta",
    web: "Pago web",
  };
  const itemsText = order.items
    .map(
      (i: any) =>
        `• ${i.quantity} ${i.unit} de *${i.name}* ($${(i.price * i.quantity).toLocaleString("es-AR")})`
    )
    .join("\n");

  const msg =
    `🥩 *NUEVO PEDIDO REPARTO FÁCIL* #${order.id}\n\n` +
    `👤 *Cliente:* ${order.customerName}\n` +
    `📱 *Teléfono:* ${order.customerPhone}\n` +
    `📍 *Destino:* ${order.deliveryAddress} (${
      order.deliveryType === "delivery" ? "Envío a domicilio" : "Retiro en sucursal"
    })\n` +
    `💳 *Pago:* ${paymentLabels[order.paymentMethod]}\n\n` +
    `🛒 *Detalle de compra:*\n${itemsText}\n\n` +
    (order.deliveryFee > 0
      ? `🛵 *Costo de envío:* $${order.deliveryFee.toLocaleString("es-AR")}\n`
      : `🛵 *Envío:* GRATIS\n`) +
    `💰 *TOTAL A ABONAR:* $${order.total.toLocaleString("es-AR")}\n\n` +
    `_Pedido procesado automáticamente por Reparto Fácil Market._`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
}
