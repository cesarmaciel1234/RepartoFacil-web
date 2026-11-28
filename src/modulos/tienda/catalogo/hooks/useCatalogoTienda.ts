"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/mockProducts";
import type { CompanyStore } from "@/data/mockCompanies";
import { FALLBACK_COMPANIES, FALLBACK_PRODUCTS } from "@/data/fallbackCatalog";
import {
  asCachedProducts,
  isCatalogCompany,
  isCatalogProduct,
  readCompaniesCache,
  readProductsCache,
  saveCompaniesCache,
  saveProductsCache,
} from "../cacheCatalogo";

import {
  type CatalogProduct,
  cleanSearchText,
  departmentOf,
  getDepartmentIcon,
  productBelongsToCompany,
  deduplicateCatalogProducts,
  filterCatalogProducts,
} from "../motorFiltroCatalogo";

export type { CatalogProduct };
export { cleanSearchText, departmentOf, getDepartmentIcon, productBelongsToCompany };

export type CatalogStatus = "loading" | "ready" | "error";

interface UseCatalogoTiendaParams {
  selectedCompany?: CompanyStore | null;
  selectedCategory?: string;
  searchQuery?: string;
}

export function useCatalogoTienda(params?: UseCatalogoTiendaParams) {
  const selectedCompany = params?.selectedCompany || null;
  const selectedCategory = params?.selectedCategory || "todos";
  const searchQuery = params?.searchQuery || "";
  const [products, setProducts] = useState<CatalogProduct[]>(FALLBACK_PRODUCTS as CatalogProduct[]);
  const [companies, setCompanies] = useState<CompanyStore[]>(FALLBACK_COMPANIES);
  const [status, setStatus] = useState<CatalogStatus>("ready");
  const [productsStatus, setProductsStatus] = useState<CatalogStatus>("ready");
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
    } else {
      setCompanies(FALLBACK_COMPANIES);
      setStatus("ready");
      setCompaniesCached(false);
    }
    if (cachedProducts) {
      setProducts(asCachedProducts(cachedProducts.data));
      setProductsSavedAt(cachedProducts.savedAt);
      setProductsCached(true);
      setProductsStatus("ready");
    } else {
      setProducts(FALLBACK_PRODUCTS as CatalogProduct[]);
      setProductsCached(false);
      setProductsStatus("ready");
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

    const load = async (retryCount = 0) => {
      if (loading) {
        refreshQueued = true;
        return;
      }
      loading = true;
      activeRequest = new AbortController();
      const request = activeRequest;
      // 35 segundos de timeout para tolerar el inicio en frío (cold start) de Render
      const timeout = window.setTimeout(() => request.abort(), 35000);
      let companiesResult: PromiseSettledResult<CompanyStore[]>;
      let productsResult: PromiseSettledResult<{ products: CatalogProduct[]; warnings: string[] }>;

      try {
        [companiesResult, productsResult] = await Promise.allSettled([
          loadCompanies(request.signal),
          loadProducts(request.signal),
        ]);
      } finally {
        window.clearTimeout(timeout);
      }

      if (cancelled) return;

      const isOnline = typeof navigator === "undefined" || navigator.onLine !== false;
      const companiesOk = companiesResult.status === "fulfilled" && isOnline;
      const productsOk = productsResult.status === "fulfilled" && isOnline;

      // Si falló alguno y aún nos quedan reintentos automáticos, reintentamos antes de dar error visible
      if ((!companiesOk || !productsOk) && retryCount < 2 && !cancelled) {
        loading = false;
        console.warn(`[useCatalogoTienda] Reintentando carga de catálogo en 1.5s (intento ${retryCount + 1}/2)...`);
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        if (cancelled) return;
        return load(retryCount + 1);
      }

      if (companiesOk && companiesResult.status === "fulfilled") {
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
        const hasCache = Boolean(cachedCompanies?.data?.length);
        if (hasCache && cachedCompanies?.data) {
          setCompanies(cachedCompanies.data);
          setCompaniesCached(true);
          setStatus("ready");
        } else {
          setCompanies(FALLBACK_COMPANIES);
          setCompaniesCached(false);
          setStatus("ready");
        }
      }

      if (productsOk && productsResult.status === "fulfilled") {
        setProducts(productsResult.value.products);
        setProductsWarnings(productsResult.value.warnings);
        setProductsCached(false);
        setProductsSavedAt(new Date().toISOString());
        if (productsResult.value.warnings.length > 0) {
          console.warn(
            "El catálogo se cargó parcialmente desde Cobro Fácil:",
            productsResult.value.warnings
          );
        }
        try {
          setProductsSavedAt(saveProductsCache(productsResult.value.products));
          setProductsCacheError(false);
        } catch (error) {
          console.warn("No se pudieron guardar los productos para uso sin conexión:", error);
          setProductsCacheError(true);
        }
        setProductsStatus("ready");
      } else {
        if (productsResult.status === "rejected") {
          console.warn("No se pudieron actualizar los productos de Cobro Fácil:", productsResult.reason);
        }
        const hasCache = Boolean(cachedProducts?.data?.length);
        if (hasCache) {
          setProducts((current) => asCachedProducts(current));
          setProductsCached(true);
        } else {
          // En modo incógnito o primera visita sin red, garantizar catálogo de respaldo
          setProducts(FALLBACK_PRODUCTS as CatalogProduct[]);
          setProductsCached(false);
        }
        setProductsWarnings([]);
        setProductsStatus("ready");
      }

      loading = false;
      if (refreshQueued && isOnline) {
        refreshQueued = false;
        void load();
      }
    };

    void load();
    const timer = window.setInterval(() => {
      const isOnline = typeof navigator === "undefined" || navigator.onLine !== false;
      if (isOnline) void load();
    }, 60000);
    const handleOnline = () => void load();
    const handleOffline = () => {
      const hasCompCache = Boolean(readCompaniesCache()?.data?.length);
      const hasProdCache = Boolean(readProductsCache()?.data?.length);
      setCompaniesCached(hasCompCache);
      setProductsCached(hasProdCache);
      setProducts((current) => asCachedProducts(current));
      setProductsStatus("error");
    };
    const handleVisible = () => {
      const isOnline = typeof navigator === "undefined" || navigator.onLine !== false;
      if (document.visibilityState === "visible" && isOnline) {
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
    const list = products.filter((product) => productBelongsToCompany(product, selectedCompany));
    return deduplicateCatalogProducts(list);
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
    return filterCatalogProducts(activeCompanyCatalog, searchQuery, selectedCategory);
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
