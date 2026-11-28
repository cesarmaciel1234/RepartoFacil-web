"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "../../motor/tipos";
import { productAvailabilityMessage } from "../../motor/productoDisponibilidad";

interface DrawerCarritoFooterProps {
  deliveryType: "delivery" | "pickup";
  activeTotal: number;
  deliveryFee: number;
  finalTotal: number;
  freeDeliveryThreshold: number;
  hasUnavailableItems: boolean;
  unavailableItem?: CartItem;
  inventoryReady: boolean;
  companyId: string;
  onProceedToPayment: (companyId: string) => void;
  formatMoney: (value: number) => string;
}

export function DrawerCarritoFooter({
  deliveryType,
  activeTotal,
  deliveryFee,
  finalTotal,
  freeDeliveryThreshold,
  hasUnavailableItems,
  unavailableItem,
  inventoryReady,
  companyId,
  onProceedToPayment,
  formatMoney,
}: DrawerCarritoFooterProps) {
  return (
    <div
      style={{
        paddingBottom:
          "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))",
      }}
      className="space-y-3 border-t border-slate-200 bg-white p-4"
    >
      {deliveryType === "delivery" && activeTotal < freeDeliveryThreshold && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-xs">
          <Truck className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="text-[11px] font-medium leading-tight text-blue-800">
            Sumá {formatMoney(freeDeliveryThreshold - activeTotal)} más para
            tener envío gratis.
          </span>
        </div>
      )}

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal productos</span>
          <span className="font-bold text-slate-800">
            {formatMoney(activeTotal)}
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Envío</span>
          <span className="font-bold text-slate-800">
            {deliveryFee === 0 ? "Gratis" : formatMoney(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
          <span>Total</span>
          <span className="text-base font-black text-blue-700">
            {formatMoney(finalTotal)}
          </span>
        </div>
      </div>

      {hasUnavailableItems && (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-semibold text-amber-900"
        >
          {unavailableItem ? (
            <>
              {unavailableItem.product.name}:{" "}
              {!inventoryReady
                ? "inventario pendiente de validar"
                : productAvailabilityMessage(unavailableItem.product) ||
                  "la cantidad supera el stock vigente"}
            </>
          ) : (
            "No se puede validar el inventario de Cobro Fácil."
          )}
          . Revisa el producto antes de pagar.
        </p>
      )}

      <Button
        disabled={hasUnavailableItems}
        onClick={() => onProceedToPayment(companyId)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-600 active:scale-98"
      >
        <span>Ir a pagar</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="flex items-center justify-center gap-1 text-center text-[10px] text-slate-500">
        <ShieldCheck className="h-3 w-3 text-blue-600" />
        Compra segura · Conectado con Cobro Fácil
      </p>
    </div>
  );
}
