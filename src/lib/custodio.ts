import { queryDb } from "@/lib/db";

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

    // 2. Buscar pedidos sin aceptar por la empresa tras el tiempo límite estándar (60 minutos)
    const sqlTimeout = `
      SELECT id, estado, cliente_nombre, created_at
      FROM repartofacil_pedidos
      WHERE estado IN ('pending_store', 'pending', 'Pending')
        AND created_at < NOW() - INTERVAL '60 minutes'
    `;
    const pedidosExpirados = await queryDb(sqlTimeout);

    let canceladosTimeout = 0;
    for (const exp of pedidosExpirados) {
      await queryDb(
        `UPDATE repartofacil_pedidos
         SET estado = 'cancelled_timeout',
             custodio_estado = 'timeout_sin_respuesta',
             updated_at = NOW()
         WHERE id = $1`,
        [exp.id]
      );

      const msgId = `msg-timeout-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      const content = `⏰ [Custodio del Sistema]: El pedido #${exp.id} no fue aceptado por el comercio en el tiempo límite estándar (1 hora). El pedido ha sido cancelado automáticamente. El cliente puede retomarlo en esta empresa o solicitarlo a otra tienda desde el catálogo multitienda.`;

      await queryDb(
        `INSERT INTO repartofacil_chat_mensajes 
         (id, order_id, author_role, author_name, content, timestamp_str, created_at)
         VALUES ($1, $2, 'system', 'Sistema Reparto Fácil (Custodio)', $3, $4, NOW())`,
        [msgId, exp.id, content, horaStr]
      ).catch(() => {});

      canceladosTimeout++;
    }

    return { total: pedidos.length, advertencias, liberados, canceladosTimeout };
  } catch (err: any) {
    console.error("[Custodio Error]:", err.message);
    return { error: err.message };
  }
}
