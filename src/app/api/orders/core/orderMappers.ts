export function normalizePaymentMethod(value: unknown): "cash" | "transfer" | "card" | "web" {
  switch (String(value || "").toLowerCase()) {
    case "cash":
    case "efectivo":
      return "cash";
    case "transfer":
    case "transferencia":
      return "transfer";
    case "card":
    case "tarjeta":
      return "card";
    default:
      return "web";
  }
}

export function mapDbRowToOrder(row: any) {
  let items = [];
  try {
    items = typeof row.items === "string" ? JSON.parse(row.items) : row.items || [];
  } catch {
    items = [];
  }

  return {
    id: row.id,
    ticketId: row.ticket_id || null,
    clientId: row.cliente_id || null,
    clientUserId: row.cliente_usuario_id || null,
    empresaId: row.empresa_id || 1,
    empresaSlug: row.empresa_slug || "maciel",
    clientName: row.cliente_nombre || "Cliente",
    customerName: row.cliente_nombre || "Cliente",
    customerPhone: row.cliente_telefono || "+54 9 11 3562-7803",
    deliveryAddress: row.direccion_entrega || "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui",
    deliveryType: row.tipo_entrega || "delivery",
    paymentMethod: normalizePaymentMethod(row.metodo_pago),
    status: row.estado || "Pending",
    driverId: row.repartidor_id || null,
    driverName: row.repartidor_nombre || null,
    driverUserId: row.repartidor_usuario_id || null,
    items,
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.costo_envio) || 0,
    total: Number(row.total) || 0,
    driverEarnings: row.ganancia_repartidor == null ? null : Number(row.ganancia_repartidor),
    distanceKm: Number(row.distancia_km) || 1.8,
    distanceToStoreKm: 0.8,
    distanceToDeliveryKm: Number(row.distancia_km) || 1.8,
    estimatedMinutes: Number(row.minutos_estimados) || 20,
    branch: row.sucursal_nombre || row.sucursal_origen || "Alfaro 1964",
    storeAddress: row.sucursal_direccion || "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui",
    storePhone: row.sucursal_whatsapp || "1135627803",
    storeCoords: (row.sucursal_latitud != null && row.sucursal_longitud != null)
      ? { lat: Number(row.sucursal_latitud), lng: Number(row.sucursal_longitud) }
      : { lat: -34.4865222, lng: -58.8335788 },
    sucursal_id: row.sucursal_id != null ? Number(row.sucursal_id) : 1,
    destinationCoords: (row.delivery_lat != null && row.delivery_lng != null)
      ? { lat: Number(row.delivery_lat), lng: Number(row.delivery_lng) }
      : { lat: -34.4895, lng: -58.8315 },
    deliveryCoordinates: (row.delivery_lat != null && row.delivery_lng != null)
      ? { lat: Number(row.delivery_lat), lng: Number(row.delivery_lng) }
      : null,
    notes: row.notas || "",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export function mapDriverActionResult(row: any, isDelivery: boolean) {
  const order = mapDbRowToOrder(row);
  if (!isDelivery) return order;
  return {
    ...order,
    driverSettlement: {
      earning: row.ganancia_repartidor == null ? null : Number(row.ganancia_repartidor),
      cashCollected: normalizePaymentMethod(row.metodo_pago) === "cash"
        ? row.total == null ? null : Number(row.total)
        : 0,
    },
  };
}
