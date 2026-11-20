"use client";

import React from "react";
import { Product } from "@/data/mockProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Sparkles, Store, MapPin } from "lucide-react";

interface TarjetaProductoProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export function TarjetaProducto({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}: TarjetaProductoProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  return (
    <div className="group bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md">
      <div>
        {/* Imagen y Badges */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.isPopular && (
            <Badge className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 border-none shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              DESTACADO
            </Badge>
          )}
          {product.badge && (
            <Badge className="absolute top-2 right-2 bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.5 border-none shadow-xs">
              {product.badge}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          {/* Badge de Empresa y Distancia (Multi-Empresa) */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pb-0.5">
            <span className="font-bold text-blue-600 truncate max-w-[130px] flex items-center gap-1">
              <Store className="w-3 h-3 shrink-0 text-blue-600" />
              <span>{product.companyName || "Frigorífico Maciel"}</span>
            </span>
            <span className="font-semibold text-slate-600 flex items-center gap-0.5 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px]">
              <MapPin className="w-2.5 h-2.5 text-blue-600" />
              <span>{product.distanceKm ? `${product.distanceKm} km` : "1.2 km"}</span>
            </span>
          </div>

          <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Precio y Acción */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
        <div className="shrink-0">
          <span className="font-black text-sm xs:text-base text-slate-900 tracking-tight">
            {formatMoney(product.price)}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold ml-1">
            /{product.unit}
          </span>
        </div>

        {quantityInCart === 0 ? (
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            className="h-8 w-full xs:w-auto px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </Button>
        ) : (
          <div className="flex items-center justify-center w-full xs:w-auto gap-1 bg-blue-50 border border-blue-200 rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-black text-xs text-blue-950">
              {quantityInCart}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
