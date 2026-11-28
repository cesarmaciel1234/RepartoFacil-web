"use client";

import React from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompanyCartSummary } from "./DrawerCarrito";

interface BotonCarritoFlotanteProps {
  selectedCompanyCart?: CompanyCartSummary;
  onOpenCart: (companyId: string) => void;
}

export function BotonCarritoFlotante({
  selectedCompanyCart,
  onOpenCart,
}: BotonCarritoFlotanteProps) {
  if (!selectedCompanyCart) return null;

  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  return (
    <div
      style={{
        bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
      }}
      className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-30"
    >
      <Button
        onClick={() => onOpenCart(selectedCompanyCart.companyId)}
        className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xl shadow-blue-600/30 border border-blue-500 flex items-center justify-between px-4 active:scale-98 transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 text-left">
            <div className="text-xs font-black leading-tight">
              {selectedCompanyCart.itemCount}{" "}
              {selectedCompanyCart.itemCount === 1 ? "ítem" : "ítems"}
            </div>
            <div className="max-w-[200px] truncate text-[10px] font-medium text-blue-100">
              Carrito de {selectedCompanyCart.companyName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-tight">
            {formatMoney(selectedCompanyCart.total)}
          </span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Button>
    </div>
  );
}
