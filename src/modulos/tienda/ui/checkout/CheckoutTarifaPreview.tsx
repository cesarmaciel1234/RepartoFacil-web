"use client";

import React from "react";
import { Zap } from "lucide-react";
import { TarifaEstimada } from "../../motor/tarifaUberService";

interface CheckoutTarifaPreviewProps {
  tarifa: TarifaEstimada;
  deliveryFee: number;
  formatMoney: (val: number) => string;
}

export function CheckoutTarifaPreview({
  tarifa,
  deliveryFee,
  formatMoney,
}: CheckoutTarifaPreviewProps) {
  return (
    <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] min-w-0 max-w-full box-border">
      <div className="flex flex-wrap items-center justify-between gap-1 text-slate-700 min-w-0">
        <span className="flex items-center gap-1 text-[10px] font-bold min-w-0">
          <Zap className="h-3 w-3 fill-current text-amber-500 shrink-0" />
          <span className="truncate">
            {tarifa.isPeakHour ? "Horario Pico (1.35x demanda)" : "Horario Normal"}
          </span>
        </span>
        <span className="font-mono text-[10px] text-slate-500 shrink-0 min-w-0">
          {tarifa.distanceKm} km desde Market
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold min-w-0">
        <span className="text-slate-600 min-w-0">Envío:</span>
        <span className="font-black text-blue-700 min-w-0">
          {deliveryFee === 0 ? "GRATIS" : formatMoney(deliveryFee)}
        </span>
      </div>
    </div>
  );
}
