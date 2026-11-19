import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");

  // Retornar lista vacía para colecciones o null para documentos
  if (pathStr.includes("orders") || pathStr.includes("alerts") || pathStr.includes("driverProfiles")) {
    return NextResponse.json([]);
  }
  return NextResponse.json({});
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ id: `id-${Date.now()}`, ...body });
  } catch {
    return NextResponse.json({ id: `id-${Date.now()}` });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, ...body });
  } catch {
    return NextResponse.json({ success: true });
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
