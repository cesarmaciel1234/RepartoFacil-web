"use client";

import React from "react";
import { CheckoutFormData } from "../../motor/tipos";

interface CheckoutPaymentSelectorProps {
  paymentMethod: CheckoutFormData["paymentMethod"];
  onChangePaymentMethod: (method: CheckoutFormData["paymentMethod"]) => void;
}

const PAYMENT_OPTIONS = [
  { id: "efectivo", label: "Efectivo", sub: "al recibir" },
  { id: "transferencia", label: "Transferencia", sub: "Mercado Pago" },
  { id: "tarjeta", label: "Tarjeta", sub: "Débito / crédito" },
] as const;

export function CheckoutPaymentSelector({
  paymentMethod,
  onChangePaymentMethod,
}: CheckoutPaymentSelectorProps) {
  return (
    <div className="min-w-0 max-w-full">
      <label className="mb-1.5 block text-xs font-bold text-slate-700">
        Medio de Pago
      </label>
      <div className="grid grid-cols-3 gap-1.5 min-w-0 max-w-full">
        {PAYMENT_OPTIONS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChangePaymentMethod(m.id as CheckoutFormData["paymentMethod"])}
            className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all min-w-0 box-border ${
              paymentMethod === m.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="leading-tight truncate min-w-0 max-w-full">{m.label}</div>
            <div className="text-[9px] font-normal opacity-70 mt-0.5 truncate min-w-0 max-w-full">
              {m.sub}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
