import { NextRequest, NextResponse } from "next/server";
import { fetchCobroFacilCatalog } from "../catalogService";
import { fetchCobroFacilCompanies } from "../companiesService";
import { FALLBACK_COMPANIES, FALLBACK_PRODUCTS, FALLBACK_PRODUCTS_SUC_1 } from "@/data/fallbackCatalog";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-id, x-role",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const BACKEND_URL = process.env.BACKEND_URL || "https://cobrofacil.157.151.3.66.sslip.io";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  // 1. Obtener productos directamente desde la base de datos o catálogo unificado
  if (pathStr === "products" || pathStr === "sync-inventory") {
    const sucursalId = request.nextUrl.searchParams.get("sucursal_id");
    const tienda = request.nextUrl.searchParams.get("tienda");
    const slug = request.nextUrl.searchParams.get("slug");
    const companyId = request.nextUrl.searchParams.get("companyId");
    const company_id = request.nextUrl.searchParams.get("company_id");

    const result = await fetchCobroFacilCatalog({
      sucursal_id: sucursalId,
      tienda,
      slug,
      companyId,
      company_id,
    });
    return NextResponse.json(result, { headers: CORS_HEADERS });
  }

  // 2. Obtener comercios / empresas con perfil unificado
  if (pathStr === "companies" || pathStr === "tiendas") {
    const result = await fetchCobroFacilCompanies();
    return NextResponse.json(result, { headers: CORS_HEADERS });
  }

  // 3. Fallback a proxy de backend con protección alta disponibilidad
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/cobrofacil/${pathStr}${search}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    throw new Error(`Backend retornó status HTTP ${res.status}`);
  } catch (error) {
    console.error(`[CobroFacil API] Falló proxy para ${pathStr}:`, error);

    if (pathStr === "products" || pathStr === "sync-inventory") {
      const branchIdParam = request.nextUrl.searchParams.get("sucursal_id");
      const targetBranchId = branchIdParam ? Number(branchIdParam) : null;
      const fallbackList = targetBranchId === 1
        ? FALLBACK_PRODUCTS_SUC_1
        : FALLBACK_PRODUCTS;

      return NextResponse.json(
        {
          success: true,
          source: "fallback-embedded (resiliencia alta disponibilidad)",
          terminal: "MACIEL - REPARTOFACIL CACHE",
          total: fallbackList.length,
          products: fallbackList,
          warnings: [],
        },
        { headers: CORS_HEADERS }
      );
    }

    if (pathStr === "companies" || pathStr === "tiendas") {
      return NextResponse.json(
        {
          success: true,
          source: "fallback-embedded",
          empresas: FALLBACK_COMPANIES,
          tiendas: FALLBACK_COMPANIES,
        },
        { headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { error: "No se pudo consultar Cobro Fácil. Intenta nuevamente más tarde." },
      { status: 503 }
    );
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = path.join("/");
  console.warn(`[CobroFacil API] POST no configurado para ${endpoint}.`);
  return NextResponse.json(
    { error: `La sincronización POST de '${endpoint}' no está configurada.` },
    { status: 501 }
  );
}
