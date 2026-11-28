/**
 * Motor de Pedidos y Cliente - Fachada Central
 * Re-exporta submódulos especializados para mantener compatibilidad total:
 * - customerProfileService: Perfil de cliente, guardado local, autoregistro de invitados.
 * - orderCreationService: Validación del carrito, cálculo de tarifas y POST /api/orders.
 * - whatsappMessageService: Construcción del enlace con detalle para WhatsApp.
 */

export {
  CUSTOMER_STORAGE_KEY,
  PLACEHOLDER_CUSTOMER_NAMES,
  PLACEHOLDER_CUSTOMER_PHONE,
  PLACEHOLDER_CUSTOMER_ADDRESSES,
  loadSavedCustomer,
  saveCustomerData,
  readRegisteredCustomer,
  refreshMissingCustomerProfile,
  saveMissingCustomerProfile,
  autoRegisterGuestCustomer,
} from "./customerProfileService";

export { createOrder } from "./orderCreationService";

export { buildWhatsAppLink } from "./whatsappMessageService";
