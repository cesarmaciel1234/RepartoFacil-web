import { NextResponse } from "next/server";
import { APP_RELEASE, APP_VERSION } from "@/lib/appVersion";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    app: "Reparto Fácil",
    version: APP_VERSION,
    release: APP_RELEASE,
    status: "online",
    timestamp: new Date().toISOString(),
    features: [
      "Vista inicial: Mercados y Empresas (Marketplace multitienda)",
      "Safe area insets dinámicos para iPhone (Notch y Dynamic Island)",
      "Búsqueda cruzada de productos entre comercios",
      "Sincronización automática de inventario TPV Cobro Fácil",
      "Chat tripartito y telemetría de repartidor",
      "Chat de pedidos activos integrado y carrito blanco/azul",
      "Perfil de repartidor blanco y amarillo",
      "Pedidos embalados visibles en la ruta del repartidor asignado",
      "Actualización transitoria del repartidor y catálogo offline del comprador",
      "Autorización de pedidos y verificación de precios en servidor",
    ],
  });
}
