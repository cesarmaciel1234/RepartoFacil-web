import { CheckoutFormData } from "./tipos";
import { authHeaders } from "@/lib/clientAuth";
import {
  loadClientProfile,
  saveClientProfile,
  generateUniqueEntityId,
  type ClientProfile,
} from "@/modulos/repartidor/motor/driverService";

export const CUSTOMER_STORAGE_KEY = "rf_customer_data";
export const PLACEHOLDER_CUSTOMER_NAMES = new Set(["cliente", "cliente frecuente"]);
export const PLACEHOLDER_CUSTOMER_PHONE = "+54 9 341 555-1234";
export const PLACEHOLDER_CUSTOMER_ADDRESSES = new Set([
  "bv. oroño 1200, rosario",
  "bv orono 1200 rosario",
  "tucumán 2130, rosario",
  "tucuman 2130, rosario",
]);

export function loadSavedCustomer(): Partial<CheckoutFormData> {
  if (typeof window === "undefined") return {};
  try {
    const client = loadClientProfile();
    if (client) {
      const customerName = client.displayName.trim();
      const customerPhone =
        client.phone === PLACEHOLDER_CUSTOMER_PHONE ? "" : client.phone || "";
      const deliveryAddress =
        PLACEHOLDER_CUSTOMER_ADDRESSES.has(
          (client.address || "").trim().toLocaleLowerCase("es-AR")
        )
          ? ""
          : client.address || "";

      return {
        customerName: PLACEHOLDER_CUSTOMER_NAMES.has(customerName.toLocaleLowerCase("es-AR"))
          ? ""
          : customerName,
        customerPhone,
        deliveryAddress,
        deliveryType: "delivery",
      };
    }

    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) return {};

    const saved = JSON.parse(raw) as Partial<CheckoutFormData>;
    const customerName = saved.customerName?.trim() || "";
    const customerPhone = saved.customerPhone?.trim() || "";
    const deliveryAddress = saved.deliveryAddress?.trim() || "";
    return {
      ...saved,
      customerName: PLACEHOLDER_CUSTOMER_NAMES.has(customerName.toLocaleLowerCase("es-AR"))
        ? ""
        : customerName,
      customerPhone:
        customerPhone === PLACEHOLDER_CUSTOMER_PHONE ? "" : customerPhone,
      deliveryAddress: PLACEHOLDER_CUSTOMER_ADDRESSES.has(
        deliveryAddress.toLocaleLowerCase("es-AR")
      )
        ? ""
        : deliveryAddress,
    };
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

export async function readRegisteredCustomer(
  profileId: string,
  authorization: string
): Promise<{
  displayName?: string;
  phone?: string;
  address?: string;
} | null> {
  let response: Response;
  try {
    response = await fetch(`/api/db/clients/${encodeURIComponent(profileId)}`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
  } catch (error) {
    console.warn("No se pudo consultar el perfil del comprador:", error);
    throw new Error(
      "No se pudieron cargar tus datos de contacto. Revisá tu conexión e intentá nuevamente."
    );
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("No se pudieron cargar tus datos de contacto. Intentá nuevamente.");
  }
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("El perfil recibido no es válido. Intentá nuevamente.");
  }
  const profile = data as Record<string, unknown>;
  if (
    ["displayName", "phone", "address"].some(
      (key) => profile[key] != null && typeof profile[key] !== "string"
    )
  ) {
    throw new Error("El perfil recibido no es válido. Intentá nuevamente.");
  }
  return {
    displayName: typeof profile.displayName === "string" ? profile.displayName : undefined,
    phone: typeof profile.phone === "string" ? profile.phone : undefined,
    address: typeof profile.address === "string" ? profile.address : undefined,
  };
}

export async function refreshMissingCustomerProfile(): Promise<void> {
  const profile = loadClientProfile();
  const authorization = authHeaders("Client").Authorization;
  if (!profile || !authorization) throw new Error("Iniciá sesión como comprador para continuar.");
  const saved = loadSavedCustomer();
  if (saved.customerName?.trim() && saved.customerPhone?.trim()) return;

  const registered = await readRegisteredCustomer(profile.id, authorization);
  if (
    loadClientProfile()?.id !== profile.id ||
    authHeaders("Client").Authorization !== authorization
  ) {
    throw new Error("La sesión cambió. Volvé a abrir el carrito.");
  }
  if (!registered) return;
  const name = typeof registered.displayName === "string" ? registered.displayName.trim() : "";
  const phone = typeof registered.phone === "string" ? registered.phone.trim() : "";
  const address = typeof registered.address === "string" ? registered.address.trim() : "";
  const updates = {
    ...(!saved.customerName?.trim() && name && !PLACEHOLDER_CUSTOMER_NAMES.has(name.toLocaleLowerCase("es-AR"))
      ? { displayName: name }
      : {}),
    ...(!saved.customerPhone?.trim() && phone && phone !== PLACEHOLDER_CUSTOMER_PHONE
      ? { phone }
      : {}),
    ...(!saved.deliveryAddress?.trim() && address && !PLACEHOLDER_CUSTOMER_ADDRESSES.has(address.toLocaleLowerCase("es-AR"))
      ? { address }
      : {}),
  };
  if (Object.keys(updates).length) saveClientProfile({ ...profile, ...updates });
}

export async function saveMissingCustomerProfile(
  form: CheckoutFormData,
  expectedClientId: string
): Promise<void> {
  const profile = loadClientProfile();
  const headers = authHeaders("Client");
  if (!profile || !headers.Authorization || profile.id !== expectedClientId) {
    throw new Error("La sesión cambió. Cerrá el formulario y volvé a abrirlo.");
  }
  const saved = loadSavedCustomer();
  const updates: { displayName?: string; phone?: string } = {};
  if (!saved.customerName?.trim()) updates.displayName = form.customerName.trim();
  if (!saved.customerPhone?.trim()) updates.phone = form.customerPhone.trim();
  if (!Object.keys(updates).length) return;
  if (("displayName" in updates && !updates.displayName) || ("phone" in updates && !updates.phone)) {
    throw new Error("Completá tu nombre y teléfono de contacto.");
  }

  let response: Response;
  try {
    response = await fetch(`/api/db/clients/${encodeURIComponent(profile.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.warn("No se pudieron guardar los datos del comprador:", error);
    throw new Error(
      "No se pudieron guardar tus datos de contacto. Revisá tu conexión e intentá nuevamente."
    );
  }
  if (!response.ok) {
    throw new Error("No se pudieron guardar tus datos de contacto. Intentá nuevamente.");
  }
  if (
    loadClientProfile()?.id !== expectedClientId ||
    authHeaders("Client").Authorization !== headers.Authorization
  ) {
    throw new Error("La sesión cambió. Cerrá el formulario y volvé a abrirlo.");
  }
  saveClientProfile({ ...profile, ...updates });
}

export async function autoRegisterGuestCustomer(params: {
  name: string;
  phone: string;
  address: string;
}): Promise<ClientProfile> {
  const cleanName = params.name.trim() || "Cliente Reparto Fácil";
  const cleanPhone = params.phone.trim();
  const cleanAddress = params.address.trim();
  const phoneDigits = cleanPhone.replace(/\D/g, "");
  const uniqueId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const email = `cliente_${phoneDigits || uniqueId}@repartofacil.com`;
  const password = `rf_${uniqueId}!`;

  let response: Response;
  try {
    response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        display_name: cleanName,
        role: "Client",
        phone: cleanPhone,
        address: cleanAddress,
      }),
    });
  } catch (error) {
    console.error("Error al registrar invitado en /api/auth/register:", error);
    throw new Error(
      "No se pudo conectar con el servicio de compras. Revisá tu conexión e intentá nuevamente."
    );
  }

  if (!response.ok) {
    const fallbackEmail = `invitado_${uniqueId}@repartofacil.com`;
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fallbackEmail,
          password,
          display_name: cleanName,
          role: "Client",
          phone: cleanPhone,
          address: cleanAddress,
        }),
      });
    } catch {
      /* se procesa el error en el chequeo siguiente */
    }
  }

  const data = await response.json();
  if (!response.ok || !data.user || !data.access_token) {
    throw new Error(data.detail || "No se pudo registrar la cuenta para confirmar el pedido.");
  }

  const user = data.user;
  const token = data.access_token;
  const userAccountId = user.userId || user.uid || generateUniqueEntityId("usr_cli");
  const clientProfileId = user.id || generateUniqueEntityId("cli");

  const clientProfile: ClientProfile = {
    id: clientProfileId,
    uid: userAccountId,
    userId: userAccountId,
    displayName: user.displayName || cleanName,
    email: user.email || email,
    role: "Client" as const,
    phone: user.phone || cleanPhone,
    address: user.address || cleanAddress,
  };

  saveClientProfile(clientProfile, token);
  return clientProfile;
}
