import { queryDb, isDatabaseConfigured } from "@/lib/db";
import { FALLBACK_COMPANIES } from "@/data/fallbackCatalog";

export interface CompanyLocation {
  address: string;
  coordinates?: { lat: number; lng: number };
}

export interface CompaniesResponse {
  success: boolean;
  source: string;
  empresas: any[];
  tiendas: any[];
}

function parseCoordinate(value: unknown): number | undefined {
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    (typeof value === "string" && !value.trim())
  ) {
    return undefined;
  }
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

export function getCompanyLocation(row: Record<string, any>): CompanyLocation {
  const details =
    row.company_data && typeof row.company_data === "object" ? row.company_data : {};
  const address = [
    details.direccion_comercial,
    details.direccion,
    details.address,
    details.domicilio,
    details.ubicacion,
  ].find((value) => typeof value === "string" && value.trim());

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

export async function fetchCobroFacilCompanies(): Promise<CompaniesResponse> {
  if (isDatabaseConfigured()) {
    try {
      const dbEmpresas = await queryDb(
        `SELECT e.id, e.nombre, e.slug, e.company_data, e.public_profile,
                COALESCE(r.promedio, 5.0) AS promedio,
                COALESCE(r.cantidad, 0) AS cantidad
         FROM public.empresas e
         LEFT JOIN (
           SELECT empresa_id, ROUND(AVG(puntuacion)::numeric, 1) AS promedio, COUNT(*)::integer AS cantidad
           FROM public.resenas_publicas
           WHERE activo = 1
           GROUP BY empresa_id
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
        console.warn("[companiesService] No se pudieron cargar sucursales:", error);
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

          if (eid === 2 || slug === "prueba" || /prueba|test/i.test(nombre)) {
            return false;
          }

          if (eid > 1) {
            const sucs = sucursalesPorEmpresa[eid] || [];
            const hasCatalog = esquemasConPosBase.has(eid);
            const pubProf = row.public_profile && typeof row.public_profile === "object" ? row.public_profile : null;
            const hasProfile = pubProf && Boolean(pubProf.nombre || pubProf.direccion);
            if (sucs.length === 0 && !hasCatalog && !hasProfile) {
              return false;
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

      return {
        success: true,
        source: "crm-libro-local (PostgreSQL Render)",
        empresas: dynamicCompanies,
        tiendas: dynamicCompanies,
      };
    } catch (dbErr: any) {
      console.warn("[companiesService Fallback]:", dbErr.message);
    }
  }

  return {
    success: true,
    source: "fallback-embedded",
    empresas: FALLBACK_COMPANIES,
    tiendas: FALLBACK_COMPANIES,
  };
}
