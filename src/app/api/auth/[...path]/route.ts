import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/api/auth/${pathStr}`;

  try {
    const body = await request.text();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`[Auth Proxy Error] POST ${url}:`, err.message);
    return NextResponse.json(
      { detail: "No se pudo conectar con el servidor de autenticación local" },
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

    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`[Auth Proxy Error] GET ${url}:`, err.message);
    return NextResponse.json(
      { detail: "No se pudo conectar con el servidor de autenticación local" },
      { status: 503 }
    );
  }
}
