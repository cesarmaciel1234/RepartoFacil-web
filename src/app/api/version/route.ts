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
      "Ficha pública del comercio y reseñas de pedidos entregados",
      "Despertar nativo y protección de base de datos (/api/wake)",
      "Navegación libre de catálogo para visitantes sin bloqueo GPS",
      "Flujo de repartidor en dos etapas: retiro en negocio y entrega",
      "Eventos y sincronización automática en chat tripartito",
      "DriverTopBar ultra-compacto adaptado a pantallas móviles pequeñas",
      "Badges de mensajes no leídos en Copiloto IA y Chat de repartidor",
      "Integración nativa PWA (Web Audio, Vibración, WakeLock de pantalla y App Badging)",
    ],
  });
}
