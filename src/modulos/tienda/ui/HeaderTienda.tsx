"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, MapPin, Store, ChevronDown, ArrowLeft } from "lucide-react";

interface HeaderTiendaProps {
  cartItemsCount: number;
  cartTotal: number;
  deliveryType: "delivery" | "pickup";
  deliveryAddress: string;
  selectedCompanyName?: string | null;
  onBackToMarkets?: () => void;
  onChangeAddress?: () => void;
  onOpenSidebar: () => void;
  onOpenCart: () => void;
  onOpenMarkets: () => void;
  onSwitchToDriver: () => void;
  onOpenOrderChat?: () => void;
}

export function HeaderTienda({
  cartItemsCount,
  cartTotal,
  deliveryType,
  deliveryAddress,
  selectedCompanyName,
  onBackToMarkets,
  onChangeAddress,
  onOpenSidebar,
  onOpenCart,
  onOpenMarkets,
  onSwitchToDriver,
  onOpenOrderChat,
}: HeaderTiendaProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  return (
    <header
      style={{
        paddingTop: "max(0.625rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))",
      }}
      className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 pt-safe-header pb-2 shadow-lg"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Lado Izquierdo: Botón Sidebar / Perfil DiDi + Marca */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Botón Volver si está dentro de una empresa */}
          {selectedCompanyName && onBackToMarkets ? (
            <button
              type="button"
              onClick={onBackToMarkets}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white shrink-0 active:scale-95 transition-all shadow-sm"
              title="Volver a Empresas y Mercados"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
            </button>
          ) : (
            /* Botón Avatar DiDi / PedidosYa */
            <button
              type="button"
              onClick={onOpenSidebar}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-black text-sm text-white shadow-md shrink-0 active:scale-95 transition-all relative"
              title="Abrir Menú y Perfil"
            >
              <span>C</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </button>
          )}

          {/* Selector de Dirección (Home) o Nombre del Comercio (Dentro de la tienda) */}
          <div className="min-w-0">
            {selectedCompanyName ? (
              <div>
                <div className="flex items-center gap-1 text-left">
                  <span className="font-black text-sm text-white truncate max-w-[170px] sm:max-w-[280px]">
                    {selectedCompanyName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onChangeAddress || onOpenSidebar}
                  className="text-[10px] text-slate-400 hover:text-white font-semibold flex items-center gap-1 truncate group cursor-pointer transition-colors"
                  title="Cambiar dirección de entrega"
                >
                  <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[220px]">
                    {deliveryAddress || "Tucumán 2130, Rosario"}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </button>
              </div>
            ) : (
              /* En la Home (Estilo PedidosYa): solo muestra la dirección de entrega */
              <div>
                <span className="text-[10px] text-slate-400 font-bold block leading-none">
                  Entregar en
                </span>
                <button
                  type="button"
                  onClick={onChangeAddress || onOpenSidebar}
                  className="flex items-center gap-1 text-left group mt-0.5 cursor-pointer"
                  title="Cambiar dirección de entrega"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-black text-sm text-white truncate group-hover:text-emerald-400 transition-colors max-w-[160px] sm:max-w-[260px]">
                    {deliveryAddress || "Tucumán 2130, Rosario"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Carrito + Botón Seguimiento Reparto y Chat */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón Seguimiento en Vivo y Chat con Repartidor / Central */}
          <Button
            onClick={onOpenOrderChat || onSwitchToDriver}
            size="sm"
            variant="outline"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold px-2.5 h-9 flex items-center gap-1.5 shadow-sm relative active:scale-95 transition-all"
            title="Ver seguimiento en vivo y chat con el repartidor"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Reparto en Curso</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
