import { NextRequest, NextResponse } from "next/server";
import { fetchCobroFacilCatalog } from "../catalogService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-id, x-role",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
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
