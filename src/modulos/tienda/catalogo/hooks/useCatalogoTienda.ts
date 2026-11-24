"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/mockProducts";
import type { CompanyStore } from "@/data/mockCompanies";
import {
  asCachedProducts,
  isCatalogCompany,
  isCatalogProduct,
  readCompaniesCache,
  readProductsCache,
  saveCompaniesCache,
  saveProductsCache,
} from "../cacheCatalogo";

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
  const [companiesCached, setCompaniesCached] = useState(false);
  const [productsCached, setProductsCached] = useState(false);
  const [companiesSavedAt, setCompaniesSavedAt] = useState<string | null>(null);
  const [productsSavedAt, setProductsSavedAt] = useState<string | null>(null);
  const [companiesCacheError, setCompaniesCacheError] = useState(false);
  const [productsCacheError, setProductsCacheError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    let loading = false;
    let refreshQueued = false;
    let activeRequest: AbortController | null = null;
    const cachedCompanies = readCompaniesCache();
    const cachedProducts = readProductsCache();
    if (cachedCompanies) {
      setCompanies(cachedCompanies.data);
      setCompaniesSavedAt(cachedCompanies.savedAt);
      setCompaniesCached(true);
      setStatus("ready");
    }
    if (cachedProducts) {
      setProducts(asCachedProducts(cachedProducts.data));
      setProductsSavedAt(cachedProducts.savedAt);
      setProductsCached(true);
      setProductsStatus("error");
    }

    const loadCompanies = async (signal: AbortSignal): Promise<CompanyStore[]> => {
      const response = await fetch("/api/cobrofacil/companies", { cache: "no-store", signal });
      if (!response.ok) throw new Error(`Error cargando comercios: ${response.status}`);
      const companiesData = await response.json();
      if (!Array.isArray(companiesData?.empresas) || !companiesData.empresas.every(isCatalogCompany)) {
        throw new Error("Cobro Fácil no devolvió el listado de comercios");
      }
      return companiesData.empresas;
    };

    const loadProducts = async (signal: AbortSignal): Promise<{
      products: CatalogProduct[];
      warnings: string[];
    }> => {
      const response = await fetch("/api/cobrofacil/products", { cache: "no-store", signal });
      if (!response.ok) throw new Error(`Error cargando productos: ${response.status}`);
      const productsData = await response.json();
      if (!Array.isArray(productsData?.products) || !productsData.products.every(isCatalogProduct)) {
        throw new Error("Cobro Fácil no devolvió el catálogo de productos");
      }
      const warnings = Array.isArray(productsData.warnings)
        ? productsData.warnings.map(String)
        : [];
      return { products: productsData.products, warnings };
    };

    const load = async () => {
      if (loading) {
        refreshQueued = true;
        return;
      }
      loading = true;
      activeRequest = new AbortController();
      const request = activeRequest;
      const timeout = window.setTimeout(() => request.abort(), 15000);
      const [companiesResult, productsResult] = await Promise.allSettled([
        loadCompanies(request.signal),
        loadProducts(request.signal),
      ]);
      window.clearTimeout(timeout);
      if (cancelled) return;

      if (companiesResult.status === "fulfilled" && navigator.onLine) {
        setCompanies(companiesResult.value);
        setStatus("ready");
        setCompaniesCached(false);
        setCompaniesSavedAt(new Date().toISOString());
        try {
          setCompaniesSavedAt(saveCompaniesCache(companiesResult.value));
          setCompaniesCacheError(false);
        } catch (error) {
          console.warn("No se pudieron guardar los comercios para uso sin conexión:", error);
          setCompaniesCacheError(true);
        }
      } else {
        if (companiesResult.status === "rejected") {
          console.warn("No se pudieron actualizar los comercios de Cobro Fácil:", companiesResult.reason);
        }
        setCompaniesCached(true);
        setStatus((current) => current === "ready" ? "ready" : "error");
      }

      if (productsResult.status === "fulfilled" && navigator.onLine) {
        setProducts(productsResult.value.products);
        setProductsWarnings(productsResult.value.warnings);
        setProductsCached(false);
        setProductsSavedAt(new Date().toISOString());
        if (productsResult.value.warnings.length > 0) {
          console.warn(
            "El catálogo se cargó parcialmente desde Cobro Fácil:",
            productsResult.value.warnings
          );
        } else {
          try {
            setProductsSavedAt(saveProductsCache(productsResult.value.products));
            setProductsCacheError(false);
          } catch (error) {
            console.warn("No se pudieron guardar los productos para uso sin conexión:", error);
            setProductsCacheError(true);
          }
        }
        setProductsStatus("ready");
      } else {
        if (productsResult.status === "rejected") {
          console.warn("No se pudieron actualizar los productos de Cobro Fácil:", productsResult.reason);
        }
        setProducts((current) => asCachedProducts(current));
        setProductsCached(true);
        setProductsWarnings([]);
        setProductsStatus("error");
      }
      loading = false;
      if (refreshQueued && navigator.onLine) {
        refreshQueued = false;
        void load();
      }
    };

    void load();
    const timer = window.setInterval(() => {
      if (navigator.onLine) void load();
    }, 60000);
    const handleOnline = () => void load();
    const handleOffline = () => {
      setCompaniesCached(true);
      setProductsCached(true);
      setProducts((current) => asCachedProducts(current));
      setProductsStatus("error");
    };
    const handleVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        setCompaniesCached(true);
        setProductsCached(true);
        setProducts((current) => asCachedProducts(current));
        setProductsStatus("error");
        void load();
      }
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      cancelled = true;
      activeRequest?.abort();
      window.clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisible);
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
    companiesCached,
    productsCached,
    companiesSavedAt,
    productsSavedAt,
    cacheError: companiesCacheError || productsCacheError,
    reload,
    productCountByCompany,
    companyCatalogSize: activeCompanyCatalog.length,
    companyDepartments,
    filteredProducts,
  };
}
