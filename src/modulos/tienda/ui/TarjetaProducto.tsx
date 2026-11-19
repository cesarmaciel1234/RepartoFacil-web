"use client";

import React from "react";
import { Product } from "@/data/mockProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Sparkles } from "lucide-react";

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
    <div className="group bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5">
      <div>
        {/* Imagen y Badges */}
        <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-800 mb-2.5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.isPopular && (
            <Badge className="absolute top-2 left-2 bg-amber-500/90 text-amber-950 font-black text-[9px] px-1.5 py-0.5 border-none shadow-sm flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              DESTACADO
            </Badge>
          )}
          {product.badge && (
            <Badge className="absolute top-2 right-2 bg-emerald-500/90 text-white font-black text-[9px] px-1.5 py-0.5 border-none shadow-sm">
              {product.badge}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-white line-clamp-1 leading-snug group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Precio y Acción */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
        <div className="shrink-0">
          <span className="font-black text-sm xs:text-base text-white tracking-tight">
            {formatMoney(product.price)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold ml-1">
            /{product.unit}
          </span>
        </div>

        {quantityInCart === 0 ? (
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            className="h-8 w-full xs:w-auto px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </Button>
        ) : (
          <div className="flex items-center justify-center w-full xs:w-auto gap-1 bg-slate-800 border border-slate-700/80 rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-black text-xs text-white">
              {quantityInCart}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
