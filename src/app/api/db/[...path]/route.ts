import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  // Si se consultan órdenes, conectar directamente a PostgreSQL crm-libro-local
  if (pathStr === "orders") {
    try {
      const rows = await queryDb(
        "SELECT * FROM repartofacil_pedidos ORDER BY created_at DESC LIMIT 50"
      );
      return NextResponse.json(rows.map(mapDbRowToOrder));
    } catch (err: any) {
      console.warn("[DB Proxy Orders GET Error]:", err.message);
    }
  }

  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/db/${pathStr}${search}`;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(url, { headers, cache: "no-store", signal: controller.signal })
      .finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      return NextResponse.json(path.length % 2 === 1 ? [] : null, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(path.length % 2 === 1 ? [] : null);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  // Si se crea una orden, guardar en PostgreSQL crm-libro-local
  if (pathStr === "orders") {
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
      return NextResponse.json(mapDbRowToOrder(result[0]), { status: 201 });
    } catch (err: any) {
      console.warn("[DB Proxy Orders POST Error]:", err.message);
    }
  }

  const url = `${BACKEND_URL}/api/db/${pathStr}`;
  try {
    const body = await request.text();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    try {
      const parsed = JSON.parse(await request.text());
      return NextResponse.json({ id: `id-${Date.now()}`, ...parsed });
    } catch {
      return NextResponse.json({ id: `id-${Date.now()}` });
    }
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  // Si se actualiza una orden
  if (pathStr.startsWith("orders")) {
    try {
      const data = await request.json();
      const orderId = path[1] || data.id;

      if (orderId) {
        let updateQuery = "UPDATE repartofacil_pedidos SET updated_at = NOW()";
        const values: any[] = [];
        let idx = 1;

        if (data.status) {
          updateQuery += `, estado = $${idx++}`;
          values.push(data.status);
        }
        if (data.driverId !== undefined) {
          updateQuery += `, repartidor_id = $${idx++}`;
          values.push(data.driverId);
        }
        if (data.driverName !== undefined) {
          updateQuery += `, repartidor_nombre = $${idx++}`;
          values.push(data.driverName);
        }

        updateQuery += ` WHERE id = $${idx} RETURNING *;`;
        values.push(orderId);

        const rows = await queryDb(updateQuery, values);
        if (rows.length > 0) {
          return NextResponse.json(mapDbRowToOrder(rows[0]));
        }
      }
    } catch (err: any) {
      console.warn("[DB Proxy Orders PATCH Error]:", err.message);
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return NextResponse.json({ success: true });
}
