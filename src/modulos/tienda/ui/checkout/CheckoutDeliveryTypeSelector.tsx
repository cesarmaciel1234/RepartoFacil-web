"use client";

import React from "react";
import { MapPin, Store } from "lucide-react";

interface CheckoutDeliveryTypeSelectorProps {
  deliveryType: "delivery" | "pickup";
  onChangeDeliveryType: (type: "delivery" | "pickup") => void;
  cartTotal: number;
  freeDeliveryThreshold: number;
  companyDeliveryFee?: number;
  tarifaFee: number;
  formatMoney: (val: number) => string;
}

export function CheckoutDeliveryTypeSelector({
  deliveryType,
  onChangeDeliveryType,
  cartTotal,
  freeDeliveryThreshold,
  companyDeliveryFee,
  tarifaFee,
  formatMoney,
}: CheckoutDeliveryTypeSelectorProps) {
  return (
    <div className="min-w-0 max-w-full">
      <label className="mb-1.5 block text-xs font-bold text-slate-700">
        Modalidad de Entrega
      </label>
      <div className="grid grid-cols-2 gap-2 min-w-0 max-w-full">
        <button
          type="button"
          onClick={() => onChangeDeliveryType("delivery")}
          className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all min-w-0 box-border ${
            deliveryType === "delivery"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="min-w-0 max-w-full truncate text-center">Envío a Domicilio</span>
          <span className="text-[10px] font-normal text-slate-500 min-w-0 max-w-full truncate text-center">
            {cartTotal >= freeDeliveryThreshold
              ? "Gratis"
              : formatMoney(companyDeliveryFee ?? tarifaFee)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDeliveryType("pickup")}
          className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all min-w-0 box-border ${
            deliveryType === "pickup"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Store className="w-4 h-4 shrink-0" />
          <span className="min-w-0 max-w-full truncate text-center">Retiro en Local</span>
          <span className="text-[10px] font-semibold text-blue-600 min-w-0 max-w-full truncate text-center">
            Sin costo
          </span>
        </button>
      </div>
    </div>
  );
}
