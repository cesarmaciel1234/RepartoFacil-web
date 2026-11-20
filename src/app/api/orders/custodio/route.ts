import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Función central del Custodio que audita las órdenes asignadas y actúa si hay desconexión o inmovilidad
export async function ejecutarAuditoriaCustodio() {
  try {
    // 1. Buscar pedidos asignados activos (que no estén entregados ni cancelados)
    const sqlActivos = `
      SELECT id, estado, repartidor_id, repartidor_nombre, cliente_nombre,
             driver_last_ping, custodio_advertencia_at, custodio_estado, updated_at
      FROM repartofacil_pedidos
      WHERE repartidor_id IS NOT NULL 
        AND estado NOT IN ('Delivered', 'delivered', 'cancelled', 'rejected')
    `;
    const pedidos = await queryDb(sqlActivos);

    let advertencias = 0;
    let liberados = 0;
    const ahora = Date.now();

    for (const p of pedidos) {
      const orderId = p.id;
      const driverNombre = p.repartidor_nombre || "Lucas Motomensajero";
      
      // Tiempo desde último ping GPS o última actualización
      const lastPingTime = p.driver_last_ping ? new Date(p.driver_last_ping).getTime() : new Date(p.updated_at).getTime();
      const minutosInactivo = (ahora - lastPingTime) / (1000 * 60);

      // CASO B: Ya se le había advertido y pasaron más de 1.5 minutos sin respuesta ni ping
      if (p.custodio_advertencia_at) {
        const advertenciaTime = new Date(p.custodio_advertencia_at).getTime();
        const minutosDesdeAdvertencia = (ahora - advertenciaTime) / (1000 * 60);

        if (minutosDesdeAdvertencia >= 1.5) {
          // Desasociar chofer y devolver a la bandeja pública
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

          // Publicar mensaje oficial del Custodio en el chat tripartito
          const msgId = `msg-custodio-${Date.now()}`;
          const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
          const content = `🚨 [Custodio del Sistema]: El pedido volvió a la bandeja de repartidores disponibles. El chofer (${driverNombre}) fue desvinculado por desconexión e inactividad sin respuesta. Buscando un nuevo repartidor en la zona...`;

          await queryDb(
            `INSERT INTO repartofacil_chat_mensajes 
             (id, order_id, author_role, author_name, content, timestamp_str, created_at)
             VALUES ($1, $2, 'system', 'Sistema Reparto Fácil (Custodio)', $3, $4, NOW())`,
            [msgId, orderId, content, horaStr]
          ).catch(() => {});

          liberados++;
        }
      } 
      // CASO A: Lleva más de 2.5 minutos sin ping / movimiento y aún no se le advirtió
      else if (minutosInactivo >= 2.5) {
        const msgId = `msg-custodio-${Date.now()}`;
        const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
        const content = `⚠️ [Custodio del Sistema]: El repartidor (${driverNombre}) parece haberse desconectado o no registra movimiento en su ubicación. Por favor, confirma tu estado en este chat. Si no respondes a la brevedad, el pedido volverá automáticamente a la bandeja pública para ser reasignado a otro chofer.`;

        await queryDb(
          `UPDATE repartofacil_pedidos 
           SET custodio_advertencia_at = NOW(),
               custodio_estado = 'advertencia',
               updated_at = NOW()
           WHERE id = $1`,
          [orderId]
        );

        await queryDb(
          `INSERT INTO repartofacil_chat_mensajes 
           (id, order_id, author_role, author_name, content, timestamp_str, created_at)
           VALUES ($1, $2, 'system', 'Sistema Reparto Fácil (Custodio)', $3, $4, NOW())`,
          [msgId, orderId, content, horaStr]
        ).catch(() => {});

        advertencias++;
      }
    }

    return { total: pedidos.length, advertencias, liberados };
  } catch (err: any) {
    console.error("[Custodio Error]:", err.message);
    return { error: err.message };
  }
}

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

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
