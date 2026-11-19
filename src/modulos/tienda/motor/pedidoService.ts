import { CartItem, CheckoutFormData, OrderData } from "./tipos";
import { addDocumentNonBlocking } from "@/firebase";
import { collection } from "@/firebase/local-firestore";

const ORDERS_STORAGE_KEY = "rf_orders_history";
const CUSTOMER_STORAGE_KEY = "rf_customer_data";

export function loadSavedCustomer(): Partial<CheckoutFormData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomerData(form: CheckoutFormData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress,
        deliveryType: form.deliveryType,
        selectedBranch: form.selectedBranch,
      })
    );
  } catch (e) {
    console.warn("No se pudo guardar datos del cliente:", e);
  }
}

export async function createOrder(
  cart: CartItem[],
  form: CheckoutFormData,
  firestoreInstance: any = null
): Promise<OrderData> {
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = form.deliveryType === "delivery" && subtotal > 0 ? (subtotal > 30000 ? 0 : 1500) : 0;
  const total = subtotal + deliveryFee;

  const orderId = `RF-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: OrderData = {
    id: orderId,
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    deliveryType: form.deliveryType,
    deliveryAddress: form.deliveryType === "delivery" ? form.deliveryAddress.trim() : form.selectedBranch,
    paymentMethod: form.paymentMethod,
    notes: form.orderNotes.trim() || undefined,
    items: cart.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      unit: i.product.unit,
      quantity: i.quantity,
    })),
    subtotal,
    deliveryFee,
    total,
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "RepartoFacil Web",
  };

  // 1. Guardar datos de cliente para compras futuras
  saveCustomerData(form);

  // 2. Persistencia en historial local (alimenta el radar del repartidor)
  try {
    const existing: OrderData[] = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    existing.unshift(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existing));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rf-orders-updated", { detail: newOrder }));
    }
  } catch (e) {
    console.warn("Error guardando en historial local:", e);
  }

  // 3. Persistencia en Firestore / backend si está activo
  try {
    if (firestoreInstance) {
      addDocumentNonBlocking(collection(firestoreInstance, "orders"), newOrder);
    }
  } catch (e) {
    console.warn("Error sincronizando pedido en la nube:", e);
  }

  return newOrder;
}

export function buildWhatsAppLink(order: OrderData, phoneNumber = "5491100000000"): string {
  const itemsText = order.items
    .map((i) => `• ${i.quantity} ${i.unit} de *${i.name}* ($${(i.price * i.quantity).toLocaleString("es-AR")})`)
    .join("\n");

  const msg =
    `🥩 *NUEVO PEDIDO REPARTO FÁCIL* #${order.id}\n\n` +
    `👤 *Cliente:* ${order.customerName}\n` +
    `📱 *Teléfono:* ${order.customerPhone}\n` +
    `📍 *Destino:* ${order.deliveryAddress} (${order.deliveryType === "delivery" ? "Envío a domicilio" : "Retiro en sucursal"})\n` +
    `💳 *Pago:* ${order.paymentMethod.toUpperCase()}\n\n` +
    `🛒 *Detalle de compra:*\n${itemsText}\n\n` +
    (order.deliveryFee > 0 ? `🛵 *Costo de envío:* $${order.deliveryFee.toLocaleString("es-AR")}\n` : `🛵 *Envío:* GRATIS\n`) +
    `💰 *TOTAL FINAL:* $${order.total.toLocaleString("es-AR")}\n\n` +
    (order.notes ? `📝 *Notas:* ${order.notes}\n\n` : "") +
    `¡Muchas gracias por elegirnos!`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
}
