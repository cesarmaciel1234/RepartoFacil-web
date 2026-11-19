"use client";

import React from "react";
import { DriverOrder } from "../motor/tipos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MapPin, Clock, Navigation, Store, Package } from "lucide-react";

interface TabPedidosDisponiblesProps {
  orders: DriverOrder[];
  onAcceptOrder: (order: DriverOrder) => void;
}

export function TabPedidosDisponibles({ orders, onAcceptOrder }: TabPedidosDisponiblesProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No hay pedidos pendientes</h4>
        <p className="text-xs text-slate-400">
          En cuanto un cliente confirme una orden desde la tienda, aparecerá aquí al instante.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      {orders.map((order) => {
        const client = order.clientName || order.customerName || "Cliente";
        return (
          <div
            key={order.id}
            className="bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-3.5 space-y-3 transition-all duration-200 shadow-lg shadow-black/20"
          >
            {/* Top orden: ID + Badge + Total */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-tight">#{order.id}</span>
                <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2">
                  Listo para retirar
                </Badge>
              </div>
              <span className="text-base font-black text-emerald-400">
                {formatMoney(order.total)}
              </span>
            </div>

            {/* Dirección y Sucursal */}
            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-semibold line-clamp-1">{order.deliveryAddress}</span>
              </div>
              {order.branch && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Store className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{order.branch}</span>
                </div>
              )}
            </div>

            {/* Detalle de ítems resumidos */}
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                Cortes a transportar:
              </div>
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[200px]">
                    • {item.quantity} {item.unit} {item.name}
                  </span>
                  {item.price != null && !isNaN(item.price) && (
                    <span className="text-slate-400">{formatMoney(item.price * item.quantity)}</span>
                  )}
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-[10px] text-emerald-400 font-semibold italic">
                  + {order.items.length - 3} cortes más...
                </div>
              )}
            </div>

            {/* Estimaciones y Botón Aceptar Pedido */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                {order.distanceKm && (
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    {order.distanceKm} km
                  </span>
                )}
                {order.estimatedMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    ~{order.estimatedMinutes} min
                  </span>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => onAcceptOrder(order)}
                className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Aceptar Pedido</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
