import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";
import { ejecutarAuditoriaCustodio } from "./custodio/route";

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
    ticketId: row.ticket_id || null,
    clientId: row.cliente_id || null,
    clientUserId: row.cliente_usuario_id || null,
    empresaId: row.empresa_id || 1,
    empresaSlug: row.empresa_slug || "maciel",
    clientName: row.cliente_nombre || "Cliente",
    customerName: row.cliente_nombre || "Cliente",
    customerPhone: row.cliente_telefono || "+54 9 341 555-1234",
    deliveryAddress: row.direccion_entrega || "Tucumán 2130, Rosario",
    deliveryType: row.tipo_entrega || "delivery",
    paymentMethod: "Web",
    status: row.estado || "Pending",
    driverId: row.repartidor_id || null,
    driverName: row.repartidor_nombre || null,
    driverUserId: row.repartidor_usuario_id || null,
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

// GET /api/orders: Obtener pedidos con filtrado estricto por cliente, empresa o chofer
export async function GET(request: NextRequest) {
  try {
    // Custodio Intermediario del Sistema: audita desconexiones e inmovilidad de choferes asignados
    await ejecutarAuditoriaCustodio().catch(() => {});

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const clienteId = searchParams.get("cliente_id") || searchParams.get("clientId");
    const empresaIdParam = searchParams.get("empresa_id") || searchParams.get("companyId");
    const driverIdParam = searchParams.get("repartidor_id") || searchParams.get("driverId");
    const viewParam = searchParams.get("view"); // 'driver_active' | 'driver_available' | 'driver_history'

    let query = "SELECT * FROM repartofacil_pedidos WHERE 1=1";
    const values: any[] = [];
    let idx = 1;

    // 1. Aislamiento por Cliente: cada comprador ve ÚNICAMENTE sus pedidos
    if (clienteId) {
      query += ` AND (cliente_id = $${idx} OR cliente_usuario_id = $${idx})`;
      values.push(clienteId);
      idx++;
    }

    // 2. Aislamiento por Empresa: cada comercio ve ÚNICAMENTE sus ventas
    if (empresaIdParam) {
      if (empresaIdParam === "2" || empresaIdParam === "empresa-prueba" || empresaIdParam === "prueba") {
        query += ` AND (empresa_id = 2 OR empresa_slug = 'prueba')`;
      } else if (empresaIdParam === "1" || empresaIdParam === "frigorifico-maciel" || empresaIdParam === "maciel") {
        query += ` AND (empresa_id = 1 OR empresa_slug = 'maciel' OR empresa_id IS NULL)`;
      } else {
        query += ` AND (empresa_id = $${idx} OR empresa_slug = $${idx})`;
        values.push(isNaN(Number(empresaIdParam)) ? empresaIdParam : Number(empresaIdParam));
        idx++;
      }
    }

    // 3. Aislamiento por Repartidor
    if (viewParam === "driver_active" && driverIdParam) {
      query += ` AND repartidor_id = $${idx} AND estado IN ('Assigned', 'Picked Up', 'In Transit', 'accepted')`;
      values.push(driverIdParam);
      idx++;
    } else if (viewParam === "driver_history" && driverIdParam) {
      query += ` AND repartidor_id = $${idx} AND estado = 'Delivered'`;
      values.push(driverIdParam);
      idx++;
    } else if (viewParam === "driver_available") {
      query += ` AND (repartidor_id IS NULL OR repartidor_id = '') AND estado IN ('ready', 'confirmed', 'Pending', 'pending')`;
    } else if (driverIdParam && !viewParam) {
      query += ` AND repartidor_id = $${idx}`;
      values.push(driverIdParam);
      idx++;
    }

    if (statusParam) {
      query += ` AND estado = $${idx}`;
      values.push(statusParam);
      idx++;
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

// POST /api/orders: Crear nuevo pedido real desde la tienda con asignación de IDs únicos de cliente y empresa
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const orderId = data.id || `RF-${Math.floor(1000 + Math.random() * 9000)}`;

    const clienteId = data.clientId || data.cliente_id || `cli_${Math.random().toString(36).substring(2, 9)}`;
    const clienteUsuarioId = data.clientUserId || data.cliente_usuario_id || `usr_${clienteId}`;

    const isPrueba = data.companyId === "empresa-prueba" || data.empresaSlug === "prueba" || data.empresaId === 2;
    const empresaId = isPrueba ? 2 : (data.empresaId || 1);
    const empresaSlug = isPrueba ? "prueba" : (data.empresaSlug || "maciel");

    const insertQuery = `
      INSERT INTO repartofacil_pedidos (
        id, cliente_id, cliente_usuario_id, cliente_nombre, cliente_telefono, direccion_entrega, tipo_entrega,
        metodo_pago, estado, empresa_id, empresa_slug, repartidor_id, repartidor_nombre, items,
        subtotal, costo_envio, total, ganancia_repartidor, distancia_km,
        minutos_estimados, sucursal_origen, notas, ticket_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        estado = EXCLUDED.estado,
        cliente_id = COALESCE(EXCLUDED.cliente_id, repartofacil_pedidos.cliente_id),
        cliente_usuario_id = COALESCE(EXCLUDED.cliente_usuario_id, repartofacil_pedidos.cliente_usuario_id),
        empresa_id = COALESCE(EXCLUDED.empresa_id, repartofacil_pedidos.empresa_id),
        empresa_slug = COALESCE(EXCLUDED.empresa_slug, repartofacil_pedidos.empresa_slug),
        repartidor_id = EXCLUDED.repartidor_id,
        repartidor_nombre = EXCLUDED.repartidor_nombre,
        ticket_id = COALESCE(EXCLUDED.ticket_id, repartofacil_pedidos.ticket_id),
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      orderId,
      clienteId,
      clienteUsuarioId,
      data.customerName || data.clientName || "Cliente Web",
      data.customerPhone || "+54 9 341 555-1234",
      data.deliveryAddress || "Tucumán 2130, Rosario",
      data.deliveryType || "delivery",
      "Web",
      data.status || "pending_store",
      empresaId,
      empresaSlug,
      data.driverId || null,
      data.driverName || null,
      JSON.stringify(data.items || []),
      data.subtotal || 0,
      data.deliveryFee || 0,
      data.total || 0,
      data.driverEarnings || 2450,
      data.distanceKm || 1.8,
      data.estimatedMinutes || 20,
      data.branch || (isPrueba ? "Cobro Fácil - Empresa Prueba" : "Frigorífico Maciel - Central"),
      data.notes || "",
      data.ticketId || data.ticket_id || null,
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
    const { id, status, driverId, driverUserId, driverName, ticketId, ticket_id } = data;

    if (!id) {
      return NextResponse.json({ error: "id de pedido requerido" }, { status: 400 });
    }

    let updateQuery = "UPDATE repartofacil_pedidos SET updated_at = NOW()";
    const values: any[] = [];
    let idx = 1;

    if (status) {
      updateQuery += `, estado = $${idx++}`;
      values.push(status);
      if (status === "Assigned") {
        updateQuery += `, driver_last_ping = NOW(), custodio_estado = 'normal', custodio_advertencia_at = NULL`;
      }
    }
    if (driverId !== undefined) {
      updateQuery += `, repartidor_id = $${idx++}`;
      values.push(driverId);
    }
    if (driverUserId !== undefined) {
      updateQuery += `, repartidor_usuario_id = $${idx++}`;
      values.push(driverUserId);
    }
    if (driverName !== undefined) {
      updateQuery += `, repartidor_nombre = $${idx++}`;
      values.push(driverName);
    }
    const finalTicket = ticketId || ticket_id;
    if (finalTicket !== undefined) {
      updateQuery += `, ticket_id = $${idx++}`;
      values.push(finalTicket);
    }

    updateQuery += ` WHERE id = $${idx} RETURNING *;`;
    values.push(id);

    const rows = await queryDb(updateQuery, values);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Si el chofer acepta la orden o la entrega, registrar el evento en el chat tripartito
    if (status === "Assigned") {
      const msgId = `msg-driver-${Date.now()}`;
      const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      const txt = `Repartidor ${driverName || "Lucas Motomensajero"}: ¡Hola! He tomado tu pedido #${id} y voy hacia la sucursal a retirarlo 🛵💨`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at, author_id) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)",
        [msgId, id, "driver", driverName || "Lucas Motomensajero", txt, horaStr, driverId || null]
      ).catch(() => {});
    } else if (status === "Delivered") {
      const msgId = `msg-driver-${Date.now()}`;
      const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      const txt = `Repartidor ${driverName || "Lucas Motomensajero"}: Pedido #${id} entregado con éxito en destino. ¡Muchas gracias por tu compra! 📦✅`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
        [msgId, id, "driver", driverName || "Lucas Motomensajero", txt, horaStr]
      ).catch(() => {});
    } else if (status === "cancelled_by_client" || status === "cancelled" || status === "Cancelled") {
      const msgId = `msg-client-cancel-${Date.now()}`;
      const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      const txt = `✕ El cliente canceló el pedido #${id}.`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
        [msgId, id, "client", rows[0]?.cliente_nombre || "Cliente", txt, horaStr]
      ).catch(() => {});
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
