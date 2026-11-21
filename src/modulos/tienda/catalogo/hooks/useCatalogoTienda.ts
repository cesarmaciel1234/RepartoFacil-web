"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/mockProducts";
import type { CompanyStore } from "@/data/mockCompanies";

export type CatalogProduct = Product & {
  department?: string;
  categoryName?: string;
};

export type CatalogStatus = "loading" | "ready" | "error";

interface UseCatalogoTiendaParams {
  selectedCompany: CompanyStore | null;
  selectedCategory: string;
  searchQuery: string;
}

function getDepartmentIcon(department: string) {
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
  const candidates = [company.id, company.slug, company.slug && `empresa-${company.slug}`]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  if (company.id === "frigorifico-maciel" || company.slug === "maciel") candidates.push("maciel");
  if (company.id === "empresa-prueba" || company.slug === "prueba") candidates.push("prueba");
  return candidates.includes(productCompany);
}

export function departmentOf(product: CatalogProduct) {
  return String(product.department || product.categoryName || product.category || "GENERAL")
    .trim()
    .toUpperCase();
}

export function useCatalogoTienda({
  selectedCompany,
  selectedCategory,
  searchQuery,
}: UseCatalogoTiendaParams) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [companies, setCompanies] = useState<CompanyStore[]>([]);
  const [status, setStatus] = useState<CatalogStatus>("loading");
  const [productsStatus, setProductsStatus] = useState<CatalogStatus>("loading");
  const [productsWarnings, setProductsWarnings] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setProductsStatus("loading");
    setProductsWarnings([]);
    setProducts((current) =>
      current.map((product) => ({ ...product, priceSource: undefined }))
    );

    const loadCompanies = async (): Promise<CompanyStore[]> => {
      const response = await fetch("/api/cobrofacil/companies", { cache: "no-store" });
      if (!response.ok) throw new Error(`Error cargando comercios: ${response.status}`);
      const companiesData = await response.json();
      if (!Array.isArray(companiesData?.empresas)) {
        throw new Error("Cobro Fácil no devolvió el listado de comercios");
      }
      return companiesData.empresas;
    };

    const loadProducts = async (): Promise<{
      products: CatalogProduct[];
      warnings: string[];
    }> => {
      const response = await fetch("/api/cobrofacil/products", { cache: "no-store" });
      if (!response.ok) throw new Error(`Error cargando productos: ${response.status}`);
      const productsData = await response.json();
      if (!Array.isArray(productsData?.products)) {
        throw new Error("Cobro Fácil no devolvió el catálogo de productos");
      }
      const warnings = Array.isArray(productsData.warnings)
        ? productsData.warnings.map(String)
        : [];
      return { products: productsData.products, warnings };
    };

    const load = async () => {
      const [companiesResult, productsResult] = await Promise.allSettled([
        loadCompanies(),
        loadProducts(),
      ]);
      if (cancelled) return;

      if (companiesResult.status === "fulfilled") {
        setCompanies(companiesResult.value);
        setStatus("ready");
      } else {
        console.error("No se pudieron cargar los comercios de Cobro Fácil:", companiesResult.reason);
        setStatus("error");
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.products);
        setProductsWarnings(productsResult.value.warnings);
        if (productsResult.value.warnings.length > 0) {
          console.warn(
            "El catálogo se cargó parcialmente desde Cobro Fácil:",
            productsResult.value.warnings
          );
        }
        setProductsStatus("ready");
      } else {
        console.error("No se pudieron cargar los productos de Cobro Fácil:", productsResult.reason);
        setProductsWarnings([
          productsResult.reason instanceof Error
            ? productsResult.reason.message
            : "No se pudo leer el inventario de Cobro Fácil.",
        ]);
        setProductsStatus("error");
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /** Cantidad de productos reales por comercio (para mostrar en la portada). */
  const productCountByCompany = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const company of companies) {
      counts[company.id] = products.filter((product) =>
        productBelongsToCompany(product, company)
      ).length;
    }
    return counts;
  }, [companies, products]);

  const activeCompanyCatalog = useMemo(() => {
    if (!selectedCompany) return [];
    return products.filter((product) => productBelongsToCompany(product, selectedCompany));
  }, [products, selectedCompany]);

  const companyDepartments = useMemo(() => {
    if (!selectedCompany) return [];
    const counts = new Map<string, number>();
    activeCompanyCatalog.forEach((product) => {
      const department = departmentOf(product);
      counts.set(department, (counts.get(department) || 0) + 1);
    });

    const departmentList = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([department, count]) => ({
        id: department.toLowerCase(),
        name: `${department} (${count})`,
        icon: getDepartmentIcon(department),
      }));

    return [
      { id: "todos", name: `Todos (${activeCompanyCatalog.length})`, icon: "🔥" },
      ...departmentList,
    ];
  }, [selectedCompany, activeCompanyCatalog]);

  const filteredProducts = useMemo(() => {
    if (!selectedCompany) return [];
    const query = searchQuery.toLowerCase().trim();
    const category = selectedCategory.toLowerCase();

    return activeCompanyCatalog.filter((product) => {
      const department = departmentOf(product).toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description || "").toLowerCase().includes(query) ||
        department.includes(query);
      const matchesCategory =
        category === "todos" ||
        department === category ||
        (product.category || "").toLowerCase() === category;

      return matchesSearch && matchesCategory;
    });
  }, [activeCompanyCatalog, selectedCategory, searchQuery, selectedCompany]);

  return {
    products,
    companies,
    status,
    productsStatus,
    productsWarnings,
    reload,
    productCountByCompany,
    companyCatalogSize: activeCompanyCatalog.length,
    companyDepartments,
    filteredProducts,
  };
}
