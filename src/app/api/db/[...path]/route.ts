import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/db/${pathStr}${search}`;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) {
      // Retornar lista vacía para colecciones o null para documentos
      return NextResponse.json(path.length % 2 === 1 ? [] : null, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.warn(`[DB Proxy GET] ${url}:`, err.message);
    return NextResponse.json(path.length % 2 === 1 ? [] : null);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/api/db/${pathStr}`;

  try {
    const body = await request.text();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
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
    console.warn(`[DB Proxy POST] ${url}:`, err.message);
    try {
      const parsed = JSON.parse(await request.text());
      return NextResponse.json({ id: `id-${Date.now()}`, ...parsed });
    } catch {
      return NextResponse.json({ id: `id-${Date.now()}` });
    }
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/api/db/${pathStr}`;

  try {
    const body = await request.text();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(url, {
      method: "PATCH",
      headers,
      body,
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.warn(`[DB Proxy PATCH] ${url}:`, err.message);
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL}/api/db/${pathStr}`;

  try {
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(url, { method: "DELETE", headers, cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.warn(`[DB Proxy DELETE] ${url}:`, err.message);
    return NextResponse.json({ success: true });
  }
}
