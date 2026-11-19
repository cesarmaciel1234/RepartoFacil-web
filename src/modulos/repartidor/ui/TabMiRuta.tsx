"use client";

import React from "react";
import { DriverOrder } from "../motor/tipos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Navigation, CheckCircle2, ShieldAlert } from "lucide-react";

interface TabMiRutaProps {
  activeOrders: DriverOrder[];
  onCompleteDelivery: (orderId: string) => void;
}

export function TabMiRuta({ activeOrders, onCompleteDelivery }: TabMiRutaProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  if (activeOrders.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <Navigation className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No tenés pedidos en tu ruta activa</h4>
        <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
          Pasá a la pestaña "Disponibles" para tomar un pedido y comenzar el reparto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      {activeOrders.map((order) => {
        const client = order.clientName || order.customerName || "Cliente";
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          order.deliveryAddress
        )}`;

        return (
          <div
            key={order.id}
            className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-xl shadow-emerald-500/5"
          >
            {/* Header Tarjeta */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white">#{order.id}</span>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                  EN REPARTO
                </Badge>
              </div>
              <span className="text-base font-black text-emerald-400">
                {formatMoney(order.total)}
              </span>
            </div>

            {/* Datos de Entrega */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold text-white text-sm">{client}</span>
                {order.customerPhone && (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Llamar</span>
                  </a>
                )}
              </div>
              <div className="flex items-start gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium">{order.deliveryAddress}</span>
              </div>
            </div>

            {/* Acciones de Navegación y Completado */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Navegar GPS</span>
              </a>

              <Button
                size="sm"
                onClick={() => onCompleteDelivery(order.id)}
                className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar Entregado</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
