import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
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

async function readBackendJson(response: Response) {
  const text = await response.text();
  const trimmed = text.trim();
  const contentType = response.headers.get("content-type") || "";
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
  let gatewayAttempts = 0;

  while (true) {
    const remaining = deadline - Date.now();
    if (remaining <= 500) break;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), remaining);
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

      const canRetryGateway = GATEWAY_STATUSES.has(response.status) && gatewayAttempts < 4 && deadline - Date.now() > 1000;
      console.error(`[Auth Proxy] ${init.method} ${path}: respuesta no JSON`, response.status);
      if (!canRetryGateway) break;
      gatewayAttempts += 1;
      await sleep(Math.min(5000, deadline - Date.now() - 500));
    } catch (error) {
      const name = error instanceof Error ? error.name : "UnknownError";
      console.error(`[Auth Proxy Error] ${init.method} ${path}:`, name);
      const canRetryNetwork = init.retryNetwork && gatewayAttempts < 4 && deadline - Date.now() > 1000;
      if (!canRetryNetwork) break;
      gatewayAttempts += 1;
      await sleep(Math.min(5000, deadline - Date.now() - 500));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return NextResponse.json(
    { detail: "Servicio de autenticación no disponible. Intentá nuevamente." },
    { status: 503 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const authHeader = request.headers.get("authorization");
  if (authHeader) headers.Authorization = authHeader;
  const body = await request.text();
  return forwardAuth(path.join("/"), { method: "POST", headers, body, retryNetwork: false });
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
