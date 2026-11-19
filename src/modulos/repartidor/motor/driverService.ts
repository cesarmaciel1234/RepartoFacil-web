import { DriverOrder, DriverProfile, OrderStatus } from "./tipos";
import { doc, updateDoc, setDoc } from "@/firebase/local-firestore";

export const ORDERS_STORAGE_KEY = "rf_orders_history";
export const DRIVER_USER_KEY = "repartofacil_user";

export const DEFAULT_AVAILABLE_ORDERS: DriverOrder[] = [
  {
    id: "RF-7420",
    clientName: "Familia Gómez",
    deliveryAddress: "Av. Belgrano 1450, Piso 3B",
    customerPhone: "+54 9 11 4589-2310",
    items: [
      { name: "Asado Especial Novillito", quantity: 2, unit: "kg", price: 9800 },
      { name: "Chorizo Criollo Puro Cerdo", quantity: 1, unit: "kg", price: 6500 },
      { name: "Carbón Vegetal 4kg", quantity: 1, unit: "bolsa", price: 2300 },
    ],
    total: 28400,
    status: "Pending",
    distanceKm: 1.4,
    estimatedMinutes: 18,
    branch: "Central - Frigorífico Maciel",
    createdAt: new Date().toISOString(),
  },
  {
    id: "RF-7421",
    clientName: "Martín Benítez",
    deliveryAddress: "Calle San Martín 820",
    customerPhone: "+54 9 11 3214-9988",
    items: [
      { name: "Vacío Fino de Ternera", quantity: 1.5, unit: "kg", price: 10400 },
      { name: "Morcilla Bombón Casera", quantity: 0.8, unit: "kg", price: 5250 },
    ],
    total: 19800,
    status: "Pending",
    distanceKm: 2.1,
    estimatedMinutes: 24,
    branch: "Sucursal Norte",
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
    total: 44500,
    status: "Pending",
    distanceKm: 3.5,
    estimatedMinutes: 30,
    branch: "Central - Frigorífico Maciel",
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
  } catch (e) {
    console.warn("Error guardando órdenes locales:", e);
  }
}

export function loadDriverProfile(): DriverProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRIVER_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDriverProfile(profile: DriverProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRIVER_USER_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("repartofacil-auth"));
  } catch (e) {
    console.warn("Error guardando perfil repartidor:", e);
  }
}

export function clearDriverProfile() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRIVER_USER_KEY);
    window.dispatchEvent(new Event("repartofacil-auth"));
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

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  firestoreInstance: any = null
): Promise<DriverOrder[]> {
  const current = loadLocalOrders();
  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return ord;
  });

  saveLocalOrders(updated);

  if (firestoreInstance) {
    try {
      updateDoc(doc(firestoreInstance, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error actualizando estado en firestore:", e);
    }
  }

  return updated;
}
