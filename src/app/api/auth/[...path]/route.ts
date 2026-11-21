import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const AUTH_TIMEOUT_MS = 60_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/api/auth/${pathStr}`;

  let body = "";
  try {
    body = await request.text();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(
      `[Auth Proxy Error] POST ${pathStr}:`,
      err instanceof Error ? err.name : "UnknownError"
    );
    return NextResponse.json(
      { detail: "Servicio de autenticación no disponible. Intentá nuevamente." },
      { status: 503 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/api/auth/${pathStr}`;

  try {
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(
      `[Auth Proxy Error] GET ${pathStr}:`,
      err instanceof Error ? err.name : "UnknownError"
    );
    return NextResponse.json(
      { detail: "Servicio de autenticación no disponible. Intentá nuevamente." },
      { status: 503 }
    );
  }
}
