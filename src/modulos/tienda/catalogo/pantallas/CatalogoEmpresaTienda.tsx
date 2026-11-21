"use client";

import React from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import type { CartItem } from "../../motor/tipos";
import { FiltroCategorias } from "../../ui/FiltroCategorias";
import { TarjetaProducto } from "../../ui/TarjetaProducto";

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
  return (
    <div className="space-y-4">
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
