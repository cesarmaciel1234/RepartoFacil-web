"use client";

import React from "react";
import { Store, ChevronRight } from "lucide-react";

export interface CentroPedidoItemRowProps {
  order: any;
  onSelect: (orderId: string) => void;
  getInitials: (text: string) => string;
  formatTime: (iso?: string) => string;
  formatMoney: (val: number) => string;
}

export function CentroPedidoItemRow({
  order,
  onSelect,
  getInitials,
  formatTime,
  formatMoney,
}: CentroPedidoItemRowProps) {
  const storeName = order.branch || order.sucursal_origen || "Comercio Cobro Fácil";
  const isAssigned =
    order.status === "Assigned" ||
    order.status === "Picked Up" ||
    order.status === "In Transit";
  const driverName = order.driverName || "Lucas Motomensajero";
  const initials = getInitials(storeName);

  return (
    <div className="transition-colors hover:bg-blue-50/40">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(String(order.id))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(String(order.id));
          }
        }}
        className="flex cursor-pointer select-none items-center gap-3 p-3"
      >
        {/* Avatar circular con punto de estado en vivo */}
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-black text-slate-700">
          <span>{initials}</span>
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
              isAssigned ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
        </div>

        {/* Centro compacto: Comercio + #RF + Dirección + Estado/Total */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-xs font-black text-slate-900 sm:text-sm">
                {storeName}
              </span>
              <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                #{order.id}
              </span>
            </div>
            <span className="shrink-0 font-mono text-[10.5px] text-slate-500">
              {formatTime(order.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <Store className="h-3 w-3 shrink-0 text-slate-400" />
              {order.deliveryAddress || "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui"}
            </span>
            <span className="shrink-0 font-mono font-bold text-emerald-600">
              {formatMoney(order.total)}
            </span>
          </div>

          <div className="flex items-center gap-1 truncate text-[11px] text-slate-600">
            <span className="font-bold text-emerald-600">✓✓</span>
            <span className="truncate">
              {isAssigned
                ? `En viaje · Chofer: ${driverName}`
                : "Preparando pedido en el comercio..."}
            </span>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
      </div>
    </div>
  );
}
