import { DriverOrder, DriverProfile, OrderStatus, DriverWallet } from "./tipos";
import { doc, updateDoc } from "@/firebase/local-firestore";
import { creditDeliveryEarning, loadDriverWallet } from "./walletService";

export const DRIVER_USER_KEY = "repartofacil_driver_user";
export const DRIVER_TOKEN_KEY = "repartofacil_driver_token";
export const CLIENT_USER_KEY = "repartofacil_client_user";
export const CLIENT_TOKEN_KEY = "repartofacil_client_token";

export const DEFAULT_AVAILABLE_ORDERS: DriverOrder[] = [
  {
    id: "RF-7420",
    clientName: "Familia Gómez",
    deliveryAddress: "San Lorenzo 2040, Rosario",
    customerPhone: "+54 9 11 4589-2310",
    items: [
      { name: "Asado Especial Novillito", quantity: 2, unit: "kg", price: 9800 },
      { name: "Chorizo Criollo Puro Cerdo", quantity: 1, unit: "kg", price: 6500 },
      { name: "Carbón Vegetal 4kg", quantity: 1, unit: "bolsa", price: 2300 },
    ],
    subtotal: 28400,
    deliveryFee: 2100,
    total: 30500,
    paymentMethod: "cash",
    status: "Pending",
    distanceToStoreKm: 0.6,
    distanceToDeliveryKm: 1.1,
    distanceKm: 1.7,
    driverEarnings: 2450,
    isPeakHour: true,
    estimatedMinutes: 18,
    branch: "Central - Tucumán 2130",
    storeCoords: { lat: -32.9372, lng: -60.6542 },
    destinationCoords: { lat: -32.9395, lng: -60.6515 },
    createdAt: new Date().toISOString(),
  },
  {
    id: "RF-7421",
    clientName: "Martín Benítez",
    deliveryAddress: "Santa Fe 1900, Rosario",
    customerPhone: "+54 9 11 3214-9988",
    items: [
      { name: "Vacío Fino de Ternera", quantity: 1.5, unit: "kg", price: 10400 },
      { name: "Morcilla Bombón Casera", quantity: 0.8, unit: "kg", price: 5250 },
    ],
    subtotal: 19800,
    deliveryFee: 1850,
    total: 21650,
    paymentMethod: "cash",
    status: "Pending",
    distanceToStoreKm: 0.8,
    distanceToDeliveryKm: 1.4,
    distanceKm: 2.2,
    driverEarnings: 2100,
    isPeakHour: true,
    estimatedMinutes: 22,
    branch: "Central - Tucumán 2130",
    storeCoords: { lat: -32.9372, lng: -60.6542 },
    destinationCoords: { lat: -32.942, lng: -60.6502 },
    createdAt: new Date().toISOString(),
  },
  {
    id: "RF-7422",
    clientName: "Lorena Silva",
    deliveryAddress: "Mitre 2304 (Parrilla El Quincho)",
    customerPhone: "+54 9 11 6720-1144",
    items: [
      { name: "Combo Gran Parrillada (4 pers)", quantity: 1, unit: "combo", price: 32000 },
      { name: "Matambre de Cerdo", quantity: 1.2, unit: "kg", price: 10416 },
    ],
    subtotal: 44500,
    deliveryFee: 2600,
    total: 47100,
    paymentMethod: "transfer",
    status: "Pending",
    distanceToStoreKm: 1.2,
    distanceToDeliveryKm: 2.3,
    distanceKm: 3.5,
    driverEarnings: 2850,
    isPeakHour: false,
    estimatedMinutes: 28,
    branch: "Central - Tucumán 2130",
    storeCoords: { lat: -32.9372, lng: -60.6542 },
    destinationCoords: { lat: -32.9472, lng: -60.648 },
    createdAt: new Date().toISOString(),
  },
];

export function loadLocalOrders(): DriverOrder[] {
  if (typeof window === "undefined") return DEFAULT_AVAILABLE_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DEFAULT_AVAILABLE_ORDERS));
      return DEFAULT_AVAILABLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DEFAULT_AVAILABLE_ORDERS));
      return DEFAULT_AVAILABLE_ORDERS;
    }
    return parsed;
  } catch {
    return DEFAULT_AVAILABLE_ORDERS;
  }
}

export function saveLocalOrders(orders: DriverOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("rf-orders-updated"));
  } catch (e) {
    console.warn("Error guardando órdenes locales:", e);
  }
}

