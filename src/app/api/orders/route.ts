import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function mapDbRowToOrder(row: any) {
  let items = [];
  try {
    items = typeof row.items === "string" ? JSON.parse(row.items) : row.items || [];
  } catch {
    items = [];
  }

  return {
    id: row.id,
    clientName: row.cliente_nombre || "Cliente",
    customerName: row.cliente_nombre || "Cliente",
    customerPhone: row.cliente_telefono || "+54 9 341 555-1234",
    deliveryAddress: row.direccion_entrega || "Tucumán 2130, Rosario",
    deliveryType: row.tipo_entrega || "delivery",
    paymentMethod: row.metodo_pago || "cash",
    status: row.estado || "Pending",
    driverId: row.repartidor_id || null,
    driverName: row.repartidor_nombre || null,
    items,
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.costo_envio) || 0,
    total: Number(row.total) || 0,
    driverEarnings: Number(row.ganancia_repartidor) || 2450,
    distanceKm: Number(row.distancia_km) || 1.8,
    distanceToStoreKm: 0.8,
    distanceToDeliveryKm: Number(row.distancia_km) || 1.8,
    estimatedMinutes: Number(row.minutos_estimados) || 20,
    branch: row.sucursal_origen || "Frigorífico Maciel - Central (Tucumán 2130)",
    storeCoords: { lat: -32.9372, lng: -60.6542 },
    destinationCoords: { lat: -32.9395, lng: -60.6515 },
    notes: row.notas || "",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

// GET /api/orders: Obtener todos los pedidos reales de PostgreSQL crm-libro-local
export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get("status");
    let query = "SELECT * FROM repartofacil_pedidos";
    const values: any[] = [];
    if (statusParam) {
      query += " WHERE estado = $1";
      values.push(statusParam);
    }
    query += " ORDER BY created_at DESC LIMIT 50";

    const rows = await queryDb(query, values);
    const orders = rows.map(mapDbRowToOrder);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("[Orders API GET Error]:", err.message);
    return NextResponse.json(
      { error: "No se pudieron obtener pedidos de la base de datos", detail: err.message },
      { status: 500 }
    );
  }
}

// POST /api/orders: Crear nuevo pedido real desde la tienda
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const orderId = data.id || `RF-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertQuery = `
      INSERT INTO repartofacil_pedidos (
        id, cliente_nombre, cliente_telefono, direccion_entrega, tipo_entrega,
        metodo_pago, estado, repartidor_id, repartidor_nombre, items,
        subtotal, costo_envio, total, ganancia_repartidor, distancia_km,
        minutos_estimados, sucursal_origen, notas, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        estado = EXCLUDED.estado,
        repartidor_id = EXCLUDED.repartidor_id,
        repartidor_nombre = EXCLUDED.repartidor_nombre,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      orderId,
      data.customerName || data.clientName || "Cliente Web",
      data.customerPhone || "+54 9 341 555-1234",
      data.deliveryAddress || "Tucumán 2130, Rosario",
      data.deliveryType || "delivery",
      data.paymentMethod || "cash",
      data.status || "Pending",
      data.driverId || null,
      data.driverName || null,
      JSON.stringify(data.items || []),
      data.subtotal || 0,
      data.deliveryFee || 0,
      data.total || 0,
      data.driverEarnings || 2450,
      data.distanceKm || 1.8,
      data.estimatedMinutes || 20,
      data.branch || "Frigorífico Maciel - Central (Tucumán 2130)",
      data.notes || "",
    ];

    const result = await queryDb(insertQuery, values);
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

// PATCH /api/orders: Tomar pedido (Assigned) o Entregar pedido (Delivered)
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, status, driverId, driverName } = data;

    if (!id) {
      return NextResponse.json({ error: "id de pedido requerido" }, { status: 400 });
    }

    let updateQuery = "UPDATE repartofacil_pedidos SET updated_at = NOW()";
    const values: any[] = [];
    let idx = 1;

    if (status) {
      updateQuery += `, estado = $${idx++}`;
      values.push(status);
    }
    if (driverId !== undefined) {
      updateQuery += `, repartidor_id = $${idx++}`;
      values.push(driverId);
    }
    if (driverName !== undefined) {
      updateQuery += `, repartidor_nombre = $${idx++}`;
      values.push(driverName);
    }

    updateQuery += ` WHERE id = $${idx} RETURNING *;`;
    values.push(id);

    const rows = await queryDb(updateQuery, values);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const updated = mapDbRowToOrder(rows[0]);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[Orders API PATCH Error]:", err.message);
    return NextResponse.json(
      { error: "Error al actualizar el pedido en PostgreSQL", detail: err.message },
      { status: 500 }
    );
  }
}
