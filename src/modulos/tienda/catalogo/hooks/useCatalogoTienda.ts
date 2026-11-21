"use client";

import { useEffect, useMemo, useState } from "react";
import { INITIAL_PRODUCTS, type Product } from "@/data/mockProducts";
import { MOCK_COMPANIES, type CompanyStore } from "@/data/mockCompanies";

type CatalogProduct = Product & {
  department?: string;
  categoryName?: string;
};

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

export function useCatalogoTienda({
  selectedCompany,
  selectedCategory,
  searchQuery,
}: UseCatalogoTiendaParams) {
  const [products, setProducts] = useState<CatalogProduct[]>(INITIAL_PRODUCTS);
  const [companies, setCompanies] = useState<CompanyStore[]>(MOCK_COMPANIES);

  useEffect(() => {
    fetch("/api/cobrofacil/companies")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.empresas) && data.empresas.length > 0) {
          setCompanies(data.empresas);
        }
      })
      .catch((error) => console.warn("Error cargando empresas dinámicas:", error));
  }, []);

  useEffect(() => {
    fetch("/api/cobrofacil/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          const otherProducts = INITIAL_PRODUCTS.filter(
            (product) =>
              product.companyId &&
              product.companyId !== "frigorifico-maciel" &&
              product.companyId !== "empresa-prueba"
          );
          const productMap = new Map<string, CatalogProduct>();
          data.products.forEach((product: CatalogProduct) =>
            productMap.set(product.id, product)
          );
          otherProducts.forEach((product) => {
            if (!productMap.has(product.id)) productMap.set(product.id, product);
          });
          setProducts(Array.from(productMap.values()));
        }
      })
      .catch((error) => console.warn("Error cargando productos de Cobro Fácil:", error));
  }, []);

  const activeCompanyCatalog = useMemo(() => {
    if (!selectedCompany) return [];
    const companyId = (selectedCompany.id || "").toLowerCase();
    const companySlug = (selectedCompany.slug || "").toLowerCase();

    const companyProducts = products.filter((product) => {
      const productCompany = (product.companyId || "").toLowerCase();
      if (companyId === "frigorifico-maciel" || companySlug === "maciel") {
        return productCompany === "frigorifico-maciel" || productCompany === "maciel";
      }
      if (companyId === "empresa-prueba" || companySlug === "prueba") {
        return productCompany === "empresa-prueba" || productCompany === "prueba";
      }
      return productCompany === companyId || (companySlug && productCompany === companySlug);
    });

    return companyProducts.length > 0
      ? companyProducts
      : products
          .filter((product) => product.companyId === "frigorifico-maciel")
          .slice(0, 16)
          .map((product) => ({
            ...product,
            id: `${selectedCompany.id}-${product.id}`,
            companyId: selectedCompany.id,
            companyName: selectedCompany.name,
          }));
  }, [products, selectedCompany]);

  const companyDepartments = useMemo(() => {
    if (!selectedCompany) return [];
    const counts = new Map<string, number>();
    activeCompanyCatalog.forEach((product) => {
      const department = String(
        product.department || product.categoryName || product.category || "GENERAL"
      )
        .trim()
        .toUpperCase();
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
      const department = String(
        product.department || product.categoryName || product.category || "GENERAL"
      )
        .trim()
        .toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
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
    companyDepartments,
    filteredProducts,
  };
}