export function loadDriverProfile(): DriverProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRIVER_USER_KEY) || localStorage.getItem("repartofacil_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.role && parsed.role.toLowerCase() !== "driver") {
      return null;
    }
    return {
      id: parsed.id || parsed.uid || "repartidor-01",
      uid: parsed.uid || parsed.id || "repartidor-01",
      firstName: parsed.firstName || parsed.displayName || "Lucas Motomensajero",
      role: "Driver",
      vehicleType: parsed.vehicleType || "Motorcycle",
      availabilityStatus: parsed.availabilityStatus || "Available",
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export interface ClientProfile {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: "Client";
  phone?: string;
  address?: string;
}

export function loadClientProfile(): ClientProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLIENT_USER_KEY) || localStorage.getItem("repartofacil_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.role && parsed.role.toLowerCase() !== "client") {
      return null;
    }
    return {
      id: parsed.id || parsed.uid || "cliente-01",
      uid: parsed.uid || parsed.id || "cliente-01",
      displayName: parsed.displayName || parsed.firstName || "Cliente Frecuente",
      email: parsed.email || "cliente@repartofacil.com",
      role: "Client",
      phone: parsed.phone || "+54 9 341 555-1234",
      address: parsed.address || "Tucumán 2130, Rosario",
    };
  } catch {
    return null;
  }
}

export function saveDriverProfile(profile: DriverProfile, token?: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRIVER_USER_KEY, JSON.stringify(profile));
    if (token) localStorage.setItem(DRIVER_TOKEN_KEY, token);
    window.dispatchEvent(new Event("repartofacil-auth"));
    window.dispatchEvent(new Event("repartofacil-driver-auth"));
  } catch (e) {
    console.warn("Error guardando perfil repartidor:", e);
  }
}

export function clearDriverProfile() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRIVER_USER_KEY);
    localStorage.removeItem(DRIVER_TOKEN_KEY);
    const legacy = localStorage.getItem("repartofacil_user");
    if (legacy && legacy.toLowerCase().includes('"role":"driver"')) {
      localStorage.removeItem("repartofacil_user");
      localStorage.removeItem("repartofacil_token");
    }
    window.dispatchEvent(new Event("repartofacil-auth"));
    window.dispatchEvent(new Event("repartofacil-driver-auth"));
  } catch {}
}

export function saveClientProfile(profile: ClientProfile, token?: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(profile));
    if (token) localStorage.setItem(CLIENT_TOKEN_KEY, token);
    window.dispatchEvent(new Event("repartofacil-auth"));
    window.dispatchEvent(new Event("repartofacil-client-auth"));
  } catch (e) {
    console.warn("Error guardando perfil cliente:", e);
  }
}

export function clearClientProfile() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CLIENT_USER_KEY);
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    const legacy = localStorage.getItem("repartofacil_user");
    if (legacy && legacy.toLowerCase().includes('"role":"client"')) {
      localStorage.removeItem("repartofacil_user");
      localStorage.removeItem("repartofacil_token");
    }
    window.dispatchEvent(new Event("repartofacil-auth"));
    window.dispatchEvent(new Event("repartofacil-client-auth"));
  } catch {}
}

export async function assignOrderToDriver(
  orderId: string,
  driverId: string,
  firestoreInstance: any = null
): Promise<DriverOrder[]> {
  const current = loadLocalOrders();
  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        driverId,
        status: "Assigned" as OrderStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return ord;
  });

  saveLocalOrders(updated);

  // Sincronizar en base de datos PostgreSQL de Cobro Fácil
  try {
    fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        status: "Assigned",
        driverId,
        driverName: "Lucas Motomensajero",
      }),
    }).catch(() => null);
  } catch {}

  if (firestoreInstance) {
    try {
      updateDoc(doc(firestoreInstance, "orders", orderId), {
        driverId,
        status: "Assigned",
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error actualizando orden en firestore:", e);
    }
  }

  return updated;
}

export async function completeOrderDelivery(
  orderId: string,
  firestoreInstance: any = null
): Promise<{ updatedOrders: DriverOrder[]; wallet: DriverWallet }> {
  const current = loadLocalOrders();
  let creditedEarning = 2200;
  let cashCollected = 0;

  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      creditedEarning = ord.driverEarnings || Math.max(1800, Math.round((ord.deliveryFee || 2000) * 0.85));
      if (ord.paymentMethod === "cash" || ord.paymentMethod === ("efectivo" as any)) {
        cashCollected = ord.total;
      }
      return {
        ...ord,
        status: "Delivered" as OrderStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return ord;
  });

  saveLocalOrders(updated);
  const wallet = creditDeliveryEarning(orderId, creditedEarning, cashCollected);

  // Sincronizar en base de datos PostgreSQL de Cobro Fácil
  try {
    fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        status: "Delivered",
      }),
    }).catch(() => null);
  } catch {}

  if (firestoreInstance) {
    try {
      updateDoc(doc(firestoreInstance, "orders", orderId), {
        status: "Delivered",
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error actualizando estado en firestore:", e);
    }
  }

  return { updatedOrders: updated, wallet };
}
