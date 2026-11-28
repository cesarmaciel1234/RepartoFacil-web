import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";
import { ejecutarAuditoriaCustodio, isCustodioAutomaticEnabled } from "@/lib/custodio";
import { authenticateOrderUser } from "@/lib/orderAuth";
import { mapDbRowToOrder } from "./orderMappers";

export async function handleGetOrders(request: NextRequest) {
  try {
    const auth = await authenticateOrderUser(request, ["Client", "Driver"]);
    if (auth.response) return auth.response;
    if (isCustodioAutomaticEnabled()) {
      await ejecutarAuditoriaCustodio().catch((error) => console.error("[Custodio] Error en auditoría:", error));
    }

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const clienteId = searchParams.get("cliente_id") || searchParams.get("clientId");
    const empresaIdParam = searchParams.get("empresa_id") || searchParams.get("companyId");
    const driverIdParam = searchParams.get("repartidor_id") || searchParams.get("driverId");
    const viewParam = searchParams.get("view");
    const before = searchParams.get("before");

    if (before && (auth.user.role !== "Client" || viewParam !== "client_conversations" || before.length > 200)) {
      return NextResponse.json({ error: "Paginación no válida." }, { status: 400 });
    }

    let query = `
      SELECT repartofacil_pedidos.*,
             s.nombre AS sucursal_nombre,
             s.direccion AS sucursal_direccion,
             s.whatsapp AS sucursal_whatsapp,
             s.latitud AS sucursal_latitud,
             s.longitud AS sucursal_longitud
      FROM repartofacil_pedidos
      LEFT JOIN public.sucursales s ON repartofacil_pedidos.sucursal_id = s.id
      WHERE `;
    const values: any[] = [auth.user.id];
    let idx = 2;
    if (auth.user.role === "Client") {
      query += "(cliente_id = $1 OR cliente_usuario_id = $1)";
    } else {
      query += "(repartidor_id = $1 OR ((repartidor_id IS NULL OR repartidor_id = '') AND LOWER(TRIM(estado)) IN ('ready', 'confirmed', 'accepted', 'embalado') AND LOWER(COALESCE(tipo_entrega, 'delivery')) = 'delivery'))";
    }

    if (clienteId) {
      query += ` AND (cliente_id = $${idx} OR cliente_usuario_id = $${idx})`;
      values.push(clienteId);
      idx++;
    }

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

    if (viewParam === "driver_active" && driverIdParam) {
      query += ` AND repartidor_id = $${idx} AND LOWER(estado) IN ('assigned', 'picked up', 'in transit', 'accepted', 'ready', 'embalado')`;
      values.push(driverIdParam);
      idx++;
    } else if (viewParam === "driver_history" && driverIdParam) {
      query += ` AND repartidor_id = $${idx} AND estado = 'Delivered'`;
      values.push(driverIdParam);
      idx++;
    } else if (viewParam === "driver_available") {
      query += ` AND (repartidor_id IS NULL OR repartidor_id = '') AND LOWER(estado) IN ('ready', 'confirmed', 'pending', 'accepted', 'embalado') AND LOWER(COALESCE(tipo_entrega, 'delivery')) = 'delivery'`;
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

    const conversationView = auth.user.role === "Client" && viewParam === "client_conversations";
    const activity = (alias: string) =>
      `GREATEST(${alias}.created_at, COALESCE((SELECT MAX(m.created_at) FROM repartofacil_chat_mensajes m WHERE m.order_id = ${alias}.id), ${alias}.created_at))`;
    if (before) {
      query += ` AND (${activity("repartofacil_pedidos")}, id) < (
        SELECT ${activity("previous")}, previous.id FROM repartofacil_pedidos previous
        WHERE previous.id = $${idx} AND (previous.cliente_id = $1 OR previous.cliente_usuario_id = $1)
      )`;
      values.push(before);
    }
    query += conversationView
      ? ` ORDER BY ${activity("repartofacil_pedidos")} DESC, repartofacil_pedidos.id DESC LIMIT 50`
      : " ORDER BY repartofacil_pedidos.created_at DESC, repartofacil_pedidos.id DESC LIMIT 50";

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
