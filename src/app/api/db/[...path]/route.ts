import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, queryDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "https://cobrofacil.157.151.3.66.sslip.io";

function isDbReady(): boolean {
  try {
    return isDatabaseConfigured();
  } catch {
    return false;
  }
}

function rejectLegacyOrders() {
  return NextResponse.json({ error: "Usá la API protegida de pedidos." }, { status: 410 });
}

async function handleGetClient(clientId: string) {
  if (!isDbReady()) return null;

  try {
    // 1. Buscar en public.clientes
    const clientRows = await queryDb(
      `SELECT id, nombre, telefono, direccion, email, uuid
       FROM public.clientes
       WHERE uuid = $1 OR id::text = $1 OR email = $1 OR LOWER(nombre) = LOWER($1)
       LIMIT 1`,
      [clientId]
    );

    if (clientRows && clientRows.length > 0) {
      const c = clientRows[0];
      return {
        id: c.uuid || String(c.id),
        displayName: c.nombre || "Cliente",
        phone: c.telefono || "",
        address: c.direccion || "",
        email: c.email || "",
      };
    }

    // 2. Si no tiene fila en clientes, buscar en public.usuarios (admin/operador/cliente)
    const cleanUser = clientId.replace(/^cli-|-01$|^user-/gi, "");
    const userRows = await queryDb(
      `SELECT u.id, u.username, u.nombre, u.role, u.empresa_id, u.sucursal_id,
              s.nombre as sucursal_nombre, s.direccion as sucursal_direccion,
              s.telefono as sucursal_telefono, s.whatsapp as sucursal_whatsapp
       FROM public.usuarios u
       LEFT JOIN public.sucursales s ON s.id = u.sucursal_id
       WHERE u.username = $1 OR u.id::text = $1 OR LOWER(u.nombre) = LOWER($1)
          OR LOWER(u.username) = LOWER($2)
       LIMIT 1`,
      [clientId, cleanUser]
    );

    if (userRows && userRows.length > 0) {
      const u = userRows[0];
      const displayName = u.nombre || u.username;
      const phone = u.sucursal_whatsapp || u.sucursal_telefono || "+5491135627803";
      const address = u.sucursal_direccion || "alfaro 1964";
      const email = `${u.username}@repartofacil.com`;

      // Crear o sincronizar fila en clientes para persistencia
      try {
        await queryDb(
          `INSERT INTO public.clientes (empresa_id, sucursal_id, nombre, telefono, direccion, email, uuid)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [u.empresa_id || 1, u.sucursal_id || 1, displayName, phone, address, email, clientId]
        );
      } catch (insertErr) {
        console.warn("[DB Proxy] Aviso insertando cliente desde usuario:", insertErr);
      }

      return {
        id: clientId,
        displayName,
        phone,
        address,
        email,
      };
    }

    // 3. Buscar en local_users
    const localUserRows = await queryDb(
      `SELECT id, email, display_name, role, empresa_id, sucursal_id
       FROM public.local_users
       WHERE id = $1 OR email = $1 OR LOWER(email) = LOWER($2)
       LIMIT 1`,
      [clientId, `${cleanUser}@repartofacil.com`]
    );

    if (localUserRows && localUserRows.length > 0) {
      const lu = localUserRows[0];
      const displayName = lu.display_name || cleanUser;
      const phone = "+5491135627803";
      const address = "alfaro 1964";
      const email = lu.email;

      try {
        await queryDb(
          `INSERT INTO public.clientes (empresa_id, sucursal_id, nombre, telefono, direccion, email, uuid)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [lu.empresa_id || 1, lu.sucursal_id || 1, displayName, phone, address, email, clientId]
        );
      } catch (insertErr) {
        console.warn("[DB Proxy] Aviso insertando cliente desde local_user:", insertErr);
      }

      return {
        id: clientId,
        displayName,
        phone,
        address,
        email,
      };
    }

    return null;
  } catch (err) {
    console.error("[DB Proxy] Error consultando cliente en PostgreSQL:", err);
    return null;
  }
}

