import React from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import { hasValidPrice } from "../motor/productoDisponibilidad";
import { Star, Clock, MapPin, Bike, Sparkles, Tag } from "lucide-react";

export interface EmpresaCardProps {
  comp: CompanyStore;
  matchingProducts: Product[];
  companyDistance?: number | null;
  isResolvingDistance: boolean;
  productCount?: number;
  companiesCached?: boolean;
  term: string;
  onSelectCompany: (company: CompanyStore, initialSearch?: string) => void;
}

export function EmpresaCard({
  comp,
  matchingProducts,
  companyDistance,
  isResolvingDistance,
  productCount,
  companiesCached = false,
  term,
  onSelectCompany,
}: EmpresaCardProps) {
  return (
    <div
      onClick={() => onSelectCompany(comp, term)}
      className="group p-4 bg-white hover:bg-blue-50/30 transition-all cursor-pointer active:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Logo / Avatar Cuadrado Redondeado estilo App */}
          <div className="relative w-14 h-14 shrink-0">
            {comp.logoUrl ? (
              <img
                src={comp.logoUrl}
                alt=""
                loading="lazy"
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-200 flex items-center justify-center font-black text-xl text-white group-hover:scale-105 transition-transform shadow-sm">
                {comp.name.charAt(0)}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                companiesCached || comp.isOpen === false ? "bg-slate-400" : "bg-emerald-500"
              }`}
              title={companiesCached ? "Estado sin actualizar" : comp.isOpen === false ? "Cerrado" : "Abierto"}
            />
          </div>

          <div className="min-w-0 flex-1">
            {/* Fila 1: Nombre del Local + Rating ★ a la derecha */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {comp.name}
              </span>
              <span className="flex items-center gap-1 text-slate-900 font-extrabold text-xs shrink-0">
                <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                {comp.rating > 0 ? comp.rating.toFixed(1) : "Nuevo"}
              </span>
            </div>

            {/* Fila 2: Categoría y dirección completa */}
            <span className="text-xs text-slate-600 block font-medium mt-0.5 line-clamp-2 leading-tight">
              <span className="font-bold text-slate-700">{comp.category}</span>
              {comp.address ? ` · ${comp.address}` : ""}
            </span>

            {/* Fila 3: Tiempo de entrega */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {comp.deliveryTimeMin}-{comp.deliveryTimeMax} min
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-600"
              title="Distancia aproximada desde tu domicilio"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {companyDistance === null || companyDistance === undefined
                  ? isResolvingDistance
                    ? "Calculando distancia..."
                    : "Envío disponible"
                  : `~${companyDistance.toFixed(1)} km`}
              </span>
            </div>

            {/* Fila 4: Costo de envío + sello azul */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <Bike className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                ${comp.deliveryFee.toLocaleString("es-AR")}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-extrabold text-blue-600">Envío directo</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white">
                TPV
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-500">
                {productCount ? `${productCount} productos` : "Catálogo en preparación"}
              </span>
              {!companiesCached && comp.isOpen === false && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-slate-200 text-slate-600">
                  CERRADO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Productos disponibles en catálogo coincidentes con la búsqueda */}
      {matchingProducts.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[11px] text-blue-600 font-extrabold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Productos disponibles en catálogo:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {matchingProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCompany(comp, p.name);
                }}
                className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 active:scale-95 transition-all flex items-center gap-1.5"
                title={`Ver ${p.name} en ${comp.name}`}
              >
                <span>{p.name}</span>
                <span className="text-blue-900 font-black">
                  ·{" "}
                  {p.priceSource === "tpv" && hasValidPrice(p)
                    ? `$${p.price.toLocaleString("es-AR")}`
                    : "Precio pendiente"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badges de Promociones */}
      {comp.badges && comp.badges.length > 0 && matchingProducts.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5 pl-[4.35rem]">
          {comp.badges.map((b, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                idx === 0
                  ? "bg-amber-300/90 text-slate-900"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
