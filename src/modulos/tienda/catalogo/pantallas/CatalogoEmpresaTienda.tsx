"use client";

import React from "react";
import { ArrowLeft, Bike, Clock, MapPin, Star } from "lucide-react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import type { CartItem, DeliveryCoordinates } from "../../motor/tipos";
import { FiltroCategorias } from "../../ui/FiltroCategorias";
import { TarjetaProducto } from "../../ui/TarjetaProducto";

interface CatalogoEmpresaTiendaProps {
  company: CompanyStore;
  deliveryCoordinates: DeliveryCoordinates | null;
  distanceKm: number | null;
  isDistanceLoading: boolean;
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
  onOpenAddress: () => void;
}

export function CatalogoEmpresaTienda({
  company,
  deliveryCoordinates,
  distanceKm,
  isDistanceLoading,
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
  onOpenAddress,
}: CatalogoEmpresaTiendaProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToStores}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-blue-600 shadow-2xs transition-all hover:bg-blue-50 hover:text-blue-700 active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a Locales</span>
          </button>
          <div className="hidden h-4 w-px bg-slate-200 sm:block" />
          <span className="truncate text-xs font-extrabold text-slate-900">
            {company.name}
          </span>
        </div>

        <div className="flex items-center gap-3 pl-1 text-xs font-semibold text-slate-600">
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
            ${company.deliveryFee.toLocaleString("es-AR")}
          </span>
          {deliveryCoordinates ? (
            <span
              className="flex items-center gap-1 text-slate-600"
              title="Distancia aproximada en línea recta"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {isDistanceLoading
                ? "..."
                : distanceKm === null
                ? "— km"
                : `~${distanceKm.toFixed(1)} km`}
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenAddress}
              aria-label="Elegir ubicación para ver distancia"
              className="flex items-center gap-1 font-bold text-blue-600"
            >
              <MapPin className="h-3.5 w-3.5" />
              Ubicación
            </button>
          )}
        </div>
      </div>

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
            cart.find((item) => item.product.id === product.id)?.quantity || 0;
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
