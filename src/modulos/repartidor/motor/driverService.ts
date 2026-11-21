import { DriverOrder, DriverProfile, OrderStatus, DriverWallet } from "./tipos";
import { doc, updateDoc } from "@/firebase/local-firestore";
import { creditDeliveryEarning, loadDriverWallet } from "./walletService";

export const DRIVER_USER_KEY = "repartofacil_driver_user";
export const DRIVER_TOKEN_KEY = "repartofacil_driver_token";
export const CLIENT_USER_KEY = "repartofacil_client_user";
export const CLIENT_TOKEN_KEY = "repartofacil_client_token";
export const ORDERS_STORAGE_KEY = "rf_orders_history";

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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Excluir órdenes demo antiguas sin clientId real
    return parsed.filter(
      (o) => o && o.id && !["RF-7420", "RF-7421", "RF-7422"].includes(o.id)
    );
  } catch {
    return [];
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

export function generateUniqueEntityId(prefix: "usr_cli" | "usr_rep" | "cli" | "rep"): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36).substring(4);
  return `${prefix}_${rand}${time}`;
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

    const driverName = (parsed.firstName || parsed.displayName || "Lucas Motomensajero").trim();
    // ID único de cuenta de usuario y ID único de perfil
    const userId = (parsed.userId && parsed.userId !== "repartidor-01") ? parsed.userId : (parsed.uid && parsed.uid !== "repartidor-01" ? parsed.uid : generateUniqueEntityId("usr_rep"));
    const profileId = (parsed.id && parsed.id !== "repartidor-01") ? parsed.id : generateUniqueEntityId("rep");

    const profile: DriverProfile = {
      id: profileId,
      uid: userId,
      userId: userId,
      firstName: driverName,
      role: "Driver",
      vehicleType: parsed.vehicleType || "Motorcycle",
      availabilityStatus: parsed.availabilityStatus || "Available",
      createdAt: parsed.createdAt || new Date().toISOString(),
    };

    if (!parsed.userId || parsed.id === "repartidor-01") {
      try {
        localStorage.setItem(DRIVER_USER_KEY, JSON.stringify(profile));
      } catch {}
    }

    return profile;
  } catch {
    return null;
  }
}

export interface ClientProfile {
  id: string; // ID único de perfil del cliente (cli_xxxx)
  uid: string;
  userId: string; // ID único de cuenta de usuario (usr_cli_xxxx)
  displayName: string;
  email: string;
  role: "Client";
  phone?: string;
  address?: string;
}

const DEFAULT_CLIENT_PHONE = "+54 9 341 555-1234";
const DEFAULT_CLIENT_ADDRESSES = new Set(["bv orono 1200 rosario", "tucuman 2130 rosario"]);

function normalizeProfileValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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

    // ID único de cuenta de usuario y ID único de perfil para blindar aislamiento
    const userId = (parsed.userId && parsed.userId !== "cliente-01") ? parsed.userId : (parsed.uid && parsed.uid !== "cliente-01" ? parsed.uid : generateUniqueEntityId("usr_cli"));
    const profileId = (parsed.id && parsed.id !== "cliente-01") ? parsed.id : generateUniqueEntityId("cli");

    const profile: ClientProfile = {
      id: profileId,
      uid: userId,
      userId: userId,
      displayName: parsed.displayName || parsed.firstName || "Cliente Frecuente",
      email: parsed.email || "cliente@repartofacil.com",
      role: "Client",
      phone:
        typeof parsed.phone === "string" &&
        parsed.phone.trim() &&
        parsed.phone !== DEFAULT_CLIENT_PHONE
          ? parsed.phone.trim()
          : undefined,
      address:
        typeof parsed.address === "string" &&
        parsed.address.trim() &&
        !DEFAULT_CLIENT_ADDRESSES.has(normalizeProfileValue(parsed.address))
          ? parsed.address.trim()
          : undefined,
    };

    if (!parsed.userId || parsed.id === "cliente-01") {
      try {
        localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(profile));
      } catch {}
    }

    return profile;
  } catch {
    return null;
  }
}

export function getOrCreateActiveClientIdentity(): { clientId: string; userId: string } {
  const logged = loadClientProfile();
  if (logged?.id) {
    return { clientId: logged.id, userId: logged.userId || logged.uid || logged.id };
  }
  if (typeof window === "undefined") {
    return { clientId: "cli_ssr", userId: "usr_cli_ssr" };
  }
  try {
    const raw = localStorage.getItem("repartofacil_guest_identity");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.clientId && parsed?.userId) return parsed;
    }
    const created = {
      clientId: generateUniqueEntityId("cli"),
      userId: generateUniqueEntityId("usr_cli"),
    };
    localStorage.setItem("repartofacil_guest_identity", JSON.stringify(created));
    return created;
  } catch {
    return {
      clientId: generateUniqueEntityId("cli"),
      userId: generateUniqueEntityId("usr_cli"),
    };
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
    // Sincronizar identidad activa y limpiar pedidos locales de otros compradores
    localStorage.setItem(
      "repartofacil_guest_identity",
      JSON.stringify({ clientId: profile.id, userId: profile.userId || profile.uid || profile.id })
    );
    try {
      const rawOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (rawOrders) {
        const parsedOrders = JSON.parse(rawOrders);
        if (Array.isArray(parsedOrders)) {
          const onlyMine = parsedOrders.filter((o) => o && o.clientId === profile.id);
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(onlyMine));
        }
      }
    } catch {}
    window.dispatchEvent(new Event("repartofacil-auth"));
    window.dispatchEvent(new Event("repartofacil-client-auth"));
    window.dispatchEvent(new Event("rf-orders-updated"));
  } catch (e) {
    console.warn("Error guardando perfil cliente:", e);
  }
}

export function clearClientProfile() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CLIENT_USER_KEY);
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    localStorage.removeItem("repartofacil_guest_identity");
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    const legacy = localStorage.getItem("repartofacil_user");
    if (legacy && legacy.toLowerCase().includes('"role":"client"')) {
      localStorage.removeItem("repartofacil_user");
      localStorage.removeItem("repartofacil_token");
    }
    window.dispatchEvent(new Event("repartofacil-auth"));
    window.dispatchEvent(new Event("repartofacil-client-auth"));
    window.dispatchEvent(new Event("rf-orders-updated"));
  } catch {}
}

export async function assignOrderToDriver(
  orderId: string,
  driverId: string,
  firestoreInstance: any = null
): Promise<DriverOrder[]> {
  const current = loadLocalOrders();
  const driverProfile = loadDriverProfile();
  const driverUserId = driverProfile?.userId || `usr_${driverId}`;
  const driverName = driverProfile?.firstName || "Lucas Motomensajero";

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

  // Sincronizar en base de datos PostgreSQL de Cobro Fácil con ID de chofer y usuario
  try {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        status: "Assigned",
        driverId,
        driverUserId,
        driverName,
      }),
    });
  } catch (err) {
    console.warn("Aviso actualizando orden asignada:", err);
  }

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
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        status: "Delivered",
      }),
    });
  } catch (err) {
    console.warn("Aviso completando entrega en PostgreSQL:", err);
  }

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
