import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/api/cobrofacil/${pathStr}`;

  try {
    const body = await request.text();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`[CobroFacil Proxy Error] POST ${url}:`, err.message);
    return NextResponse.json(
      { detail: "No se pudo sincronizar con Cobro Fácil local/nube" },
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
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/cobrofacil/${pathStr}${search}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ detail: "Servicio no disponible" }, { status: 503 });
  }
}
