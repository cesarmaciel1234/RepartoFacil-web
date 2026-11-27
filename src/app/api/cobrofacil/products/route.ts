import { NextRequest, NextResponse } from "next/server";
import { queryDb, isDatabaseConfigured } from "@/lib/db";
import productImageManifest from "@/data/productImageManifest.json";
import {
  FALLBACK_PRODUCTS,
  FALLBACK_PRODUCTS_SUC_1,
} from "@/data/fallbackCatalog";

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
const PRODUCT_IMAGE_BY_NAME = productImageManifest as Record<string, string>;

type PosBaseRow = {
  columnas: unknown;
  filas: unknown;
  sucursal_id?: number;
  sucursal_nombre?: string;
};

function normalizeProductName(value: unknown) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getProductImage(name: string) {
  return PRODUCT_IMAGE_BY_NAME[normalizeProductName(name)];
}

function parseArray(value: unknown): unknown[] {
  if (value === null || value === undefined || value === "") return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function finiteNumber(value: unknown): number | undefined {
  if (
    value === null ||
    value === undefined ||
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !value.trim())
  ) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapStoredRows(rows: PosBaseRow[]): Record<string, unknown>[] {
  const records = new Map<string, Record<string, unknown>>();

  rows.forEach((row, rowIndex) => {
    try {
      const columns = parseArray(row.columnas).map(String);
      const storedRows = parseArray(row.filas);
      storedRows.forEach((storedRow, itemIndex) => {
        let item: Record<string, unknown>;
        if (Array.isArray(storedRow)) {
          item = {};
          columns.forEach((column, columnIndex) => {
            item[column] = storedRow[columnIndex];
          });
        } else if (storedRow && typeof storedRow === "object") {
          item = storedRow as Record<string, unknown>;
        } else {
          return;
        }

        const key = item.id ?? item.codigo ?? `${rowIndex}-${itemIndex}`;
        records.set(String(key), item);
      });
    } catch (e) {
      console.warn("[CobroFacil products] Error mapeando fila:", e);
    }
  });

  return [...records.values()];
}

function mapProduct(
  item: Record<string, unknown>,
  options: {
    idPrefix: string;
    companyId: string;
    companyName: string;
    source: string;
    categoryMap?: Record<string, string>;
    sucursal_id?: number;
  }
) {
  const name = String(item.nombre || "").trim();
  const productId = item.id ?? item.codigo;
  if (!name || productId === undefined || productId === null || String(productId).trim() === "") {
    return null;
  }

  const rawDepartment = String(item.departamento || "").trim();
  const categoryId = String(item.categoria ?? "");
  const rawCategory = String(options.categoryMap?.[categoryId] || item.categoria || "").trim();
  const department = (rawDepartment || rawCategory || "GENERAL").toUpperCase();
  const price = finiteNumber(item.precio);
  const rawStock = item.stock ?? item.stock_actual ?? item.cantidad ?? item.stockKg ?? item.existencia;
  const parsedStock = finiteNumber(rawStock);

  // En TPV de carnicerías, el stock a menudo viene en 0.0 o negativo por ventas pesadas en mostrador.
  // Si tiene precio activo, asignar stock disponible positivo.
  const stockKg = parsedStock !== undefined && parsedStock > 0
    ? parsedStock
    : (parsedStock !== undefined && parsedStock < 0 ? Math.abs(parsedStock) + 100 : 999);
  const image = getProductImage(name);
  const code = String(item.codigo || productId);

  const isLowStock = stockKg > 0 && stockKg < 5;
  const dynamicBadge = isLowStock
    ? `⚡ ÚLTIMOS ${stockKg} ${String(item.unidad || "KG").toUpperCase()}`
    : department;

  return {
    id: `${options.idPrefix}${productId}`,
    name,
    category: department.toLowerCase(),
    categoryName: department,
    department,
    ...(price !== undefined && price > 0 ? { price } : {}),
    unit: String(item.unidad || "KG").trim().toUpperCase(),
    description: `${department} · Inventario en vivo ${options.companyName}. Código TPV: ${code}.`,
    ...(image ? { image } : {}),
    stock: stockKg,
    stockKg,
    priceSource: "tpv" as const,
    badge: dynamicBadge,
    isOutOfStock: false,
    isLowStock,
    companyId: options.companyId,
    companyName: options.companyName,
    ...(options.sucursal_id != null ? { sucursal_id: options.sucursal_id } : {}),
    source: options.source,
    synchronizedFromPos: true,
  };
}

export async function GET(request: NextRequest) {
  if (isDatabaseConfigured()) {
    try {
      const warnings: string[] = [];
      const categoryMap: Record<string, string> = {};
      const branchIdParam = request.nextUrl.searchParams.get("sucursal_id");
      const hasBranchFilter = branchIdParam !== null && branchIdParam !== "" && !isNaN(Number(branchIdParam));
      const targetBranchId = hasBranchFilter ? Number(branchIdParam) : null;

      try {
        const catRows = await queryDb<PosBaseRow>(
          `SELECT columnas, filas, sucursal_id FROM pos_base WHERE tabla = 'categorias' ORDER BY id ASC`
        );
        for (const category of mapStoredRows(catRows)) {
          if (category.id !== undefined && category.nombre) {
            categoryMap[String(category.id)] = String(category.nombre);
          }
        }
      } catch (error) {
        console.warn("[CobroFacil products] No se pudieron cargar categorías:", error);
      }

      // Todas las terminales de Frigorífico Maciel (empresa 1) corresponden a Alfaro 1964
      const prodSql = targetBranchId != null
        ? (targetBranchId === 1
            ? "SELECT columnas, filas, sucursal_id, sucursal_nombre FROM pos_base WHERE empresa_id = 1 AND tabla = 'productos' ORDER BY id DESC"
            : `SELECT columnas, filas, sucursal_id, sucursal_nombre FROM pos_base WHERE tabla = 'productos' AND sucursal_id = ${targetBranchId} ORDER BY id DESC`)
        : "SELECT columnas, filas, sucursal_id, sucursal_nombre FROM pos_base WHERE empresa_id = 1 AND tabla = 'productos' ORDER BY id DESC";
      const prodRows = await queryDb<PosBaseRow>(prodSql);

      const macielCompanyId = "frigorifico-maciel";
      const macielCompanyName = "Frigorífico Maciel";
      const rawProducts: NonNullable<ReturnType<typeof mapProduct>>[] = [];

      for (const row of prodRows) {
        const rowSid = 1;
        const branchCompId = `${macielCompanyId}-suc-1`;
        const mapped = mapStoredRows([row])
          .map((item) =>
            mapProduct(
              item,
              {
                idPrefix: `tpv-suc-1-`,
                companyId: branchCompId,
                companyName: macielCompanyName,
                source: `pos_base (${row.sucursal_nombre || "Alfaro 1964"})`,
                categoryMap,
                sucursal_id: rowSid,
              }
            )
          )
          .filter((item): item is NonNullable<typeof item> => item !== null);
        rawProducts.push(...mapped);
      }

      // Deduplicar productos por código/ID único para evitar artículos duplicados de distintas terminales
      const productMap = new Map<string, NonNullable<ReturnType<typeof mapProduct>>>();
      for (const prod of rawProducts) {
        const rawCode = String(prod.id || "").replace(/^tpv-suc-\d+-/, "").trim();
        const normName = normalizeProductName(prod.name);
        const key = rawCode || normName;
        const existing = productMap.get(key);
        if (!existing) {
          productMap.set(key, prod);
        } else {
          const existingPrice = existing.price || 0;
          const currentPrice = prod.price || 0;
          const preferNewName = prod.name.trim().length > existing.name.trim().length;
          if (currentPrice > 0 && (existingPrice === 0 || (prod.stockKg || 0) > (existing.stockKg || 0) || preferNewName)) {
            productMap.set(key, {
              ...prod,
              name: preferNewName ? prod.name : existing.name,
              image: prod.image || existing.image,
            });
          }
        }
      }
      const products = Array.from(productMap.values());

      if (!hasBranchFilter) {
        const otherCompaniesProducts: NonNullable<ReturnType<typeof mapProduct>>[] = [];
        try {
          const allEmpresas = await queryDb(
            "SELECT id, nombre, slug FROM public.empresas WHERE activo = 1 AND id > 1 ORDER BY id ASC"
          );
          for (const emp of allEmpresas) {
            const eid = Number(emp.id);
            const slug = String(emp.slug || "").toLowerCase().trim();
            const nombre = String(emp.nombre || "").toLowerCase().trim();

            if (slug === "prueba" || eid === 2 || /prueba|test/i.test(nombre)) {
              continue;
            }

            const compId = slug ? `empresa-${slug}` : `empresa-${eid}`;
            const compName = String(emp.nombre || `Empresa ${eid}`);

            try {
              const empProdRows = await queryDb<PosBaseRow>(
                `SELECT columnas, filas FROM empresa_${eid}.pos_base WHERE tabla = 'productos' ORDER BY id ASC`
              );
              const mapped = mapStoredRows(empProdRows)
                .map((item) =>
                  mapProduct(
                    item,
                    {
                      idPrefix: `emp-${eid}-tpv-`,
                      companyId: compId,
                      companyName: compName,
                      source: `empresa_${eid}.pos_base`,
                    }
                  )
                )
                .filter((item): item is NonNullable<typeof item> => item !== null);
              otherCompaniesProducts.push(...mapped);
            } catch {
              // Esquema sin pos_base disponible
            }
          }
        } catch (error) {
          console.warn("[CobroFacil products] No se pudo leer otras empresas:", error);
        }

        const allProducts = [...products, ...otherCompaniesProducts];

        return NextResponse.json({
          success: true,
          source: "crm-libro-local (PostgreSQL Render)",
          terminal: "MACIEL - DESKTOP-7Q2Q4VD",
          sucursal: "Alfaro 1964",
          total: allProducts.length,
          products: allProducts,
          warnings,
        }, { headers: CORS_HEADERS });
      }

      return NextResponse.json({
        success: true,
        source: "crm-libro-local (PostgreSQL Render)",
        terminal: "MACIEL - DESKTOP-7Q2Q4VD",
        sucursal: "Alfaro 1964",
        total: products.length,
        products: products,
        warnings,
      }, { headers: CORS_HEADERS });
    } catch (dbErr: any) {
      console.warn("[CobroFacil DB Query Fallback]:", dbErr.message);
    }
  }

  // Fallback de resiliencia
  const branchIdParam = request.nextUrl.searchParams.get("sucursal_id");
  const targetBranchId = branchIdParam ? Number(branchIdParam) : null;
  const fallbackList = targetBranchId === 1 ? FALLBACK_PRODUCTS_SUC_1 : FALLBACK_PRODUCTS;

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
