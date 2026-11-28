"use client";

import { useMemo } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import type { CartItem } from "./useCart";
import type { CompanyCartSummary } from "../ui/DrawerCarrito";
import {
  productBelongsToCompany,
  deduplicateCatalogProducts,
  departmentOf,
  getDepartmentIcon,
  filterCatalogProducts,
} from "../catalogo/motorFiltroCatalogo";
import { isProductPurchasable } from "./productoDisponibilidad";

interface UseTiendaCatalogoStateParams {
  products: Product[];
  companies: CompanyStore[];
  selectedCompany: CompanyStore | null;
  selectedCategory: string;
  searchQuery: string;
  cart: CartItem[];
  catalogProductsStatus: "idle" | "loading" | "ready" | "error";
  checkoutCompanyId: string | null;
}

export function useTiendaCatalogoState({
  products,
  companies,
  selectedCompany,
  selectedCategory,
  searchQuery,
  cart,
  catalogProductsStatus,
  checkoutCompanyId,
}: UseTiendaCatalogoStateParams) {
  // Catálogo específico del comercio seleccionado (deduplicado y filtrado reactivamente)
  const activeCompanyCatalog = useMemo(() => {
    if (!selectedCompany) return [];
    const list = products.filter((product) =>
      productBelongsToCompany(product, selectedCompany)
    );
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
    return filterCatalogProducts(
      activeCompanyCatalog,
      searchQuery,
      selectedCategory
    );
  }, [activeCompanyCatalog, selectedCategory, searchQuery, selectedCompany]);

  const companyCatalogSize = activeCompanyCatalog.length;

  const companyCarts = useMemo<CompanyCartSummary[]>(() => {
    const groups = new Map<string, CartItem[]>();
    cart.forEach((item) => {
      const companyId = item.product.companyId || "sin-comercio";
      const items = groups.get(companyId) || [];
      items.push(item);
      groups.set(companyId, items);
    });

    return Array.from(groups.entries())
      .map(([companyId, items]) => {
        const company = companies.find(
          (entry) =>
            entry.id === companyId ||
            entry.slug === companyId ||
            entry.id === `empresa-${companyId}`
        );
        return {
          companyId,
          companyName: company?.name || items[0]?.product.companyName || companyId,
          company,
          items,
          total:
            catalogProductsStatus === "ready"
              ? items.reduce(
                  (total, item) =>
                    isProductPurchasable(item.product) &&
                    item.quantity <= item.product.stockKg
                      ? total + item.product.price * item.quantity
                      : total,
                  0
                )
              : 0,
          itemCount: items.reduce((total, item) => total + item.quantity, 0),
        };
      })
      .sort((a, b) => a.companyName.localeCompare(b.companyName, "es"));
  }, [cart, companies, catalogProductsStatus]);

  const selectedCompanyCart = selectedCompany
    ? companyCarts.find(
        (companyCart) =>
          companyCart.companyId === selectedCompany.id ||
          companyCart.company?.id === selectedCompany.id ||
          Boolean(
            selectedCompany.slug &&
              (companyCart.companyId === selectedCompany.slug ||
                companyCart.company?.slug === selectedCompany.slug)
          ) ||
          Boolean(
            selectedCompany.empresa_id &&
              companyCart.company?.empresa_id === selectedCompany.empresa_id
          )
      )
    : undefined;

  const checkoutCart = useMemo(
    () =>
      checkoutCompanyId
        ? cart.filter(
            (item) =>
              (item.product.companyId || "sin-comercio") === checkoutCompanyId
          )
        : [],
    [cart, checkoutCompanyId]
  );

  const checkoutCartTotal =
    catalogProductsStatus === "ready"
      ? checkoutCart.reduce(
          (total, item) =>
            isProductPurchasable(item.product) &&
            item.quantity <= item.product.stockKg
              ? total + item.product.price * item.quantity
              : total,
          0
        )
      : 0;

  return {
    activeCompanyCatalog,
    companyDepartments,
    filteredProducts,
    companyCatalogSize,
    companyCarts,
    selectedCompanyCart,
    checkoutCart,
    checkoutCartTotal,
  };
}
