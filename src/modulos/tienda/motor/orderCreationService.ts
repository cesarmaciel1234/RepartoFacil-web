import { CartItem, CheckoutFormData, OrderData } from "./tipos";
import { calcularTarifaEnvio, estimateAddressCoords, MARKET_CENTRAL } from "./tarifaUberService";
import { authHeaders } from "@/lib/clientAuth";
import {
  loadClientProfile,
  getOrCreateActiveClientIdentity,
  ORDERS_STORAGE_KEY,
} from "@/modulos/repartidor/motor/driverService";
import {
  isProductPurchasable,
  productAvailabilityMessage,
} from "./productoDisponibilidad";
import { saveCustomerData } from "./customerProfileService";

const PAYMENT_METHOD_MAP: Record<CheckoutFormData["paymentMethod"], OrderData["paymentMethod"]> = {
  efectivo: "cash",
  transferencia: "transfer",
  tarjeta: "card",
};

export async function createOrder(
  cart: CartItem[],
  form: CheckoutFormData
): Promise<OrderData> {
  const headers = authHeaders("Client");
  if (!loadClientProfile() || !headers.Authorization) {
    throw new Error("Iniciá sesión como comprador para confirmar el pedido.");
  }
  const verifiedCart = cart.map((item) => {
    if (!isProductPurchasable(item.product)) {
      throw new Error(
        `${item.product.name}: ${
          productAvailabilityMessage(item.product) || "producto no disponible"
        }.`
      );
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error(`${item.product.name}: la cantidad del carrito no es válida.`);
    }
    if (item.quantity > item.product.stockKg) {
      throw new Error(
        `${item.product.name}: la cantidad supera el stock informado por el TPV.`
      );
    }
    return { ...item, product: item.product };
  });
  const subtotal = verifiedCart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Cálculo de tarifa estándar Uber / PedidosYa
  const tarifa = calcularTarifaEnvio(form.deliveryAddress || "");
  const freeDeliveryThreshold =
    typeof form.freeDeliveryThreshold === "number" &&
    Number.isFinite(form.freeDeliveryThreshold) &&
    form.freeDeliveryThreshold >= 0
      ? form.freeDeliveryThreshold
      : 35000;
  const deliveryFeeOverride =
    typeof form.deliveryFeeOverride === "number" &&
    Number.isFinite(form.deliveryFeeOverride) &&
    form.deliveryFeeOverride >= 0
      ? form.deliveryFeeOverride
      : null;
  const deliveryFee =
    form.deliveryType === "delivery" && subtotal > 0
      ? subtotal >= freeDeliveryThreshold
        ? 0
        : deliveryFeeOverride !== null
        ? deliveryFeeOverride
        : tarifa.totalDeliveryFee
      : 0;

  const total = subtotal + deliveryFee;
  const orderId = `RF-${crypto.randomUUID()}`;
  const destCoords = form.deliveryCoordinates
    ? { lat: Number(form.deliveryCoordinates.lat), lng: Number(form.deliveryCoordinates.lng) }
    : estimateAddressCoords(form.deliveryAddress || "").coords;

  // Asignar IDs únicos de usuario, perfil cliente y empresa destinataria (aislamiento estricto)
  const identity = getOrCreateActiveClientIdentity();
  const clientId = identity.clientId;
  const clientUserId = identity.userId;

  const targetCompanyId = form.companyId || cart[0]?.product?.companyId || "frigorifico-maciel-suc-1";
  const rawSlug = (form.companySlug || targetCompanyId.replace(/^empresa-/, "")).toLowerCase().trim();
  const isPrueba = targetCompanyId === "empresa-prueba" || rawSlug === "prueba";
  const isMaciel =
    targetCompanyId === "frigorifico-maciel" ||
    targetCompanyId.startsWith("frigorifico-maciel") ||
    targetCompanyId.includes("maciel") ||
    rawSlug === "maciel" ||
    rawSlug === "rumaul" ||
    rawSlug.includes("maciel") ||
    (cart[0]?.product as any)?.empresa_id === 1;
  const empresaId =
    typeof form.empresaId === "number" && form.empresaId > 0
      ? form.empresaId
      : isPrueba
      ? 2
      : isMaciel
      ? 1
      : Number(rawSlug) || 1;
  const empresaSlug = isMaciel ? "maciel" : isPrueba ? "prueba" : rawSlug || "maciel";
  const companyBranchName =
    form.selectedBranch ||
    cart[0]?.product?.companyName ||
    (isPrueba ? "Cobro Fácil - Empresa Prueba" : isMaciel ? "Frigorífico Maciel - Central" : rawSlug.toUpperCase());

  const newOrder: any = {
    id: orderId,
    clientId,
    clientUserId,
    empresaId,
    empresaSlug,
    companyId: targetCompanyId,
    clientName: form.customerName.trim(),
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    deliveryType: form.deliveryType,
    deliveryAddress:
      form.deliveryType === "delivery" ? form.deliveryAddress.trim() : companyBranchName,
    paymentMethod: PAYMENT_METHOD_MAP[form.paymentMethod],
    notes: form.orderNotes.trim() || undefined,
    items: verifiedCart.map((i) => ({
      id: i.product.id,
      producto_id: (i.product as any).codigo || String(i.product.id).replace(/^(tpv-suc-\d+-|fallback-suc-\d+-)/i, ""),
      name: i.product.name,
      price: i.product.price,
      unit: i.product.unit || "KG",
      quantity: i.quantity,
    })),
    sucursal_id: (cart[0]?.product as any)?.sucursal_id || 1,
    tienda: empresaSlug,
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
    branch: companyBranchName,
    storeCoords: MARKET_CENTRAL.coords,
    destinationCoords: destCoords,
    deliveryCoordinates: destCoords,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "RepartoFacil Web",
  };

  // 1. Guardar datos de cliente para compras futuras
  saveCustomerData(form);

  // 2. Persistencia central: no confirmar un pedido que no llegó al servidor
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      ...newOrder,
      deliveryLat: destCoords.lat,
      deliveryLng: destCoords.lng,
      deliveryCoordinates: destCoords,
      destinationCoords: destCoords,
    }),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Tu sesión no permite comprar. Volvé a iniciar sesión.");
    }
    if (response.status === 409 || response.status === 503) {
      const error = await response.json();
      throw new Error(typeof error.error === "string" ? error.error : "No se pudo validar el pedido.");
    }
    throw new Error(`No se pudo registrar el pedido en el servidor (HTTP ${response.status}).`);
  }

  // 3. Persistencia en historial local (alimenta la vista inmediata del comprador)
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

  return newOrder;
}
