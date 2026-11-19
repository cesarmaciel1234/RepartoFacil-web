"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, MapPin, Store, ChevronDown } from "lucide-react";

interface HeaderTiendaProps {
  cartItemsCount: number;
  cartTotal: number;
  deliveryType: "delivery" | "pickup";
  deliveryAddress: string;
  selectedCompanyName?: string;
  onOpenSidebar: () => void;
  onOpenCart: () => void;
  onOpenMarkets: () => void;
  onSwitchToDriver: () => void;
}

export function HeaderTienda({
  cartItemsCount,
  cartTotal,
  deliveryType,
  deliveryAddress,
  selectedCompanyName = "Frigorífico Maciel - Central",
  onOpenSidebar,
  onOpenCart,
  onOpenMarkets,
  onSwitchToDriver,
}: HeaderTiendaProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-3 sm:px-4 py-2 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Lado Izquierdo: Botón Sidebar / Perfil DiDi + Marca */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Botón Avatar DiDi / PedidosYa reutilizado */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-black text-sm text-white shadow-md shrink-0 active:scale-95 transition-all relative"
            title="Abrir Menú y Perfil"
          >
            <span>C</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </button>

          {/* Selector de Empresa / Mercado (Captura 4) */}
          <div className="min-w-0">
            <button
              type="button"
              onClick={onOpenMarkets}
              className="flex items-center gap-1 text-left group"
              title="Cambiar de Empresa / Mercado"
            >
              <span className="font-black text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
                {selectedCompanyName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
            </button>
            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 truncate">
              <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[220px]">
                {deliveryType === "delivery" && deliveryAddress
                  ? deliveryAddress
                  : "Tucumán 2130, Rosario"}
              </span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Carrito + Switch Rápido */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón Acceso Rápido Modo Repartidor */}
          <Button
            onClick={onSwitchToDriver}
            size="sm"
            variant="outline"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold px-2 h-9 flex items-center gap-1 shadow-sm"
            title="Ir a Modo Repartidor"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Repartidor</span>
          </Button>

          {/* Botón Carrito */}
          <Button
            onClick={onOpenCart}
            size="sm"
            className="relative bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs px-3 h-9 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Carrito</span>
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
