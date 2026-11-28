"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { MapPin, ShieldCheck } from "lucide-react";
import { TarifaEstimada } from "../../motor/tarifaUberService";
import { CheckoutTarifaPreview } from "./CheckoutTarifaPreview";

interface CheckoutAddressSectionProps {
  streetInput: string;
  numberInput: string;
  addressUnit: string;
  citySuffix: string;
  deliveryCoordinates?: { lat: number; lng: number } | null;
  onOpenAddressPicker?: () => void;
  onStreetChange: (street: string) => void;
  onNumberChange: (num: string) => void;
  onUnitChange: (unit: string) => void;
  tarifa: TarifaEstimada;
  deliveryFee: number;
  formatMoney: (val: number) => string;
}

export function CheckoutAddressSection({
  streetInput,
  numberInput,
  addressUnit,
  citySuffix,
  deliveryCoordinates,
  onOpenAddressPicker,
  onStreetChange,
  onNumberChange,
  onUnitChange,
  tarifa,
  deliveryFee,
  formatMoney,
}: CheckoutAddressSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Dirección y Número de Casa *
        </label>
        {deliveryCoordinates ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Punto GPS fijado
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400">
            Punto GPS opcional
          </span>
        )}
      </div>

      {/* Tarjeta de Punto en el Mapa */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shadow-xs min-w-0 max-w-full box-border">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              deliveryCoordinates ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {deliveryCoordinates ? "Punto fijado en el mapa" : "Punto exacto sin marcar"}
            </p>
            <p
              className={`text-[10px] truncate ${
                deliveryCoordinates ? "font-semibold text-emerald-700" : "text-slate-500"
              }`}
            >
              {deliveryCoordinates
                ? "✓ Ubicación marcada en el mapa"
                : "Tocá el mapa para ubicar tu puerta"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAddressPicker}
          className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-blue-600 hover:text-blue-800 text-[11px] font-bold shrink-0 shadow-xs active:scale-95 transition-all"
        >
          {deliveryCoordinates ? "Cambiar punto" : "Elegir en mapa"}
        </button>
      </div>

      {/* Campos estructurados para Calle y Altura / Número de casa */}
      <div className="grid grid-cols-3 gap-2 min-w-0 max-w-full">
        <div className="col-span-2 space-y-1 min-w-0">
          <label className="text-[11px] font-bold text-slate-600">Calle *</label>
          <Input
            placeholder="Ej. San Lorenzo o Tucumán"
            autoComplete="street-address"
            value={streetInput}
            onChange={(e) => onStreetChange(e.target.value)}
            className="h-10 rounded-xl border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 min-w-0"
            required
          />
        </div>
        <div className="space-y-1 min-w-0">
          <label className="text-[11px] font-black text-blue-700">Número / Altura *</label>
          <Input
            placeholder="Ej. 2040"
            value={numberInput}
            onChange={(e) => onNumberChange(e.target.value)}
            className="h-10 rounded-xl border-blue-400 bg-blue-50/40 text-xs font-bold text-slate-900 placeholder:text-slate-400 min-w-0"
            required
          />
        </div>
      </div>

      {/* Piso, Depto o Referencia */}
      <div className="space-y-1 min-w-0 max-w-full">
        <label className="text-[11px] font-bold text-slate-600">
          Piso, Depto o Timbre (opcional)
        </label>
        <Input
          placeholder="Ej. Piso 3 Depto B / Timbre blanco"
          value={addressUnit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="h-9 rounded-xl border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 min-w-0"
        />
      </div>

      {/* Preview de entrega para el cliente */}
      <div className="text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 min-w-0 max-w-full box-border truncate">
        <span className="font-bold text-slate-700 shrink-0">📍 Destino:</span>
        <span className="truncate min-w-0">
          {streetInput.trim() || "Calle"} {numberInput.trim() || "S/N"}
          {addressUnit.trim() ? `, ${addressUnit.trim()}` : ""}
          {citySuffix.trim() ? `, ${citySuffix.trim()}` : ""}
        </span>
      </div>

      {/* Tarifa dinámica estándar Uber / PedidosYa */}
      <CheckoutTarifaPreview
        tarifa={tarifa}
        deliveryFee={deliveryFee}
        formatMoney={formatMoney}
      />
    </div>
  );
}
