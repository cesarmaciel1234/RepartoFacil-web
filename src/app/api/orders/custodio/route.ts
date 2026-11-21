import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export const dynamic = "force-dynamic";

import { ejecutarAuditoriaCustodio } from "@/lib/custodio";


// GET /api/orders/custodio: Auditoría periódica disparada por polling o cron
export async function GET() {
  const resultado = await ejecutarAuditoriaCustodio();
  return NextResponse.json({ success: true, ...resultado });
}

// POST /api/orders/custodio: Pings de telemetría, desconexión forzada o liberación manual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, driverId, driverName, orderId, lat, lng, reason } = body;

    // 1. Ping GPS de telemetría del repartidor activo
    if (action === "ping" && driverId) {
      await queryDb(
        `UPDATE repartofacil_pedidos 
         SET driver_last_ping = NOW(),
             driver_lat = COALESCE($1, driver_lat),
             driver_lng = COALESCE($2, driver_lng),
             custodio_advertencia_at = NULL,
             custodio_estado = 'normal'
         WHERE repartidor_id = $3
           AND estado NOT IN ('Delivered', 'delivered', 'cancelled', 'rejected')`,
        [lat, lng, driverId]
      );
      return NextResponse.json({ success: true, action: "ping_recorded" });
    }

    // 2. Desconexión explícita del chofer (Cierra sesión o apaga turno con pedidos activos)
    if (action === "driver_disconnected" && driverId) {
      const pedidosChofer = await queryDb(
        `SELECT id, estado, repartidor_nombre FROM repartofacil_pedidos 
         WHERE repartidor_id = $1 AND estado NOT IN ('Delivered', 'delivered', 'cancelled', 'rejected')`,
        [driverId]
      );

      for (const p of pedidosChofer) {
        const nuevoEstado = p.estado === "ready" || p.estado === "Ready" ? "ready" : "confirmed";
        await queryDb(
          `UPDATE repartofacil_pedidos 
           SET repartidor_id = NULL,
               repartidor_nombre = NULL,
               estado = $1,
               custodio_estado = 'reingresado',
               custodio_advertencia_at = NULL,
               updated_at = NOW()
           WHERE id = $2`,
          [nuevoEstado, p.id]
        );

        const msgId = `msg-custodio-${Date.now()}`;
        const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
        const content = `🚨 [Custodio del Sistema]: El repartidor asignado (${driverName || p.repartidor_nombre || "Lucas"}) se desconectó. El pedido #${p.id} vuelve automáticamente a la bandeja pública disponible para que otro chofer cercano lo tome.`;

        await queryDb(
          `INSERT INTO repartofacil_chat_mensajes 
           (id, order_id, author_role, author_name, content, timestamp_str, created_at)
           VALUES ($1, $2, 'system', 'Sistema Reparto Fácil (Custodio)', $3, $4, NOW())`,
          [msgId, p.id, content, horaStr]
        ).catch(() => {});
      }

      return NextResponse.json({ success: true, action: "disconnected_unassigned", count: pedidosChofer.length });
    }

    // 3. Liberación manual forzada desde Cobro Fácil o Cliente ("Chofer no responde / No se mueve")
    if (action === "force_release" && orderId) {
      const rows = await queryDb(`SELECT id, estado, repartidor_nombre FROM repartofacil_pedidos WHERE id = $1`, [orderId]);
      if (rows.length === 0) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      }

      const p = rows[0];
      const choferPrevio = p.repartidor_nombre || "el chofer";
      const nuevoEstado = p.estado === "ready" || p.estado === "Ready" ? "ready" : "confirmed";

      await queryDb(
        `UPDATE repartofacil_pedidos 
         SET repartidor_id = NULL,
             repartidor_nombre = NULL,
             estado = $1,
             custodio_estado = 'reingresado',
             custodio_advertencia_at = NULL,
             updated_at = NOW()
         WHERE id = $2`,
        [nuevoEstado, orderId]
      );

      const msgId = `msg-custodio-${Date.now()}`;
      const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      const motivo = reason || "inactividad o falta de respuesta del chofer";
      const content = `🚨 [Custodio del Sistema]: Pedido reincorporado a la bandeja por ${motivo}. El repartidor anterior (${choferPrevio}) fue desasociado. Buscando nuevo repartidor disponible...`;

      await queryDb(
        `INSERT INTO repartofacil_chat_mensajes 
         (id, order_id, author_role, author_name, content, timestamp_str, created_at)
         VALUES ($1, $2, 'system', 'Sistema Reparto Fácil (Custodio)', $3, $4, NOW())`,
        [msgId, orderId, content, horaStr]
      ).catch(() => {});

      return NextResponse.json({ success: true, action: "force_released", orderId });
    }

    // 4. Retomar pedido cancelado/expirado por timeout
    if (action === "retry_order" && orderId) {
      await queryDb(
        `UPDATE repartofacil_pedidos 
         SET estado = 'pending_store',
             custodio_estado = 'reintentado',
             custodio_advertencia_at = NULL,
             repartidor_id = NULL,
             repartidor_nombre = NULL,
             created_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [orderId]
      );

      const msgId = `msg-retry-${Date.now()}`;
      const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      const content = `🔄 [Cliente]: El cliente ha retomado el pedido #${orderId}. Esperando confirmación y preparación por parte de la empresa...`;

      await queryDb(
        `INSERT INTO repartofacil_chat_mensajes 
         (id, order_id, author_role, author_name, content, timestamp_str, created_at)
         VALUES ($1, $2, 'client', 'Cliente Web', $3, $4, NOW())`,
        [msgId, orderId, content, horaStr]
      ).catch(() => {});

      return NextResponse.json({ success: true, action: "order_retried", orderId });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
