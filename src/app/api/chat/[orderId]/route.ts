import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  try {
    const rows = await queryDb(
      "SELECT id, order_id, author_role, author_name, content, timestamp_str, created_at FROM repartofacil_chat_mensajes WHERE order_id = $1 ORDER BY created_at ASC",
      [orderId]
    );

    const messages = rows.map((r: any) => ({
      id: r.id,
      orderId: r.order_id,
      authorRole: r.author_role,
      authorName: r.author_name,
      content: r.content,
      timestamp: r.timestamp_str,
    }));

    return NextResponse.json({ success: true, orderId, messages });
  } catch (err: any) {
    console.warn(`[Chat API GET Error for ${orderId}]:`, err.message);
    return NextResponse.json({ success: false, messages: [] });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  try {
    const body = await request.json();
    const id = body.id || `msg-${Date.now()}`;
    const authorRole = body.authorRole || "client";
    const authorName = body.authorName || (authorRole === "driver" ? "Lucas Motomensajero" : "Cliente");
    const content = body.content || "";
    const timestampStr = body.timestamp || new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

    if (!content.trim()) {
      return NextResponse.json({ error: "Contenido requerido" }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO repartofacil_chat_mensajes (id, order_id, author_role, author_name, content, timestamp_str, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;

    const rows = await queryDb(insertQuery, [id, orderId, authorRole, authorName, content, timestampStr]);

    return NextResponse.json({
      success: true,
      message: {
        id: rows[0].id,
        orderId: rows[0].order_id,
        authorRole: rows[0].author_role,
        authorName: rows[0].author_name,
        content: rows[0].content,
        timestamp: rows[0].timestamp_str,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.warn(`[Chat API POST Error for ${orderId}]:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
