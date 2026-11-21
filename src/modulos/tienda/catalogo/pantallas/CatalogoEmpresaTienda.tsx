"use client";

import React from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import type { CartItem } from "../../motor/tipos";
import { isCompanyCoordinates } from "../../motor/ubicacionComercio";
import { FiltroCategorias } from "../../ui/FiltroCategorias";
import { TarjetaProducto } from "../../ui/TarjetaProducto";
import { Bike, Clock, MapPin, Star } from "lucide-react";

interface CatalogoEmpresaTiendaProps {
  company: CompanyStore;
  categories: Array<{ id: string; name: string; icon: string }>;
  searchQuery: string;
  selectedCategory: string;
  products: Product[];
  cart: CartItem[];
  onSearchChange: (value: string) => void;
  onCategorySelect: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onBackToStores: () => void;
}

export function CatalogoEmpresaTienda({
  company,
  categories,
  searchQuery,
  selectedCategory,
  products,
  cart,
  onSearchChange,
  onCategorySelect,
  onAddToCart,
  onUpdateQuantity,
  onBackToStores,
}: CatalogoEmpresaTiendaProps) {
  const mapQuery = isCompanyCoordinates(company.coordinates)
    ? `${company.coordinates.lat},${company.coordinates.lng}`
    : company.address || company.name;
  const companyMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="space-y-4">
      <section
        aria-label={`Información de ${company.name}`}
        className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
      >
        <h2 className="truncate text-xs font-extrabold text-slate-900">
          {company.name}
        </h2>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1 font-extrabold text-slate-900">
            <Star className="h-3.5 w-3.5 fill-slate-900 text-slate-900" />
            {company.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {company.deliveryTimeMin}-{company.deliveryTimeMax} min
          </span>
          <span className="flex items-center gap-1 font-bold text-blue-600">
            <Bike className="h-3.5 w-3.5" />
            {company.deliveryFee > 0
              ? `$${company.deliveryFee.toLocaleString("es-AR")}`
              : "Envío gratis"}
          </span>
          <a
            href={companyMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver ubicación de ${company.name} en el mapa`}
            className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700"
          >
            <MapPin className="h-3.5 w-3.5" />
            Ubicación
          </a>
        </div>
      </section>

      <FiltroCategorias
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        categories={categories}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const quantity =
            cart.find(
              (item) =>
                item.product.id === product.id &&
                (item.product.companyId || company.id) ===
                  (product.companyId || company.id)
            )?.quantity || 0;
          return (
            <TarjetaProducto
              key={product.id}
              product={product}
              quantityInCart={quantity}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
            />
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-6 py-16 text-center">
          <p className="text-base font-bold text-slate-800">
            No encontramos productos con &ldquo;{searchQuery}&rdquo; en {company.name}
          </p>
          <p className="text-xs text-slate-500">
            Probá con otro término o volvé a la lista de empresas para buscar en otros locales.
          </p>
          <button
            type="button"
            onClick={onBackToStores}
            className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            Buscar en todos los comercios
          </button>
        </div>
      )}
    </div>
  );
}
