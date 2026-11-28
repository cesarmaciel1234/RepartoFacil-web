import { NextRequest, NextResponse } from "next/server";
import { queryDb, isDatabaseConfigured } from "@/lib/db";
import productImageManifest from "@/data/productImageManifest.json";
import {
  FALLBACK_COMPANIES,
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

function parseArray(value: unknown, label: string): unknown[] {
  if (value === null || value === undefined || value === "") {
    return [];
  }
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

function mapStoredRows(
  rows: PosBaseRow[],
  source: string,
  warnings: string[]
): Record<string, unknown>[] {
  const records = new Map<string, Record<string, unknown>>();

  rows.forEach((row, rowIndex) => {
    try {
      const columns = parseArray(row.columnas, `${source}.columnas`).map(String);
      const storedRows = parseArray(row.filas, `${source}.filas`);
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
          warnings.push(`${source}: se omitió una fila con formato inválido.`);
          return;
        }

        const key = item.id ?? item.codigo ?? `${rowIndex}-${itemIndex}`;
        records.set(String(key), item);
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const warning = `${source}: no se pudo leer un lote (${detail}).`;
      warnings.push(warning);
      console.warn(`[CobroFacil inventory] ${warning}`);
    }
  });

  return [...records.values()];
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

function mapProduct(
  item: Record<string, unknown>,
  options: {
    idPrefix: string;
    companyId: string;
    companyName: string;
    source: string;
    categoryMap?: Record<string, string>;
    sucursal_id?: number;
    empresa_id?: number;
  },
  warnings: string[]
) {
  const name = String(item.nombre || "").trim();
  const productId = item.id ?? item.codigo;
  if (!name || productId === undefined || productId === null || String(productId).trim() === "") {
    warnings.push(`${options.source}: se omitió un producto sin nombre o identificador.`);
    return null;
  }

  const rawDepartment = String(item.departamento || "").trim();
  const categoryId = String(item.categoria ?? "");
  const rawCategory = String(options.categoryMap?.[categoryId] || item.categoria || "").trim();
  const department = (rawDepartment || rawCategory || "GENERAL").toUpperCase();
  const price = finiteNumber(item.precio);
  const rawStock = item.stock ?? item.stock_actual ?? item.cantidad ?? item.stockKg ?? item.existencia;
  const parsedStock = finiteNumber(rawStock);
  // En carnicerías/TPV, el stock a menudo viene en 0.0 o negativo por ventas pesadas en mostrador sin stock inicial cargado.
  // Si tiene precio activo, asignar stock disponible positivo.
  const stockKg = parsedStock !== undefined && parsedStock > 0
    ? parsedStock
    : (parsedStock !== undefined && parsedStock < 0 ? Math.abs(parsedStock) + 100 : 999);
  const image = getProductImage(name);
  const code = String(item.codigo || productId);

  const isOutOfStock = false;
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
    ...(options.empresa_id != null ? { empresa_id: options.empresa_id } : {}),
    source: options.source,
    synchronizedFromPos: true,
  };
}

function getCompanyLocation(row: Record<string, any>) {
  const details =
    row.company_data && typeof row.company_data === "object" ? row.company_data : {};
  const address = [
    details.direccion_comercial,
    details.direccion,
    details.address,
    details.domicilio,
    details.ubicacion,
  ].find((value) => typeof value === "string" && value.trim());
  const parseCoordinate = (value: unknown) => {
    if (
      (typeof value !== "string" && typeof value !== "number") ||
      (typeof value === "string" && !value.trim())
    ) {
      return undefined;
    }
    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : undefined;
  };
  const latitude = parseCoordinate(details.latitud ?? details.latitude ?? details.lat);
  const longitude = parseCoordinate(details.longitud ?? details.longitude ?? details.lng);

  return {
    address: typeof address === "string" ? address.trim() : "",
    coordinates:
      latitude !== undefined &&
      longitude !== undefined &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
        ? { lat: latitude, lng: longitude }
        : undefined,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  // 1. Obtener productos directamente desde la base de datos PostgreSQL de Cobro Fácil (crm-libro-local)
  if (pathStr === "products" || pathStr === "sync-inventory") {
    if (isDatabaseConfigured()) {
      try {
        const warnings: string[] = [];
        const categoryMap: Record<string, string> = {};
        const branchIdParam = request.nextUrl.searchParams.get("sucursal_id");
        const tiendaParam = (
          request.nextUrl.searchParams.get("tienda") ||
          request.nextUrl.searchParams.get("slug") ||
          request.nextUrl.searchParams.get("companyId") ||
          request.nextUrl.searchParams.get("company_id") ||
          ""
        ).toLowerCase().trim();
        const isMacielParam =
          tiendaParam === "maciel" ||
          tiendaParam === "rumaul" ||
          tiendaParam.includes("maciel");

        const hasBranchFilter =
          (branchIdParam !== null && branchIdParam !== "" && !isNaN(Number(branchIdParam))) ||
          isMacielParam;
        const targetBranchId =
          branchIdParam !== null && branchIdParam !== "" && !isNaN(Number(branchIdParam))
            ? Number(branchIdParam)
            : isMacielParam
            ? 1
            : null;

      let macielMultiBranch = true;
      try {
        const sucCount = await queryDb<{ total: number }>(
          "SELECT COUNT(*)::integer AS total FROM public.sucursales WHERE empresa_id = 1 AND activo = 1 AND LOWER(nombre) NOT LIKE '%prueba%' AND LOWER(codigo) NOT LIKE '%prueba%'"
        );
        if (sucCount[0] && Number(sucCount[0].total) <= 1) macielMultiBranch = false;
      } catch (_) {}

      try {
        const catSql = targetBranchId != null
          ? `SELECT columnas, filas, sucursal_id FROM pos_base WHERE tabla = 'categorias' AND sucursal_id = ${targetBranchId} ORDER BY id ASC`
          : `SELECT columnas, filas, sucursal_id FROM pos_base WHERE tabla = 'categorias' ORDER BY id ASC`;
        const catRows = await queryDb<PosBaseRow>(catSql);
        for (const category of mapStoredRows(catRows, "pos_base.categorias", warnings)) {
          if (category.id !== undefined && category.nombre) {
            categoryMap[String(category.id)] = String(category.nombre);
          }
        }
      } catch (error) {
        console.warn("[CobroFacil inventory] No se pudieron cargar categorías:", error);
      }

      const prodSql = targetBranchId != null
        ? (targetBranchId === 1
            ? "SELECT columnas, filas, sucursal_id, sucursal_nombre FROM pos_base WHERE empresa_id = 1 AND tabla = 'productos' ORDER BY id DESC"
            : `SELECT columnas, filas, sucursal_id, sucursal_nombre FROM pos_base WHERE tabla = 'productos' AND sucursal_id = ${targetBranchId} ORDER BY id DESC`)
        : `SELECT columnas, filas, sucursal_id, sucursal_nombre FROM pos_base WHERE empresa_id = 1 AND tabla = 'productos' ORDER BY id DESC`;
      const prodRows = await queryDb<PosBaseRow>(prodSql);

      const macielCompanyId = "frigorifico-maciel";
      const macielCompanyName = "Frigorífico Maciel";
      const rawProducts: NonNullable<ReturnType<typeof mapProduct>>[] = [];

      for (const row of prodRows) {
        // En pos_base, todas las terminales de Frigorífico Maciel (empresa 1) corresponden a Alfaro 1964.
        // Asignar sucursal_id 1 para que pertenezcan a la sucursal activa Alfaro 1964.
        const rowSid = 1;
        const branchCompId = `${macielCompanyId}-suc-1`;
        const mapped = mapStoredRows([row], "pos_base.productos", warnings)
          .map((item) =>
            mapProduct(
              item,
              {
                idPrefix: `tpv-suc-1-`,
                companyId: branchCompId,
                companyName: macielCompanyName,
                source: `pos_base (${row.sucursal_nombre || 'Alfaro 1964'})`,
                categoryMap,
                sucursal_id: rowSid,
              },
              warnings
            )
          )
          .filter((item): item is NonNullable<typeof item> => item !== null);
        rawProducts.push(...mapped);
      }

      // Inicializar con el catálogo completo de 114 productos certificados de Maciel #1
      const productMap = new Map<string, NonNullable<ReturnType<typeof mapProduct>>>();
      for (const item of FALLBACK_PRODUCTS_SUC_1) {
        const rawCode = String(item.id || "").replace(/^(tpv|fallback)-suc-\d+-/, "").trim();
        const normName = normalizeProductName(item.name);
        const key = rawCode || normName;
        productMap.set(key, {
          ...item,
          id: `tpv-suc-1-${rawCode || item.id}`,
          companyId: `${macielCompanyId}-suc-1`,
          companyName: macielCompanyName,
          sucursal_id: 1,
          empresa_id: 1,
        } as any);
      }

      // Actualizar con precios y stocks en vivo desde pos_base (omitiendo IDs desbordados/corruptos)
      for (const prod of rawProducts) {
        const rawCode = String(prod.id || "").replace(/^(tpv|fallback)-suc-\d+-/, "").trim();
        if (rawCode === "2147483647") continue;
        const normName = normalizeProductName(prod.name);
        const key = productMap.has(rawCode) ? rawCode : (productMap.has(normName) ? normName : (rawCode || normName));
        const existing = productMap.get(key);
        if (!existing) {
          productMap.set(key, {
            ...prod,
            id: `tpv-suc-1-${rawCode}`,
            empresa_id: 1,
            sucursal_id: 1,
            companyId: `${macielCompanyId}-suc-1`,
          });
        } else {
          const existingPrice = existing.price || 0;
          const currentPrice = prod.price || 0;
          const preferNewName = prod.name.trim().length > existing.name.trim().length;
          productMap.set(key, {
            ...existing,
            ...prod,
            id: existing.id || `tpv-suc-1-${rawCode}`,
            price: currentPrice > 0 ? currentPrice : existingPrice,
            stockKg: (prod.stockKg || 0) > 0 ? prod.stockKg : existing.stockKg,
            stock: (prod.stock || 0) > 0 ? prod.stock : existing.stock,
            name: preferNewName ? prod.name : existing.name,
            image: prod.image || existing.image,
            empresa_id: 1,
            sucursal_id: 1,
            companyId: `${macielCompanyId}-suc-1`,
          });
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

            // Omitir empresas de prueba
            if (slug === "prueba" || eid === 2 || /prueba|test/i.test(nombre)) {
              continue;
            }

            const compId = slug ? `empresa-${slug}` : `empresa-${eid}`;
            const compName = String(emp.nombre || `Empresa ${eid}`);

            try {
              const empProdRows = await queryDb<PosBaseRow>(
                `SELECT columnas, filas FROM empresa_${eid}.pos_base WHERE tabla = 'productos' ORDER BY id ASC`
              );
              const mapped = mapStoredRows(
                empProdRows,
                `empresa_${eid}.pos_base.productos`,
                []
              )
                .map((item) =>
                  mapProduct(
                    item,
                    {
                      idPrefix: `emp-${eid}-tpv-`,
                      companyId: compId,
                      companyName: compName,
                      source: `empresa_${eid}.pos_base`,
                    },
                    []
                  )
                )
                .filter((item): item is NonNullable<typeof item> => item !== null);
              otherCompaniesProducts.push(...mapped);
            } catch {
              // Si la empresa no tiene esquema pos_base, tabla de inventario o catálogo publicado,
              // devolver [] limpio sin reportarlo como error ni generar advertencias para el comprador
              console.info(`[CobroFacil inventory] Empresa ${eid} (${emp.nombre}) sin inventario pos_base publicado.`);
            }
          }
        } catch (error) {
          console.warn("[CobroFacil inventory] No se pudo leer el listado de empresas:", error);
        }

        const allProducts = [...products, ...otherCompaniesProducts];

        return NextResponse.json({
          success: true,
          source: "crm-libro-local (PostgreSQL Render)",
          terminal: "MACIEL - DESKTOP-7Q2Q4VD",
          sucursal: prodRows.find((row) => row.sucursal_nombre)?.sucursal_nombre,
          total: allProducts.length,
          products: allProducts,
          warnings,
        }, { headers: CORS_HEADERS });
      }

      return NextResponse.json({
        success: true,
        source: "crm-libro-local (PostgreSQL Render)",
        terminal: "MACIEL - DESKTOP-7Q2Q4VD",
        sucursal: prodRows.find((row) => row.sucursal_nombre)?.sucursal_nombre,
        total: products.length,
        products: products,
        warnings,
      }, { headers: CORS_HEADERS });
    } catch (dbErr: any) {
      console.warn("[CobroFacil DB Query Fallback]:", dbErr.message);
    }
  }
}

  // 2. Empresas reales directamente desde crm-libro-local (PostgreSQL)
  if (pathStr === "companies" || pathStr === "tiendas") {
    if (isDatabaseConfigured()) {
      try {
        const dbEmpresas = await queryDb(
        `SELECT e.id, e.nombre, e.slug, e.cuit, to_jsonb(e) AS company_data,
          to_jsonb(p) AS public_profile, r.promedio, r.cantidad
         FROM public.empresas e
         LEFT JOIN public.repartofacil_empresa_perfiles p ON p.empresa_id = e.id
         LEFT JOIN (
           SELECT empresa_id, AVG(estrellas) AS promedio, COUNT(*) AS cantidad
           FROM public.repartofacil_resenas GROUP BY empresa_id
         ) r ON r.empresa_id = e.id
         WHERE e.activo = 1 ORDER BY e.id ASC`
      );

      // Obtener qué sucursales de public.pos_base tienen productos reales cargados
      const sucursalesConProductos = new Set<number>();
      try {
        const sucProdRows = await queryDb<{ sucursal_id: number }>(
          `SELECT DISTINCT sucursal_id FROM public.pos_base WHERE tabla = 'productos'`
        );
        for (const r of sucProdRows) {
          if (r.sucursal_id != null) sucursalesConProductos.add(Number(r.sucursal_id));
        }
      } catch (_) {}

      // Obtener qué esquemas empresa_X existen con tabla pos_base
      const esquemasConPosBase = new Set<number>();
      try {
        const tableRows = await queryDb<{ table_schema: string }>(
          `SELECT table_schema FROM information_schema.tables WHERE table_name = 'pos_base' AND table_schema LIKE 'empresa_%'`
        );
        for (const r of tableRows) {
          const match = r.table_schema.match(/^empresa_(\d+)$/);
          if (match) esquemasConPosBase.add(Number(match[1]));
        }
      } catch (_) {}

      const sucursalesPorEmpresa: Record<number, any[]> = {};
      try {
        const rows = await queryDb(
          `SELECT id, empresa_id, nombre, codigo, direccion, latitud, longitud, telefono, whatsapp, horario, es_centro_distribucion, rubro, costo_envio, monto_minimo_envio_gratis
           FROM public.sucursales
           WHERE activo = 1
           ORDER BY id ASC`
        );
        for (const s of rows || []) {
          const eid = Number(s.empresa_id);
          const isTestSuc = /prueba|test/i.test(String(s.nombre || "")) || /prueba|test/i.test(String(s.codigo || ""));
          // Ocultar sucursales de prueba o que no tengan productos en pos_base (excepto empresa principal)
          if (isTestSuc) continue;
          if (eid > 1 && sucursalesConProductos.size > 0 && !sucursalesConProductos.has(Number(s.id))) {
            continue;
          }

          if (!sucursalesPorEmpresa[eid]) sucursalesPorEmpresa[eid] = [];
          sucursalesPorEmpresa[eid].push({
            id: Number(s.id),
            nombre: String(s.nombre || `Sucursal ${s.id}`),
            codigo: s.codigo || "",
            rubro: s.rubro || "",
            direccion: s.direccion || "",
            latitud: s.latitud ? Number(s.latitud) : null,
            longitud: s.longitud ? Number(s.longitud) : null,
            telefono: s.telefono || "",
            whatsapp: s.whatsapp || "",
            horario: s.horario || "",
            costo_envio: s.costo_envio != null ? Number(s.costo_envio) : null,
            monto_minimo_envio_gratis: s.monto_minimo_envio_gratis != null ? Number(s.monto_minimo_envio_gratis) : null,
            esCentroDistribucion: Boolean(s.es_centro_distribucion),
          });
        }
      } catch (error) {
        console.warn("[CobroFacil companies] No se pudieron cargar sucursales:", error);
      }

      const pick = (details: Record<string, any>, keys: string[]) =>
        keys.map((key) => details[key]).find((value) => value !== undefined && value !== null && value !== "");
      const toNumber = (value: unknown, fallback: number) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      };
      const CATEGORY_SLUGS = ["carnes", "supermercados", "bebidas", "kioscos", "minimercados"] as const;
      const inferCategorySlug = (text: string) => {
        const lower = text.toLowerCase();
        if (/carne|carnic|frigor|pollo|granja/.test(lower)) return "carnes";
        if (/super/.test(lower)) return "supermercados";
        if (/kiosc|golosin/.test(lower)) return "kioscos";
        if (/bebida|vino|cerve/.test(lower)) return "bebidas";
        return "minimercados";
      };

      const dynamicCompanies = (dbEmpresas || [])
        .filter((row: any) => {
          const eid = Number(row.id);
          const slug = String(row.slug || "").toLowerCase().trim();
          const nombre = String(row.nombre || "").toLowerCase().trim();

          // Ocultar comercios de prueba
          if (eid === 2 || slug === "prueba" || /prueba|test/i.test(nombre)) {
            return false;
          }

          // Para empresas secundarias (eid > 1): ocultar si no tienen catálogo publicado, sucursales ni perfil público
          if (eid > 1) {
            const sucs = sucursalesPorEmpresa[eid] || [];
            const hasCatalog = esquemasConPosBase.has(eid);
            const pubProf = row.public_profile && typeof row.public_profile === "object" ? row.public_profile : null;
            const hasProfile = pubProf && Boolean(pubProf.nombre || pubProf.direccion);
            if (sucs.length === 0 && !hasCatalog && !hasProfile) {
              return false; // Empresa vacía / sin catálogo publicado -> ocultar de la portada
            }
          }

          return true;
        })
        .flatMap((row: any) => {
          const details: Record<string, any> =
            row.company_data && typeof row.company_data === "object" ? row.company_data : {};
          const profile: Record<string, unknown> =
            row.public_profile && typeof row.public_profile === "object" ? row.public_profile : {};
          const slug = (row.slug || "").toLowerCase().trim();
          const isMaciel = slug === "maciel" || Number(row.id) === 1;
          const companyLocation = getCompanyLocation({
            company_data: Object.keys(profile).length ? profile : details,
          });

          // Los ids históricos se conservan porque los pedidos ya guardados los referencian
          const baseId = isMaciel
            ? "frigorifico-maciel"
            : slug
              ? `empresa-${slug}`
              : `empresa-${row.id}`;

          const category = String(
            profile.rubro ||
              pick(details, ["rubro", "categoria", "category", "actividad"]) ||
              (isMaciel ? "Carnes y Pescados" : "Comercio")
          );
          const rawSlug = String(pick(details, ["categoria_slug", "category_slug"]) || "").toLowerCase();
          const categorySlug = (CATEGORY_SLUGS as readonly string[]).includes(rawSlug)
            ? rawSlug
            : inferCategorySlug(`${category} ${row.nombre || ""}`);
          const rating = Number(row.promedio);
          const badges = pick(details, ["badges", "etiquetas", "promociones"]);
          const isOpenValue = pick(details, ["abierto", "is_open", "isOpen"]);

          const baseCompany = {
            id: baseId,
            name: String(profile.nombre || pick(details, ["nombre_fantasia", "nombre_comercial"]) || row.nombre || `Empresa ${row.id}`),
            slug: slug || String(row.id),
            empresa_id: row.id,
            category,
            categorySlug,
            rating: Number.isFinite(rating) && rating > 0 ? rating : 0,
            ratingCount: toNumber(row.cantidad, 0),
            deliveryTimeMin: toNumber(pick(details, ["tiempo_entrega_min", "delivery_time_min"]), 20),
            deliveryTimeMax: toNumber(pick(details, ["tiempo_entrega_max", "delivery_time_max"]), 40),
            deliveryFee: toNumber(pick(details, ["costo_envio", "delivery_fee"]), 1500),
            freeDeliveryThreshold:
              toNumber(pick(details, ["envio_gratis_desde", "free_delivery_threshold"]), 0) || undefined,
            badges: Array.isArray(badges)
              ? badges.map(String)
              : typeof badges === "string" && badges.trim()
                ? badges.split(",").map((badge) => badge.trim()).filter(Boolean)
                : [],
            logoUrl: pick(details, ["logo_url", "logo", "logoUrl", "imagen"]) || undefined,
            address: companyLocation.address,
            ...(companyLocation.coordinates ? { coordinates: companyLocation.coordinates } : {}),
            phone: String(Object.keys(profile).length ? profile.whatsapp || "" : pick(details, ["telefono", "celular", "whatsapp", "phone"]) || ""),
            description: String(profile.descripcion || ""),
            openingHours: String(profile.horario || ""),
            cobroFacilApiEndpoint: process.env.NEXT_PUBLIC_COBRO_FACIL_URL || "https://cobrofacil.157.151.3.66.sslip.io",
            isOpen:
              isOpenValue === undefined
                ? true
                : !["0", "false", "no", "cerrado"].includes(String(isOpenValue).toLowerCase()),
          };

          const sucs = sucursalesPorEmpresa[Number(row.id)] || [];
          const isMultiBranch = sucs.length > 1;

          if (isMultiBranch) {
            // Modelo Hiperlocal: Cada sucursal compite por cercanía y estrellas en la portada
            return sucs.map((suc) => ({
              ...baseCompany,
              id: `${baseId}-suc-${suc.id}`,
              name: `${baseCompany.name} · ${suc.nombre}`,
              category: suc.rubro || baseCompany.category,
              address: suc.direccion || baseCompany.address,
              ...(suc.latitud && suc.longitud
                ? { coordinates: { lat: Number(suc.latitud), lng: Number(suc.longitud) } }
                : baseCompany.coordinates
                  ? { coordinates: baseCompany.coordinates }
                  : {}),
              phone: suc.whatsapp || suc.telefono || baseCompany.phone || "1135627803",
              openingHours: suc.horario || baseCompany.openingHours,
              deliveryFee: suc.costo_envio != null ? Number(suc.costo_envio) : baseCompany.deliveryFee,
              freeDeliveryThreshold: suc.monto_minimo_envio_gratis != null ? Number(suc.monto_minimo_envio_gratis) : baseCompany.freeDeliveryThreshold,
              sucursal_id: suc.id,
              parentCompanyId: baseId,
              parentSlug: slug,
              sucursales: sucs,
              isMultiBranch: true,
              isSingleBranch: false,
            }));
          }

          // Negocio Único (1 sucursal o Casa Central): Sin división
          const sucUnica = sucs[0];
          const companyId = sucUnica ? `${baseId}-suc-${sucUnica.id}` : baseId;
          const companyName = sucUnica
            ? (sucUnica.nombre.toLowerCase().startsWith(baseCompany.name.toLowerCase())
                ? sucUnica.nombre
                : (baseCompany.name.toLowerCase().startsWith(sucUnica.nombre.toLowerCase())
                    ? sucUnica.nombre
                    : `${baseCompany.name} · ${sucUnica.nombre}`))
            : baseCompany.name;
          return [{
            ...baseCompany,
            id: companyId,
            name: companyName,
            category: sucUnica?.rubro || baseCompany.category,
            address: sucUnica?.direccion || baseCompany.address || "alfaro 1964",
            ...(sucUnica?.latitud && sucUnica?.longitud
              ? { coordinates: { lat: Number(sucUnica.latitud), lng: Number(sucUnica.longitud) } }
              : baseCompany.coordinates
                ? { coordinates: baseCompany.coordinates }
                : { coordinates: { lat: -34.4865222, lng: -58.8335788 } }),
            phone: sucUnica?.whatsapp || sucUnica?.telefono || baseCompany.phone || "+5491135627803",
            openingHours: sucUnica?.horario || baseCompany.openingHours || "Lunes a sábado 9 a 21hs",
            deliveryFee: sucUnica?.costo_envio != null ? Number(sucUnica.costo_envio) : baseCompany.deliveryFee,
            freeDeliveryThreshold: sucUnica?.monto_minimo_envio_gratis != null ? Number(sucUnica.monto_minimo_envio_gratis) : baseCompany.freeDeliveryThreshold,
            sucursal_id: sucUnica?.id || 1,
            parentCompanyId: baseId,
            parentSlug: slug,
            sucursales: sucs,
            isMultiBranch: false,
            isSingleBranch: true,
          }];
        });

      const companyList = dynamicCompanies;

      return NextResponse.json({
        success: true,
        source: "crm-libro-local (PostgreSQL Render)",
        empresas: companyList,
        tiendas: companyList,
      }, { headers: CORS_HEADERS });
    } catch (dbErr: any) {
      console.warn("[CobroFacil DB Companies Fallback]:", dbErr.message);
      return NextResponse.json({
        success: true,
        source: "fallback-embedded",
        empresas: FALLBACK_COMPANIES,
        tiendas: FALLBACK_COMPANIES,
      }, { headers: CORS_HEADERS });
    }
  }
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

    // Si falló products (o backend dormido en Render), devolver de inmediato el catálogo de respaldo
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
