import type { Product } from "@/data/mockProducts";
import type { CompanyStore } from "@/data/mockCompanies";

export type CatalogProduct = Product & {
  department?: string;
  categoryName?: string;
};

export function cleanSearchText(text: string) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00ad/g, "")
    .toLowerCase()
    .trim();
}

export function departmentOf(product: CatalogProduct) {
  return String(product.department || product.categoryName || product.category || "GENERAL")
    .trim()
    .toUpperCase();
}

export function getDepartmentIcon(department: string) {
  if (department.includes("CARNE") || department.includes("VACUN")) return "🥩";
  if (department.includes("AVE") || department.includes("POLLO")) return "🍗";
  if (department.includes("CERDO")) return "🥓";
  if (department.includes("ACHURA")) return "🔥";
  if (department.includes("EMBUTID") || department.includes("FIAMBR")) return "🌭";
  if (department.includes("PREPARAD") || department.includes("MILANES")) return "🍲";
  if (department.includes("HUEVO")) return "🥚";
  if (department.includes("ALMACEN") || department.includes("CONDIMENT")) return "🛒";
  if (department.includes("VERDU")) return "🥬";
  if (department.includes("CONGELAD")) return "❄️";
  if (department.includes("GRASA")) return "🧈";
  if (department.includes("BEBIDA") || department.includes("KIOSCO")) return "🥤";
  return "📦";
}

/** Un producto pertenece a un comercio si su companyId coincide con el id o el slug. */
export function productBelongsToCompany(product: Product, company: CompanyStore) {
  const productCompany = (product.companyId || "").toLowerCase();
  if (!productCompany) return false;

  const isMacielCompany =
    company.id === "frigorifico-maciel" ||
    company.id.startsWith("frigorifico-maciel-") ||
    company.slug === "maciel" ||
    (company as any).parentSlug === "maciel" ||
    (company as any).empresa_id === 1;

  const isMacielProduct =
    productCompany === "frigorifico-maciel" ||
    productCompany.startsWith("frigorifico-maciel") ||
    productCompany.includes("maciel") ||
    (product as any).empresa_id === 1;

  if (isMacielCompany && isMacielProduct) {
    return true;
  }

  const productSucId = (product as any).sucursal_id ?? (product as any).branchId;
  const companySucId = company.sucursal_id;

  // Si el comercio es una sucursal específica: aislamiento estricto de inventario por local
  if (companySucId != null) {
    if (productSucId != null) {
      return Number(productSucId) === Number(companySucId);
    }
    if (productCompany === company.id.toLowerCase()) {
      return true;
    }
    if (productCompany.includes("-suc-")) {
      return false;
    }
    // Si el producto no tiene sufijo -suc-, solo pertenece a la sucursal 1 si no es multirama
    if (Number(companySucId) === 1 || !company.isMultiBranch) {
      const candidates = [
        company.id,
        company.slug,
        company.parentCompanyId,
        company.parentSlug,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      if (
        company.id === "frigorifico-maciel" ||
        company.slug === "maciel" ||
        company.parentCompanyId === "frigorifico-maciel" ||
        company.parentSlug === "maciel"
      ) {
        candidates.push("maciel", "frigorifico-maciel");
      }
      return candidates.includes(productCompany);
    }
    return false;
  }

  // Comercio sin sucursales o vista consolidada
  const candidates = [
    company.id,
    company.slug,
    company.slug && `empresa-${company.slug}`,
    (company as any).parentCompanyId,
    (company as any).parentSlug,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  if (
    company.id === "frigorifico-maciel" ||
    company.slug === "maciel" ||
    (company as any).parentCompanyId === "frigorifico-maciel" ||
    (company as any).parentSlug === "maciel"
  ) {
    candidates.push("maciel", "frigorifico-maciel");
  }
  if (company.id === "empresa-prueba" || company.slug === "prueba") candidates.push("prueba");
  return candidates.includes(productCompany);
}

/** Deduplica estrictamente por ID y código TPV para garantizar unicidad en React */
export function deduplicateCatalogProducts<T extends Product>(products: T[]): T[] {
  const seen = new Set<string>();
  const deduplicated: T[] = [];
  for (const prod of products) {
    const idKey = String(prod.id || "").trim();
    const codeKey = String((prod as any).code || (prod as any).codigo || idKey)
      .replace(/^(tpv|fallback)-suc-\d+-/, "")
      .trim();
    const key = codeKey ? `code-${codeKey}` : idKey;
    if (!seen.has(key) && !seen.has(idKey)) {
      seen.add(key);
      seen.add(idKey);
      deduplicated.push(prod);
    }
  }
  return deduplicated;
}

/** Filtrado estricto por nombre, departamento o código (sin inyectar por descripción ni sugeridos) */
export function filterCatalogProducts<T extends CatalogProduct>(
  catalog: T[],
  searchQuery: string,
  selectedCategory: string
): T[] {
  const query = cleanSearchText(searchQuery);
  const category = cleanSearchText(selectedCategory);

  return catalog.filter((product) => {
    const deptRaw = departmentOf(product);
    const deptClean = cleanSearchText(deptRaw);
    const nameClean = cleanSearchText(product.name);
    const codeRaw = String(
      (product as any).code ||
      (product as any).codigo ||
      product.id ||
      ""
    ).replace(/^(tpv|fallback)-suc-\d+-/, "").trim();
    const codeClean = cleanSearchText(codeRaw);

    const matchesSearch =
      !query ||
      nameClean.includes(query) ||
      deptClean.includes(query) ||
      (codeClean.length > 0 && codeClean.includes(query));

    const matchesCategory =
      category === "todos" ||
      deptClean === category ||
      cleanSearchText(product.category || "") === category;

    return matchesSearch && matchesCategory;
  });
}
