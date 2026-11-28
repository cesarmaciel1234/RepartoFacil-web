import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";
import { authenticateOrderUser } from "@/lib/orderAuth";
import { mapDriverActionResult } from "./orderMappers";

export async function handlePatchOrder(request: NextRequest) {
  try {
    const auth = await authenticateOrderUser(request, ["Client", "Driver"]);
    if (auth.response) return auth.response;
    const data = await request.json();
    const { id, status } = data;
    const driverId = auth.user.id;
    const driverUserId = auth.user.id;
    const driverName = auth.user.displayName || "Repartidor";

    if (!id) {
      return NextResponse.json({ error: "id de pedido requerido" }, { status: 400 });
    }

    const isAssignment = status === "Assigned";
    const isPickup = status === "Picked Up" || status === "in_transit" || status === "picked_up";
    const isDelivery = status === "Delivered";
    const isPacked = status === "embalado" || status === "ready";
    const driverAction = isAssignment || isPickup || isDelivery;
    const isCancellation = status === "cancelled_by_client";

    if ((!driverAction && !isCancellation && !isPacked) ||
        (driverAction && auth.user.role !== "Driver") ||
        (isPacked && auth.user.role === "Driver") ||
        (isCancellation && auth.user.role !== "Client")) {
      return NextResponse.json({ error: "La cuenta no puede realizar esta acción." }, { status: 403 });
    }
    if (driverAction && data.driverId !== undefined && data.driverId !== driverId) {
      return NextResponse.json({ error: "El repartidor no coincide con la sesión." }, { status: 403 });
    }

    let updateQuery = "UPDATE repartofacil_pedidos SET updated_at = NOW()";
    const values: any[] = [];
    let idx = 1;

    if (status) {
      updateQuery += `, estado = $${idx++}`;
      values.push(status);
      if (status === "Assigned" || isPickup) {
        updateQuery += `, driver_last_ping = NOW(), custodio_estado = 'normal', custodio_advertencia_at = NULL`;
      }
    }
    if (driverAction) {
      updateQuery += `, repartidor_id = $${idx++}`;
      values.push(driverId);
    }
    if (driverAction) {
      updateQuery += `, repartidor_usuario_id = $${idx++}`;
      values.push(driverUserId);
    }
    if (driverAction) {
      updateQuery += `, repartidor_nombre = $${idx++}`;
      values.push(driverName);
    }
    if (isPacked && data.recargo_espera && Number(data.recargo_espera) > 0) {
      updateQuery += `, ganancia_repartidor = COALESCE(ganancia_repartidor, 0) + $${idx++}`;
      values.push(Number(data.recargo_espera));
    }
    updateQuery += ` WHERE id = $${idx++}`;
    values.push(id);
    if (isAssignment) {
      updateQuery += " AND (repartidor_id IS NULL OR repartidor_id = '') AND LOWER(TRIM(estado)) IN ('confirmed', 'ready', 'accepted', 'embalado', 'pending', 'pending_store')";
    } else if (isPickup) {
      updateQuery += ` AND repartidor_id = $${idx++} AND LOWER(TRIM(estado)) IN ('assigned', 'ready', 'accepted', 'embalado')`;
      values.push(driverId);
    } else if (isDelivery) {
      updateQuery += ` AND repartidor_id = $${idx++} AND LOWER(TRIM(estado)) IN ('assigned', 'picked up', 'in transit', 'ready', 'embalado')`;
      values.push(driverId);
    } else if (isPacked) {
      updateQuery += ` AND LOWER(TRIM(estado)) NOT IN ('delivered', 'cancelled', 'cancelled_by_client', 'rejected')`;
    } else {
      updateQuery += ` AND (cliente_id = $${idx} OR cliente_usuario_id = $${idx}) AND LOWER(TRIM(estado)) NOT IN ('delivered', 'cancelled', 'cancelled_by_client', 'rejected')`;
      values.push(auth.user.id);
    }
    updateQuery += " RETURNING *;";

    const rows = await queryDb(updateQuery, values);
    if (rows.length === 0) {
      if (driverAction) {
        const existing = await queryDb(
          "SELECT * FROM repartofacil_pedidos WHERE id = $1 LIMIT 1",
          [id]
        );
        if (existing.length === 0) {
          return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
        }
        const existingStatus = String(existing[0].estado || "").trim().toLowerCase();
        const alreadyApplied = existing[0].repartidor_id === driverId && (
          isAssignment
            ? ["assigned", "picked up", "in transit", "ready", "embalado", "delivered"].includes(existingStatus)
            : isPickup
            ? ["picked up", "in transit", "delivered"].includes(existingStatus)
            : existingStatus === "delivered"
        );
        if (alreadyApplied) {
          return NextResponse.json(mapDriverActionResult(existing[0], isDelivery));
        }
        return NextResponse.json(
          {
            error: isAssignment ? "El pedido ya no está disponible." : "La acción no se puede confirmar para este repartidor.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "No se puede cancelar este pedido." }, { status: 409 });
    }

    const horaStr = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

    if (status === "Assigned") {
      const msgId = `msg-driver-${Date.now()}`;
      const txt = `Repartidor ${driverName || "Lucas Motomensajero"}: ¡Hola! He tomado tu pedido #${id} y voy hacia la sucursal a retirarlo 🛵💨`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at, author_id) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)",
        [msgId, id, "driver", driverName || "Lucas Motomensajero", txt, horaStr, driverId || null]
      ).catch(() => {});
    } else if (isPickup) {
      const msgId = `msg-driver-pickup-${Date.now()}`;
      const txt = `Repartidor ${driverName || "Lucas Motomensajero"}: Ya retiré el pedido #${id} del local y voy en camino a tu domicilio 🛵📦💨`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at, author_id) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)",
        [msgId, id, "driver", driverName || "Lucas Motomensajero", txt, horaStr, driverId || null]
      ).catch(() => {});
    } else if (isPacked) {
      const msgId = `msg-store-pack-${Date.now()}`;
      const recargo = Number(data.recargo_espera || 0);
      const txt = recargo > 0
        ? `Comercio: Pedido #${id} embalado y listo para retirar 📦✨ (Demora en mostrador: se acreditó +$${recargo.toLocaleString('es-AR')} extra por espera al repartidor ⏱️)`
        : `Comercio: Pedido #${id} embalado y listo para ser retirado por el repartidor 📦✨`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
        [msgId, id, "store", "Comercio", txt, horaStr]
      ).catch(() => {});
    } else if (status === "Delivered") {
      const msgId = `msg-driver-${Date.now()}`;
      const txt = `Repartidor ${driverName || "Lucas Motomensajero"}: Pedido #${id} entregado con éxito en destino. ¡Muchas gracias por tu compra! 📦✅`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
        [msgId, id, "driver", driverName || "Lucas Motomensajero", txt, horaStr]
      ).catch(() => {});
    } else if (status === "cancelled_by_client" || status === "cancelled" || status === "Cancelled") {
      const msgId = `msg-client-cancel-${Date.now()}`;
      const txt = `✕ El cliente canceló el pedido #${id}.`;
      await queryDb(
        "INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
        [msgId, id, "client", rows[0]?.cliente_nombre || "Cliente", txt, horaStr]
      ).catch(() => {});
    }

    const updated = mapDriverActionResult(rows[0], isDelivery);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[Orders API PATCH Error]:", err.message);
    return NextResponse.json(
      { error: "Error al actualizar el pedido en PostgreSQL", detail: err.message },
      { status: 500 }
    );
  }
}
