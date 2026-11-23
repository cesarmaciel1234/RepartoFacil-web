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
  PackageCheck,
  MessageSquare,
  Sparkles,
  Compass,
  Receipt,
} from "lucide-react";

interface TabMiRutaProps {
  activeOrders: DriverOrder[];
  onPickupOrder: (orderId: string) => void;
  onCompleteDelivery: (orderId: string) => void;
  onOpenOrderChat?: (order: DriverOrder) => void;
  pendingOrderIds: string[];
}

export function TabMiRuta({
  activeOrders,
  onPickupOrder,
  onCompleteDelivery,
  onOpenOrderChat,
  pendingOrderIds,
}: TabMiRutaProps) {
  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");

  if (activeOrders.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-700 mx-auto flex items-center justify-center">
          <Navigation className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">No tenés pedidos en tu ruta activa</h4>
        <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
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
        const earnings = order.driverEarnings;
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
        const isPacked = ["ready", "embalado"].includes(
          String(order.status).trim().toLowerCase()
        );
        const isPickedUp = ["picked up", "in transit"].includes(
          String(order.status).trim().toLowerCase()
        );

        // Enlace real a Google Maps para navegación GPS del chofer
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          order.deliveryAddress
        )}`;

        const rawTicket = order.ticketId || order.ticket_id || order.id;
        const cleanTicket = String(rawTicket).replace(/^#?RF-?/i, "");
        const ticketDisplay = cleanTicket.length > 6 ? `RF-${cleanTicket.slice(0, 4)}…` : rawTicket.startsWith("RF-") ? rawTicket : `RF-${cleanTicket}`;

        return (
          <div
            key={order.id}
            className="bg-white border-2 border-yellow-400 rounded-3xl p-4 space-y-3.5 shadow-sm"
          >
            {/* Header del Pedido Activo */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenOrderChat?.(order)}
                    className="flex items-center gap-1 font-black text-sm text-[#2D3277] hover:text-blue-700 active:scale-95 transition-all text-left group"
                    title={`Abrir chat del pedido #${order.id} en esta misma ventana`}
                  >
                    <Receipt className="w-3.5 h-3.5 text-yellow-700" />
                    <span>#{ticketDisplay}</span>
                  </button>
                  {isPickedUp ? (
                    <Badge className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 shadow-sm">
                      🛵 EN VIAJE AL DOMICILIO
                    </Badge>
                  ) : isPacked ? (
                    <Badge className="bg-[#FFE600] text-[#2D3277] font-black text-[10px] px-2 py-0.5 animate-pulse shadow-sm shadow-yellow-500/30">
                      📦 EMBALADO / LISTO PARA RETIRAR
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-50 text-yellow-900 border border-yellow-300 text-[10px] font-black px-2 py-0.5">
                      🏪 EN PREPARACIÓN EN LOCAL
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">{client}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Tu ganancia neta
                </span>
                <span className="text-base font-black text-[#2D3277]">
                  {earnings == null ? "Sin dato" : `+${formatMoney(earnings)}`}
                </span>
              </div>
            </div>

            {/* Puntos de Ruta Reales (Retiro en Comercio y Entrega a Domicilio) */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              {/* Origen (Sucursal de Retiro) */}
              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                    Retiro en Sucursal:
                  </span>
                  <span className="font-bold text-slate-900 text-xs block truncate">
                    {branchDisplay}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                    Entregar en Domicilio:
                  </span>
                  <span className="font-bold text-slate-900 text-xs block">
                    {order.deliveryAddress}
                  </span>
                  {order.notes && (
                    <span className="text-[11px] text-yellow-900 font-medium block mt-0.5 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                      Nota cliente: "{order.notes}"
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones de Navegación, Llamada y Chat de Pedido */}
            <div className="grid grid-cols-3 gap-1.5">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded-xl bg-slate-50 hover:bg-yellow-50 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-200 transition-all shadow-sm group px-1"
                title="Abrir mapa en Google Maps"
              >
                <Compass className="w-3.5 h-3.5 text-yellow-700 group-hover:rotate-45 transition-transform" />
                <span>GPS</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>

              <a
                href={`tel:${phone}`}
                className="h-10 rounded-xl bg-white hover:bg-yellow-50 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-200 transition-all shadow-sm px-1"
                title="Llamar al cliente"
              >
                <Phone className="w-3.5 h-3.5 text-yellow-700" />
                <span>Llamar</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenOrderChat?.(order)}
                className="h-10 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-900 font-bold text-[11px] flex items-center justify-center gap-1 border border-yellow-300 transition-all shadow-sm active:scale-95 px-1"
                title="Abrir chat privado de esta entrega"
              >
                <MessageSquare className="w-3.5 h-3.5 text-yellow-700" />
                <span>Chat</span>
              </button>
            </div>

            {/* Distancia y Tiempo Real */}
            <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-yellow-700" />
                <span className="text-slate-600">Distancia estimada:</span>
              </div>
              <span className="text-slate-900 font-bold font-mono">
                {distanceDisplay} km · ~{minutesDisplay} min
              </span>
            </div>

            {/* Detalle de Artículos con Número de Ticket y acceso fluido al chat en la misma ventana */}
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-yellow-700" />
                    Cortes a Entregar ({order.items.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenOrderChat?.(order)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] text-[10px] sm:text-[11px] font-black border border-yellow-500 shadow-xs transition-all active:scale-95 group"
                    title="Abrir chat del pedido en la misma ventana"
                  >
                    <span>Ticket #{ticketDisplay}</span>
                    <MessageSquare className="w-2.5 h-2.5 text-[#2D3277] group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="space-y-1">
                  {order.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-700 flex items-center justify-between"
                    >
                      <span className="truncate">
                        • {item.quantity} {item.unit || "kg"} de {item.name}
                      </span>
                      <span className="font-mono text-slate-600 text-[11px] shrink-0 pl-2">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Botón interactivo integrado para abrir el chat fluido */}
                <button
                  type="button"
                  onClick={() => onOpenOrderChat?.(order)}
                  className="w-full pt-1.5 mt-1 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-extrabold text-[#2D3277] hover:text-blue-900 transition-colors group"
                  title="Abrir chat en esta misma ventana"
                >
                  <span className="flex items-center gap-1 text-slate-600 group-hover:text-[#2D3277]">
                    <MessageSquare className="w-3.5 h-3.5 text-yellow-700 group-hover:scale-110 transition-transform" />
                    <span>Chat con cliente y negocio</span>
                  </span>
                  <span className="text-[10px] bg-yellow-100 group-hover:bg-[#FFE600] px-2 py-0.5 rounded-md text-yellow-900 group-hover:text-[#2D3277] font-black transition-colors">
                    Abrir chat →
                  </span>
                </button>
              </div>
            )}

            {/* Aviso Destacado de Cobro en Efectivo */}
            {isCash && (
              <div className="p-3 rounded-2xl bg-yellow-50 border-2 border-yellow-300 flex items-center justify-between text-xs shadow-sm">
                <div className="flex items-center gap-2 text-yellow-900 font-bold">
                  <Banknote className="w-5 h-5 shrink-0 text-yellow-700" />
                  <div>
                    <span className="block text-yellow-900 font-black">Cobrar en Efectivo:</span>
                    <span className="text-[10px] text-yellow-800 font-normal">
                      Verificar importe antes de entregar
                    </span>
                  </div>
                </div>
                <span className="text-base font-black text-yellow-900 font-mono">
                  {formatMoney(order.total)}
                </span>
              </div>
            )}

            {/* Botón según estado de la ruta: Primero Retirar, luego Entregar */}
            <div className="pt-1">
              {!isPickedUp ? (
                <>
                  <Button
                    onClick={() => onPickupOrder(order.id)}
                    disabled={pendingOrderIds.includes(order.id)}
                    className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all"
                  >
                    <PackageCheck className="w-5 h-5 text-white" />
                    <span>
                      {pendingOrderIds.includes(order.id)
                        ? "RETIRO PENDIENTE DE CONFIRMACIÓN"
                        : "CONFIRMAR RETIRO EN NEGOCIO"}
                    </span>
                  </Button>
                  <p className="text-[10px] text-center text-slate-500 font-medium mt-1.5 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Presioná cuando tengas el pedido en tu poder para avisar al cliente.
                  </p>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => onCompleteDelivery(order.id)}
                    disabled={pendingOrderIds.includes(order.id)}
                    className="w-full h-13 rounded-2xl bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-yellow-500/20 active:scale-98 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#2D3277]" />
                    <span>
                      {pendingOrderIds.includes(order.id)
                        ? "ENTREGA PENDIENTE DE CONFIRMACIÓN"
                        : earnings == null
                        ? "CONFIRMAR ENTREGA EN DESTINO"
                        : `CONFIRMAR ENTREGA (+${formatMoney(earnings)})`}
                    </span>
                  </Button>
                  <p className="text-[10px] text-center text-slate-500 font-medium mt-1.5 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-700" />
                    La ganancia se acredita cuando el servidor confirma la entrega.
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
