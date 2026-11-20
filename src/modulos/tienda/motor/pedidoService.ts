import { CartItem, CheckoutFormData, OrderData } from "./tipos";
import { calcularTarifaEnvio, estimateAddressCoords, MARKET_CENTRAL } from "./tarifaUberService";
import { addDocumentNonBlocking } from "@/firebase";
import { collection } from "@/firebase/local-firestore";
import { loadClientProfile } from "@/modulos/repartidor/motor/driverService";

const ORDERS_STORAGE_KEY = "rf_orders_history";
const CUSTOMER_STORAGE_KEY = "rf_customer_data";

export function loadSavedCustomer(): Partial<CheckoutFormData> {
  if (typeof window === "undefined") return {};
  try {
    const client = loadClientProfile();
    if (client) {
      return {
        customerName: client.displayName,
        customerPhone: client.phone || "+54 9 341 555-1234",
        deliveryAddress: client.address || "Bv. Oroño 1200, Rosario",
        deliveryType: "delivery",
      };
    }

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

  // Cálculo de tarifa estándar Uber / PedidosYa
  const tarifa = calcularTarifaEnvio(form.deliveryAddress || "");
  const deliveryFee =
    form.deliveryType === "delivery" && subtotal > 0
      ? subtotal >= 35000
        ? 0
        : tarifa.totalDeliveryFee
      : 0;

  const total = subtotal + deliveryFee;
  const orderId = `RF-${Math.floor(1000 + Math.random() * 9000)}`;
  const { coords: destCoords } = estimateAddressCoords(form.deliveryAddress || "");

  const newOrder: any = {
    id: orderId,
    clientName: form.customerName.trim(),
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    deliveryType: form.deliveryType,
    deliveryAddress:
      form.deliveryType === "delivery" ? form.deliveryAddress.trim() : form.selectedBranch,
    paymentMethod: form.paymentMethod === "efectivo" ? "cash" : form.paymentMethod,
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
    status: "pending_store",

    // Métricas para el repartidor (Uber / PedidosYa)
    distanceToStoreKm: 0.8,
    distanceToDeliveryKm: tarifa.distanceKm,
    distanceKm: tarifa.distanceKm,
    driverEarnings: tarifa.driverEarnings,
    isPeakHour: tarifa.isPeakHour,
    estimatedMinutes: tarifa.estimatedMinutes,
    branch: MARKET_CENTRAL.address,
    storeCoords: MARKET_CENTRAL.coords,
    destinationCoords: destCoords,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "RepartoFacil Web",
  };

  // 1. Guardar datos de cliente para compras futuras
  saveCustomerData(form);

  // 2. Persistencia en historial local (alimenta el radar del repartidor)
  try {
    const existing: any[] = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    existing.unshift(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existing));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rf-orders-updated", { detail: newOrder }));
    }
  } catch (e) {
    console.warn("Error guardando en historial local:", e);
  }

  // 3. Persistencia en base de datos PostgreSQL de Cobro Fácil (crm-libro-local)
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
    if (!res.ok) {
      console.warn("Aviso guardando orden en PostgreSQL:", res.status);
    }
  } catch (err) {
    console.warn("Error enviando pedido a /api/orders:", err);
  }

  // 4. Persistencia en Firestore / backend si está activo
  try {
    if (firestoreInstance) {
      addDocumentNonBlocking(collection(firestoreInstance, "orders"), newOrder);
    }
  } catch (e) {
    console.warn("Error sincronizando pedido en la nube:", e);
  }

  return newOrder;
}

export function buildWhatsAppLink(order: any, phoneNumber = "5491100000000"): string {
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
    `💳 *Pago:* ${order.paymentMethod.toUpperCase()}\n\n` +
    `🛒 *Detalle de compra:*\n${itemsText}\n\n` +
    (order.deliveryFee > 0
      ? `🛵 *Costo de envío:* $${order.deliveryFee.toLocaleString("es-AR")}\n`
      : `🛵 *Envío:* GRATIS\n`) +
    `💰 *TOTAL A ABONAR:* $${order.total.toLocaleString("es-AR")}\n\n` +
    `_Pedido procesado automáticamente por Reparto Fácil Market._`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
}