async function handlePatchClient(clientId: string, bodyText: string) {
  if (!isDbReady()) return null;

  try {
    let body: any = {};
    try { body = JSON.parse(bodyText); } catch {}
    const { displayName, phone, address } = body;

    if (displayName || phone || address) {
      const updated = await queryDb(
        `UPDATE public.clientes
         SET nombre = COALESCE($1, nombre),
             telefono = COALESCE($2, telefono),
             direccion = COALESCE($3, direccion)
         WHERE uuid = $4 OR id::text = $4 OR email = $4 OR LOWER(nombre) = LOWER($4)
         RETURNING id, nombre, telefono, direccion, email, uuid`,
        [displayName || null, phone || null, address || null, clientId]
      );

      if (updated && updated.length > 0) {
        const c = updated[0];
        return {
          id: c.uuid || String(c.id),
          displayName: c.nombre,
          phone: c.telefono,
          address: c.direccion,
          email: c.email,
        };
      }
    }
    return null;
  } catch (err) {
    console.warn("[DB Proxy] Error en PATCH de cliente en PostgreSQL:", err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  if (path[0] === "orders") return rejectLegacyOrders();

  if (path[0] === "clients") {
    if (path[1]) {
      const client = await handleGetClient(path[1]);
      if (client) {
        return NextResponse.json(client);
      }
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    return NextResponse.json([]);
  }

  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/db/${pathStr}${search}`;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, { headers, cache: "no-store", signal: controller.signal })
      .finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      console.warn(`[DB Proxy] Backend respondió status ${res.status} para ${url}`);
      return NextResponse.json(path.length % 2 === 1 ? [] : null, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[DB Proxy] No se pudo consultar el documento:", error);
    return NextResponse.json({ error: "No se pudo consultar el documento." }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  if (path[0] === "orders") return rejectLegacyOrders();

  if (path[0] === "clients") {
    if (isDbReady()) {
      try {
        const bodyText = await request.text();
        let body: any = {};
        try { body = JSON.parse(bodyText); } catch {}
        const id = body.id || `cli_${Date.now()}`;
        const name = body.displayName || body.name || "Cliente";
        const phone = body.phone || body.customerPhone || "";
        const address = body.address || body.deliveryAddress || "";
        const email = body.email || "";

        await queryDb(
          `INSERT INTO public.clientes (empresa_id, sucursal_id, nombre, telefono, direccion, email, uuid)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [body.empresa_id || 1, body.sucursal_id || 1, name, phone, address, email, id]
        );

        return NextResponse.json({ id, displayName: name, phone, address, email }, { status: 201 });
      } catch (err) {
        console.warn("[DB Proxy] Error creando cliente en PostgreSQL:", err);
      }
    }
    return NextResponse.json({ error: "No se pudo crear cliente" }, { status: 400 });
  }

  const url = `${BACKEND_URL}/api/db/${pathStr}`;
  try {
    const body = await request.text();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[DB Proxy] No se pudo crear el documento:", error);
    return NextResponse.json({ error: "No se pudo crear el documento." }, { status: 503 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (path[0] === "orders") return rejectLegacyOrders();

  if (path[0] === "clients" && path[1]) {
    const bodyText = await request.text();
    const patched = await handlePatchClient(path[1], bodyText);
    if (patched) {
      return NextResponse.json(patched);
    }
    if (isDbReady()) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    return forwardMutation(request, path.join("/"), "PATCH", bodyText);
  }

  return forwardMutation(request, path.join("/"), "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (path[0] === "orders") return rejectLegacyOrders();
  return forwardMutation(request, path.join("/"), "DELETE");
}

async function forwardMutation(request: NextRequest, path: string, method: "PATCH" | "DELETE", cachedBody?: string) {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authorization = request.headers.get("authorization");
    if (authorization) headers.Authorization = authorization;
    const body = method === "PATCH" ? (cachedBody !== undefined ? cachedBody : await request.text()) : undefined;
    const response = await fetch(`${BACKEND_URL}/api/db/${path}`, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[DB Proxy] No se pudo actualizar el documento:", error);
    return NextResponse.json({ error: "No se pudo actualizar el documento." }, { status: 503 });
  }
}
