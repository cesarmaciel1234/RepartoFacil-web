"use client";

import React, { useState } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import { productBelongsToCompany } from "../catalogo/hooks/useCatalogoTienda";
import { Input } from "@/components/ui/input";
import { useCompanyDistances } from "../motor/useCompanyDistances";
import { EmpresaCard } from "./EmpresaCard";
import { MercadosCategoriasBar } from "./MercadosCategoriasBar";
import { MercadosProductosResults } from "./MercadosProductosResults";
import { Search, Store, Sparkles, ExternalLink } from "lucide-react";

export interface VistaMercadosEmpresasProps {
  companies: CompanyStore[];
  companiesCached?: boolean;
  products?: Product[];
  onSelectCompany: (company: CompanyStore, initialSearch?: string) => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  promotionsOnly?: boolean;
  categoryFilter?: string | string[];
  showCategories?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  deliveryAddress?: string;
  deliveryCoordinates?: { lat: number; lng: number } | null;
  status?: "loading" | "ready" | "error";
  onRetry?: () => void;
  productCountByCompany?: Record<string, number>;
}

export function VistaMercadosEmpresas({
  companies,
  companiesCached = false,
  products = [],
  onSelectCompany,
  searchQuery: externalSearch,
  onSearchChange: setExternalSearch,
  promotionsOnly = false,
  categoryFilter,
  showCategories = true,
  emptyTitle,
  emptyDescription,
  deliveryAddress = "",
  deliveryCoordinates,
  status = "ready",
  onRetry,
  productCountByCompany = {},
}: VistaMercadosEmpresasProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("todos");

  const { companyDistances, isResolvingCompanyLocations } = useCompanyDistances(
    companies,
    deliveryCoordinates
  );

  const searchTerm = externalSearch !== undefined ? externalSearch : internalSearch;
  const handleSearchChange = (val: string) => {
    if (setExternalSearch) {
      setExternalSearch(val);
    } else {
      setInternalSearch(val);
    }
  };

  const categories = [
    { id: "todos", name: "Todas", emoji: "🛒" },
    { id: "supermercados", name: "Supermercados", emoji: "🏪" },
    { id: "carnes", name: "Carnicerías", emoji: "🥩" },
    { id: "kioscos", name: "Kioscos", emoji: "🍫" },
    { id: "minimercados", name: "Minimercados", emoji: "🧃" },
  ];

  const term = searchTerm.toLowerCase().trim();
  const activeCategory = categoryFilter ?? selectedCat;

  const filtered = companies
    .map((comp) => {
      const matchingProducts = term
        ? products.filter(
            (p) =>
              productBelongsToCompany(p, comp) &&
              (p.name.toLowerCase().includes(term) ||
                (p.description || "").toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term))
          )
        : [];

      const matchesSearch =
        !term ||
        comp.name.toLowerCase().includes(term) ||
        comp.category.toLowerCase().includes(term) ||
        (comp.address || "").toLowerCase().includes(term) ||
        matchingProducts.length > 0;

      const matchesCat =
        activeCategory === "todos" ||
        (Array.isArray(activeCategory)
          ? activeCategory.includes(comp.categorySlug)
          : comp.categorySlug === activeCategory);

      return {
        comp,
        matchingProducts,
        isVisible:
          matchesSearch &&
          matchesCat &&
          (!promotionsOnly ||
            (comp.badges || []).some((badge) =>
              /off|promo|descuento|oferta|gratis/i.test(badge)
            )),
      };
    })
    .filter((item) => item.isVisible);

  const sortedFiltered = [...filtered].sort((first, second) => {
    const firstDistance = companyDistances[first.comp.id] ?? null;
    const secondDistance = companyDistances[second.comp.id] ?? null;
    if (firstDistance === null) return secondDistance === null ? 0 : 1;
    if (secondDistance === null) return -1;
    return firstDistance - secondDistance || first.comp.name.localeCompare(second.comp.name);
  });

  const productResults = filtered
    .flatMap(({ comp, matchingProducts }) =>
      matchingProducts.map((product) => ({
        company: comp,
        product,
        distanceKm: companyDistances[comp.id] ?? null,
      }))
    )
    .sort((first, second) => {
      if (first.distanceKm === null) return second.distanceKm === null ? 0 : 1;
      if (second.distanceKm === null) return -1;
      return first.distanceKm - second.distanceKm;
    });

  const showProductResults = Boolean(term && productResults.length > 0);

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      {/* 1. Barra de Búsqueda */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar productos y locales"
          className="pl-11 h-12 bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-full text-sm shadow-xs focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* 2. Tarjetas de categorías */}
      {showCategories && (
        <MercadosCategoriasBar
          categories={categories}
          selectedCat={selectedCat}
          categoryFilter={categoryFilter}
          onSelectCat={(id) =>
            setSelectedCat(id === selectedCat && id !== "todos" ? "todos" : id)
          }
        />
      )}

      {deliveryCoordinates && (
        <p className="text-xs font-medium text-slate-500" aria-live="polite">
          {isResolvingCompanyLocations
            ? "Calculando distancias para mostrar primero los comercios más cercanos..."
            : `Comercios ordenados por cercanía a ${deliveryAddress || "tu domicilio"}.`}
        </p>
      )}

      {/* 3. Listado de Locales / Empresas */}
      <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {showProductResults ? (
          <MercadosProductosResults
            productResults={productResults}
            onSelectCompany={onSelectCompany}
          />
        ) : (
          sortedFiltered.map(({ comp, matchingProducts }) => (
            <EmpresaCard
              key={comp.id}
              comp={comp}
              matchingProducts={matchingProducts}
              companyDistance={companyDistances[comp.id]}
              isResolvingDistance={isResolvingCompanyLocations}
              productCount={productCountByCompany[comp.id]}
              companiesCached={companiesCached}
              term={term}
              onSelectCompany={onSelectCompany}
            />
          ))
        )}

        {status === "loading" &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="flex items-start gap-3.5 p-4 animate-pulse">
              <div className="h-14 w-14 rounded-2xl bg-slate-200" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}

        {status === "error" && (
          <div className="text-center py-14 bg-white p-6 space-y-3">
            <Store className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              No pudimos conectar con los comercios.
            </p>
            <p className="text-xs text-slate-500">Revisá tu conexión e intentá de nuevo.</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        {status === "ready" && filtered.length === 0 && (
          <div className="text-center py-14 bg-white p-6 space-y-2">
            <Store className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {emptyTitle ||
                (promotionsOnly
                  ? "No hay comercios con promociones disponibles."
                  : `No encontramos empresas con "${searchTerm}"`)}
            </p>
            <p className="text-xs text-slate-500">
              {emptyDescription ||
                (promotionsOnly
                  ? "Volvé a Inicio para ver todos los comercios."
                  : "Probá buscando carnicería, kiosco, bebidas o seleccionando una categoría.")}
            </p>
          </div>
        )}
      </div>

      {/* 4. Banner Cobro Fácil Cloud Sync */}
      <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 flex items-center justify-between text-xs text-blue-900 shadow-xs">
        <div className="space-y-0.5">
          <span className="font-extrabold flex items-center gap-1.5 text-blue-950">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Conectado con Cobro Fácil TPV
          </span>
          <span className="text-[11px] text-blue-700 block">
            Sincronización automática de inventario y facturación multitienda.
          </span>
        </div>
        <a
          href="https://cobrofacil.157.151.3.66.sslip.io"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          title="Abrir Cobro Fácil"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default VistaMercadosEmpresas;
