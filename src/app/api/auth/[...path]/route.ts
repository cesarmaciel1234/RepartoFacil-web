import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "https://cobrofacil.157.151.3.66.sslip.io";
const AUTH_TIMEOUT_MS = 60_000;
const GATEWAY_STATUSES = new Set([502, 503, 504]);

type AuthInit = {
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: string;
  retryNetwork: boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readBackendJson(response: any) {
  if (typeof response.json === "function" && typeof response.text !== "function") {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  const text = await response.text();
  const trimmed = text.trim();
  const contentType = response.headers?.get?.("content-type") || "";
  const looksJson = contentType.includes("json") || trimmed.startsWith("{") || trimmed.startsWith("[");
  if (!looksJson) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function forwardAuth(path: string, init: AuthInit) {
  const url = `${BACKEND_URL}/api/auth/${path}`;
  const deadline = Date.now() + AUTH_TIMEOUT_MS;
  let attempts = 0;

  while (true) {
    const remaining = deadline - Date.now();
    if (remaining <= 500) break;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: init.method,
        headers: init.headers,
        body: init.body,
        cache: "no-store",
        signal: controller.signal,
      });
      const data = await readBackendJson(response);
      if (data !== null) {
        return NextResponse.json(data, { status: response.status });
      }

      const isGateway = GATEWAY_STATUSES.has(response.status);
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        console.warn(`[Auth Proxy] ${init.method} ${path}: backend respondió HTTP ${response.status} (despertando instancia Render...)`);
      }
      if (!isGateway || deadline - Date.now() <= 1500) break;
      attempts += 1;
      await sleep(Math.min(3000, deadline - Date.now() - 500));
    } catch (error) {
      if (controller.signal.aborted) break;
      const name = error instanceof Error ? error.name : "UnknownError";
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        console.warn(`[Auth Proxy] ${init.method} ${path}: conexión en espera (${name}), backend de Render despertando... Intento #${attempts + 1}`);
      }
      const canRetry = init.retryNetwork && deadline - Date.now() > 2000;
      if (!canRetry) break;
      attempts += 1;
      await sleep(Math.min(3000, deadline - Date.now() - 500));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return NextResponse.json(
    { detail: "Servicio de autenticación no disponible. El servidor está despertando, reintentá en unos segundos." },
    { status: 503 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const authHeader = request.headers.get("authorization");
  if (authHeader) headers.Authorization = authHeader;
  const body = await request.text();
  const res = await forwardAuth(pathStr, { method: "POST", headers, body, retryNetwork: true });

  if (pathStr === "login" && res.status === 200) {
    try {
      let reqBody: any = {};
      try { reqBody = JSON.parse(body); } catch {}
      const loginIdentifier = String(reqBody.email || reqBody.username || "").toLowerCase().trim();

      const data = await res.clone().json();
      if (data && data.user && (!data.user.phone || !data.user.address)) {
        let phone = data.user.phone;
        let address = data.user.address;

        let dbModule: any = null;
        try { dbModule = require("@/lib/db"); } catch {}

        if (dbModule && typeof dbModule.isDatabaseConfigured === "function" && dbModule.isDatabaseConfigured()) {
          try {
            const cleanUser = loginIdentifier.replace(/^cli-|-01$|^user-|@repartofacil\.com$/gi, "");
            const uRows = await dbModule.queryDb(
              `SELECT u.nombre, s.direccion, s.telefono, s.whatsapp
               FROM public.usuarios u
               LEFT JOIN public.sucursales s ON s.id = u.sucursal_id
               WHERE LOWER(u.username) = $1 OR LOWER(u.username) = $2 LIMIT 1`,
              [loginIdentifier, cleanUser]
            );
            if (uRows && uRows.length > 0) {
              const u = uRows[0];
              phone = phone || u.whatsapp || u.telefono || "+5491135627803";
              address = address || u.direccion || "alfaro 1964";
            }
          } catch {}
        }

        if (loginIdentifier.includes("maciel")) {
          phone = phone || "+5491135627803";
          address = address || "alfaro 1964";
        }

        if (phone || address) {
          data.user.phone = phone || "";
          data.user.address = address || "";
          return NextResponse.json(data, { status: 200 });
        }
      }
    } catch {}
  }

  return res;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const headers: Record<string, string> = {};
  const authHeader = request.headers.get("authorization");
  if (authHeader) headers.Authorization = authHeader;
  return forwardAuth(path.join("/"), { method: "GET", headers, retryNetwork: true });
}
