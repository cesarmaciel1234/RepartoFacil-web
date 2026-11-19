"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, MapPin } from "lucide-react";

interface HeaderTiendaProps {
  cartItemsCount: number;
  cartTotal: number;
  deliveryType: "delivery" | "pickup";
  deliveryAddress: string;
  onOpenCart: () => void;
  onSwitchToDriver: () => void;
}

export function HeaderTienda({
  cartItemsCount,
  cartTotal,
  deliveryType,
  deliveryAddress,
  onOpenCart,
  onSwitchToDriver,
}: HeaderTiendaProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Marca */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-500/20 shrink-0">
            RF
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-black text-base tracking-tight text-white truncate">Reparto Fácil</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1 py-0 shrink-0">
                MARKET
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 truncate">
              <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[220px]">
                {deliveryType === "delivery" && deliveryAddress
                  ? deliveryAddress
                  : "Envíos y Retiros · Sucursales Maciel"}
              </span>
            </p>
          </div>
        </div>

        {/* Acciones Header */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón Modo Repartidor */}
          <Button
            onClick={onSwitchToDriver}
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold px-2.5 h-9 flex items-center gap-1.5 shadow-sm"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Modo</span> Repartidor
          </Button>

          {/* Botón Carrito */}
          <Button
            onClick={onOpenCart}
            size="sm"
            className="relative bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs px-3 h-9 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Carrito</span>
            {cartItemsCount > 0 && (
              <span className="bg-white text-emerald-700 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
            {cartTotal > 0 && (
              <span className="hidden md:inline text-xs font-semibold text-emerald-100 border-l border-emerald-400/40 pl-1.5">
                {formatMoney(cartTotal)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
