import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    app: "Reparto Fácil",
    version: "5.0",
    release: "v5.0-safe-area-multitienda",
    status: "online",
    timestamp: new Date().toISOString(),
    features: [
      "Vista inicial: Mercados y Empresas (Marketplace multitienda)",
      "Safe area insets dinámicos para iPhone (Notch y Dynamic Island)",
      "Búsqueda cruzada de productos entre comercios",
      "Sincronización automática de inventario TPV Cobro Fácil",
      "Chat tripartito y telemetría de repartidor",
    ],
  });
}
