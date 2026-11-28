import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";
import { authenticateOrderUser } from "@/lib/orderAuth";
import { validateOrder } from "@/lib/validateOrder";
import { GET as readCatalog } from "@/app/api/cobrofacil/[...path]/route";
import { mapDbRowToOrder, normalizePaymentMethod } from "./orderMappers";

export async function handlePostOrder(request: NextRequest) {
  try {
    const auth = await authenticateOrderUser(request, ["Client"]);
    if (auth.response) return auth.response;
    const data = await request.json();
    const orderId = data.id || `RF-${Math.floor(1000 + Math.random() * 9000)}`;

    const clienteId = auth.user.id;
    const clienteUsuarioId = auth.user.id;
    if ((data.clientId && data.clientId !== clienteId) ||
        (data.clientUserId && data.clientUserId !== clienteUsuarioId)) {
      return NextResponse.json({ error: "El comprador no coincide con la sesión. Volvé a iniciar sesión." }, { status: 403 });
    }

    const [productResponse, companyResponse] = await Promise.all([
      readCatalog(request, { params: Promise.resolve({ path: ["products"] }) }),
      readCatalog(request, { params: Promise.resolve({ path: ["companies"] }) }),
    ]);
    const [productData, companyData] = await Promise.all([productResponse.json(), companyResponse.json()]);
    if (!productResponse.ok || !companyResponse.ok ||
        !Array.isArray(productData?.products) || !Array.isArray(companyData?.empresas) ||
        productData.products.length === 0 || companyData.empresas.length === 0) {
      return NextResponse.json({ error: "No se pudo validar el catálogo actualizado. Intentá nuevamente." }, { status: 503 });
    }
    let verified: ReturnType<typeof validateOrder>;
    try {
      verified = validateOrder(data, productData.products, companyData.empresas);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "El pedido no es válido." }, { status: 409 });
    }

    const destLat = data.deliveryLat ?? data.destinationCoords?.lat ?? data.deliveryCoordinates?.lat ?? null;
    const destLng = data.deliveryLng ?? data.destinationCoords?.lng ?? data.deliveryCoordinates?.lng ?? null;

    const sucursalId = (verified.company as any).sucursal_id != null
      ? Number((verified.company as any).sucursal_id)
      : (data.sucursalId != null ? Number(data.sucursalId) : (data.sucursal_id != null ? Number(data.sucursal_id) : 1));

    const insertQuery = `
      INSERT INTO repartofacil_pedidos (
        id, cliente_id, cliente_usuario_id, cliente_nombre, cliente_telefono, direccion_entrega, tipo_entrega,
        metodo_pago, estado, empresa_id, empresa_slug, repartidor_id, repartidor_nombre, items,
        subtotal, costo_envio, total, ganancia_repartidor, distancia_km,
        minutos_estimados, sucursal_origen, notas, ticket_id, delivery_lat, delivery_lng, sucursal_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;

    const values = [
      orderId,
      clienteId,
      clienteUsuarioId,
      data.customerName || data.clientName || "Cliente Web",
      data.customerPhone || "+54 9 11 3562-7803",
      data.deliveryAddress || "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui",
      data.deliveryType,
      normalizePaymentMethod(data.paymentMethod || data.metodo_pago),
      "pending_store",
      Number(verified.company.empresa_id),
      verified.company.slug,
      null,
      null,
      JSON.stringify(verified.items),
      verified.subtotal,
      verified.deliveryFee,
      verified.total,
      verified.tarifa.driverEarnings,
      verified.tarifa.distanceKm,
      verified.tarifa.estimatedMinutes,
      data.branch || verified.company.name,
      data.notes || "",
      null,
      destLat != null && !isNaN(Number(destLat)) ? Number(destLat) : null,
      destLng != null && !isNaN(Number(destLng)) ? Number(destLng) : null,
      sucursalId,
    ];

    const result = await queryDb(insertQuery, values);
    if (result.length === 0) {
      return NextResponse.json({ error: "El identificador del pedido ya existe. Intentá nuevamente." }, { status: 409 });
    }
    const created = mapDbRowToOrder(result[0]);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("[Orders API POST Error]:", err.message);
    return NextResponse.json(
      { error: "Error al guardar el pedido en PostgreSQL", detail: err.message },
      { status: 500 }
    );
  }
}
