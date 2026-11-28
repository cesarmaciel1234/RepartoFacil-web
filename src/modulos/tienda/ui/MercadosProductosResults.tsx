import React from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import { ImagenProducto } from "./ImagenProducto";
import { hasValidPrice } from "../motor/productoDisponibilidad";
import { Store, Star, MapPin } from "lucide-react";

export interface ProductResultItem {
  company: CompanyStore;
  product: Product;
  distanceKm: number | null;
}

export interface MercadosProductosResultsProps {
  productResults: ProductResultItem[];
  onSelectCompany: (company: CompanyStore, initialSearch?: string) => void;
}

export function MercadosProductosResults({
  productResults,
  onSelectCompany,
}: MercadosProductosResultsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      {productResults.map(({ company, product, distanceKm }) => (
        <button
          key={`${company.id}-${product.id}`}
          type="button"
          onClick={() => onSelectCompany(company, product.name)}
          className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
          title={`Ver ${product.name} en ${company.name}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <ImagenProducto
              src={product.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="space-y-2 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 min-w-0 text-sm font-extrabold text-slate-900">
                {product.name}
              </h3>
              <span className="shrink-0 font-black text-xs text-slate-900">
                {product.priceSource === "tpv" && hasValidPrice(product)
                  ? `$${product.price.toLocaleString("es-AR")}`
                  : "Precio pendiente"}
              </span>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-2 text-[10px]">
              <span className="flex min-w-0 items-center gap-1 font-bold text-slate-600">
                <Store className="h-3 w-3 shrink-0 text-blue-600" />
                <span className="truncate">{company.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-0.5 font-extrabold text-slate-900">
                <Star className="h-3 w-3 fill-slate-900 text-slate-900" />
                {company.rating > 0 ? company.rating.toFixed(1) : "Nuevo"}
              </span>
            </div>
            <div
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-500"
              title="Distancia aproximada desde tu ubicación"
            >
              <MapPin className="h-3 w-3 text-blue-600" />
              {distanceKm === null ? "Envío disponible" : `~${distanceKm.toFixed(1)} km`}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
