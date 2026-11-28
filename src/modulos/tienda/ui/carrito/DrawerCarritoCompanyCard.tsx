"use client";

import React from "react";
import type { CompanyCartSummary } from "../DrawerCarrito";
import { Bike, Clock3, MapPin, Trash2 } from "lucide-react";

interface DrawerCarritoCompanyCardProps {
  companyCart: CompanyCartSummary;
  distanceLabel: string;
  onSelectCompanyCart: (companyId: string) => void;
  onRemoveCompanyCart: (companyId: string) => void;
  formatMoney: (value: number) => string;
}

export function DrawerCarritoCompanyCard({
  companyCart,
  distanceLabel,
  onSelectCompanyCart,
  onRemoveCompanyCart,
  formatMoney,
}: DrawerCarritoCompanyCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={() => onSelectCompanyCart(companyCart.companyId)}
        aria-label={`Abrir carrito de ${companyCart.companyName}`}
        className="flex w-full items-center gap-3 text-left"
      >
        {companyCart.company?.logoUrl ? (
          <img
            src={companyCart.company.logoUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-2xl bg-slate-100 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">
            {companyCart.companyName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-extrabold text-slate-900">
            {companyCart.companyName}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {companyCart.itemCount}{" "}
            {companyCart.itemCount === 1 ? "producto" : "productos"}
          </p>
        </div>
        <span className="shrink-0 text-sm font-black text-slate-900">
          {formatMoney(companyCart.total)}
        </span>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-[4.25rem] text-xs text-slate-600">
        {companyCart.company && (
          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
            {companyCart.company.deliveryTimeMin}-
            {companyCart.company.deliveryTimeMax} min
          </span>
        )}
        <span className="flex items-center gap-1">
          <Bike className="h-3.5 w-3.5 text-slate-400" />
          {companyCart.company
            ? formatMoney(companyCart.company.deliveryFee)
            : "Envío calculado al pagar"}
        </span>
        <span
          className="flex items-center gap-1"
          title="Distancia aproximada desde tu ubicación"
        >
          <MapPin className="h-3.5 w-3.5 text-blue-600" />
          {distanceLabel}
        </span>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onRemoveCompanyCart(companyCart.companyId)}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </article>
  );
}
