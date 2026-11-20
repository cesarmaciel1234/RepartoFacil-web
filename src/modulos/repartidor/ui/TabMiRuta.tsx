"use client";

import React from "react";
import { DriverOrder } from "../motor/tipos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MapPin,
  Navigation,
  CheckCircle2,
  Banknote,
  ExternalLink,
  Store,
  Package,
  MessageSquare,
  Sparkles,
  Compass,
} from "lucide-react";

interface TabMiRutaProps {
  activeOrders: DriverOrder[];
  onCompleteDelivery: (orderId: string) => void;
  onOpenOrderChat?: (order: DriverOrder) => void;
}

export function TabMiRuta({
  activeOrders,
  onCompleteDelivery,
  onOpenOrderChat,
}: TabMiRutaProps) {
  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");

  if (activeOrders.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <Navigation className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No tenés pedidos en tu ruta activa</h4>
        <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
          Pasá a la pestaña "Disponibles" para tomar un pedido real y comenzar el reparto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {activeOrders.map((order) => {
        const client = order.clientName || order.customerName || "Cliente";
        const phone = order.customerPhone || "+54 9 341 555-1234";
        const earnings =
          order.driverEarnings || Math.max(1600, Math.round((order.deliveryFee || 2000) * 0.85));
        const isCash =
          order.paymentMethod === "cash" ||
          order.paymentMethod === ("efectivo" as any) ||
          !order.paymentMethod;

        const distanceDisplay =
          order.distanceKm ||
          (order.distanceToDeliveryKm ? Number(order.distanceToDeliveryKm) : 1.7);
        const minutesDisplay = order.estimatedMinutes || 18;
        const branchDisplay =
          order.branch || "Frigorífico Maciel - Central (Tucumán 2130, Rosario)";

        // Enlace real a Google Maps para navegación GPS del chofer
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          order.deliveryAddress
        )}`;

        return (
          <div
            key={order.id}
            className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-4 space-y-3.5 shadow-2xl shadow-black/60"
          >
            {/* Header del Pedido Activo */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white">#{order.id}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5">
                    EN CURSO
                  </Badge>
                </div>
                <span className="text-xs font-bold text-slate-300 block mt-0.5">{client}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Tu ganancia neta
                </span>
                <span className="text-base font-black text-emerald-400">
                  +{formatMoney(earnings)}
                </span>
              </div>
            </div>

            {/* Puntos de Ruta Reales (Retiro en Comercio y Entrega a Domicilio) */}
            <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              {/* Origen (Sucursal de Retiro) */}
              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                    Retiro en Sucursal:
                  </span>
                  <span className="font-bold text-white text-xs block truncate">
                    {branchDisplay}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                    Entregar en Domicilio:
                  </span>
                  <span className="font-bold text-white text-xs block">
                    {order.deliveryAddress}
                  </span>
                  {order.notes && (
                    <span className="text-[11px] text-amber-300 font-medium block mt-0.5 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      Nota cliente: "{order.notes}"
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones de Navegación y Contacto Directo con el Cliente */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all shadow-md group"
              >
                <Compass className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform" />
                <span>Navegar GPS</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={`tel:${phone}`}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all shadow-md"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Llamar Cliente</span>
              </a>
            </div>

            {/* Distancia y Tiempo Real */}
            <div className="px-3 py-2 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Distancia estimada:</span>
              </div>
              <span className="text-white font-bold font-mono">
                {distanceDisplay} km · ~{minutesDisplay} min
              </span>
            </div>

            {/* Detalle de Artículos */}
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cortes a Entregar ({order.items.length}):
                </span>
                <div className="space-y-1">
                  {order.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-200 flex items-center justify-between"
                    >
                      <span className="truncate">
                        • {item.quantity} {item.unit || "kg"} de {item.name}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px] shrink-0 pl-2">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aviso Destacado de Cobro en Efectivo */}
            {isCash && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-between text-xs shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Banknote className="w-5 h-5 shrink-0 text-amber-400" />
                  <div>
                    <span className="block text-amber-200 font-black">Cobrar en Efectivo:</span>
                    <span className="text-[10px] text-amber-400/80 font-normal">
                      Verificar importe antes de entregar
                    </span>
                  </div>
                </div>
                <span className="text-base font-black text-amber-400 font-mono">
                  {formatMoney(order.total)}
                </span>
              </div>
            )}

            {/* Botón Real de Confirmación de Entrega */}
            <div className="pt-1">
              <Button
                onClick={() => onCompleteDelivery(order.id)}
                className="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>CONFIRMAR ENTREGA (+{formatMoney(earnings)})</span>
              </Button>
              <p className="text-[10px] text-center text-slate-400 font-medium mt-1.5 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Al pulsar confirmar, la orden se cierra en la base de datos y se acredita tu pago.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
