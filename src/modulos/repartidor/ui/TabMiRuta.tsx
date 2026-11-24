"use client";

import React, { useState, useEffect } from "react";
import { DriverOrder } from "../motor/tipos";
import { loadDriverProfile } from "../motor/driverService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Phone,
  Navigation,
  CheckCircle2,
  Banknote,
  ExternalLink,
  Store,
  PackageCheck,
  MessageSquare,
  Sparkles,
  Compass,
  Receipt,
  Route,
  MapPin,
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

  // Estado reactivo del tipo de vehículo seleccionado para la navegación
  const [vehicleType, setVehicleType] = useState<"motorcycle" | "car" | "bicycle">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rf_driver_vehicle");
      if (saved === "car" || saved === "bicycle" || saved === "motorcycle") return saved;
    }
    const profile = loadDriverProfile();
    const v = (profile?.vehicleType || "").toLowerCase();
    if (v.includes("bici") || v.includes("bicycle")) return "bicycle";
    if (v.includes("auto") || v.includes("car")) return "car";
    return "motorcycle";
  });

  const handleVehicleChange = (v: "motorcycle" | "car" | "bicycle") => {
    setVehicleType(v);
    if (typeof window !== "undefined") {
      localStorage.setItem("rf_driver_vehicle", v);
      window.dispatchEvent(new CustomEvent("rf_driver_vehicle_changed", { detail: { vehicle: v } }));
    }
  };

  const travelmode = vehicleType === "bicycle" ? "bicycling" : "driving";

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
      {/* Selector Rápido de Vehículo de Navegación (Moto, Auto, Bici) */}
      <div className="bg-white border border-yellow-300 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-black text-[#2D3277] uppercase tracking-wide">
            Vehículo activo:
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleVehicleChange("motorcycle")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 active:scale-95",
              vehicleType === "motorcycle"
                ? "bg-[#FFE600] text-[#2D3277] shadow-xs border border-yellow-500 scale-102"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            )}
            title="Navegar en Moto (Modo vehicular ágil)"
          >
            <span>🛵</span>
            <span className="hidden sm:inline">Moto</span>
          </button>
          <button
            type="button"
            onClick={() => handleVehicleChange("car")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 active:scale-95",
              vehicleType === "car"
                ? "bg-[#FFE600] text-[#2D3277] shadow-xs border border-yellow-500 scale-102"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            )}
            title="Navegar en Auto / Utilitario"
          >
            <span>🚗</span>
            <span className="hidden sm:inline">Auto</span>
          </button>
          <button
            type="button"
            onClick={() => handleVehicleChange("bicycle")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 active:scale-95",
              vehicleType === "bicycle"
                ? "bg-[#FFE600] text-[#2D3277] shadow-xs border border-yellow-500 scale-102"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            )}
            title="Navegar en Bicicleta (Ciclovías y senderos)"
          >
            <span>🚲</span>
            <span className="hidden sm:inline">Bici</span>
          </button>
        </div>
      </div>

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

        // ─── Coordenadas de Retiro y Entrega (2 Paradas Consecutivas) ───
        const storeCoords = order.storeCoords?.lat && order.storeCoords?.lng
          ? order.storeCoords
          : { lat: -32.9372, lng: -60.6542 };
        const storeTarget = `${storeCoords.lat},${storeCoords.lng}`;

        const hasExactCoords = Boolean(order.destinationCoords?.lat && order.destinationCoords?.lng);
        const customerTarget = hasExactCoords
          ? `${order.destinationCoords!.lat},${order.destinationCoords!.lng}`
          : encodeURIComponent(order.deliveryAddress);

        // Destino de la parada en curso
        const currentStopTarget = isPickedUp ? customerTarget : storeTarget;

        // URLs con dir_action=navigate y travelmode forzado para que no abra "a pie"
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentStopTarget}&travelmode=${travelmode}&dir_action=navigate`;
        const mapsStoreUrl = `https://www.google.com/maps/dir/?api=1&destination=${storeTarget}&travelmode=${travelmode}&dir_action=navigate`;
        const mapsCustomerUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerTarget}&travelmode=${travelmode}&dir_action=navigate`;
        
        // Ruta completa con waypoints (Parada 1: Local -> Parada 2: Casa Comprador)
        const mapsFullRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${customerTarget}&waypoints=${storeTarget}&travelmode=${travelmode}&dir_action=navigate`;

        const rawTicket = order.ticketId || order.ticket_id;
        const isNumericTicket = rawTicket && /^\d+$/.test(String(rawTicket).replace(/^#?RF-?/i, ""));
        const cleanTicket = rawTicket ? String(rawTicket).replace(/^#?RF-?/i, "") : "";
        const rawIdClean = String(order.id || "").replace(/^#?RF-?/i, "");
        const shortId = rawIdClean.length > 6 ? rawIdClean.slice(0, 6) : rawIdClean;
        const ticketDisplay = isNumericTicket ? `Ticket #${cleanTicket}` : `#${shortId}`;

        return (
          <div
            key={order.id}
            className="bg-white border-2 border-yellow-400 rounded-3xl p-4 space-y-3.5 shadow-sm"
          >
            {/* Header del Pedido Activo: Nombre de Cliente destacado + Ticket + Estado en Vivo */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Punto verde pulsante de conexión activa */}
                  <span className="relative flex h-2.5 w-2.5" title="Transmisión activa en vivo">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>

                  {/* Nombre del Cliente destacado */}
                  <h3 className="text-base font-black text-slate-900 truncate">
                    {client}
                  </h3>

                  {/* Badge de Ticket Digital */}
                  <button
                    type="button"
                    onClick={() => onOpenOrderChat?.(order)}
                    className="inline-flex items-center gap-1 font-black text-[11px] bg-yellow-100 hover:bg-[#FFE600] text-[#2D3277] px-2 py-0.5 rounded-lg border border-yellow-400 active:scale-95 transition-all"
                    title={`Ver chat y ticket ${ticketDisplay}`}
                  >
                    <Receipt className="w-3 h-3 text-[#2D3277]" />
                    <span>{ticketDisplay}</span>
                  </button>
                </div>

                {/* Subtítulo de Estado del Pedido */}
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {isPickedUp ? (
                    <Badge className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 shadow-xs">
                      🛵 EN CAMINO AL DOMICILIO
                    </Badge>
                  ) : isPacked ? (
                    <Badge className="bg-[#FFE600] text-[#2D3277] font-black text-[10px] px-2 py-0.5 animate-pulse shadow-xs shadow-yellow-500/30">
                      📦 LISTO PARA RETIRAR EN LOCAL
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5">
                      🏪 PREPARANDO EN SUCURSAL
                    </Badge>
                  )}
                  <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px]">
                    📍 {order.deliveryAddress}
                  </span>
                </div>
              </div>

              {/* Ganancia neta */}
              <div className="text-right shrink-0">
                <span className="text-[9.5px] text-slate-400 uppercase font-black block">
                  Tu Ganancia
                </span>
                <span className="text-base font-black text-emerald-700">
                  {earnings == null ? "Sin dato" : `+${formatMoney(earnings)}`}
                </span>
              </div>
            </div>

            {/* Puntos de Ruta Reales (2 Paradas Consecutivas: 1) Retiro en Comercio y 2) Entrega a Domicilio) */}
            <div className="space-y-2.5">
              {/* PARADA 1: Retiro en Sucursal / Negocio */}
              <div
                className={cn(
                  "p-3 rounded-2xl border text-xs transition-all",
                  !isPickedUp
                    ? "bg-amber-50/90 border-amber-300 shadow-xs ring-1 ring-amber-300/60"
                    : "bg-slate-50 border-slate-200 opacity-75"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black",
                        !isPickedUp
                          ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300/60"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {isPickedUp ? "✓" : "1"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {isPickedUp ? "✓ Parada 1: Retirado del Local" : "📍 Parada 1: Retiro en Sucursal"}
                        </span>
                        {!isPickedUp && (
                          <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full uppercase">
                            En curso
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs block truncate mt-0.5">
                        {branchDisplay}
                      </span>
                    </div>
                  </div>
                  <a
                    href={mapsStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 shrink-0 transition-all border shadow-xs active:scale-95",
                      !isPickedUp
                        ? "bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] border-yellow-500 font-extrabold"
                        : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                    )}
                    title="Navegar por GPS hasta la sucursal de retiro"
                  >
                    <Compass className="w-3 h-3 text-yellow-800" />
                    <span>GPS Local</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </div>
              </div>

              {/* PARADA 2: Entrega en Domicilio del Comprador */}
              <div
                className={cn(
                  "p-3 rounded-2xl border text-xs transition-all",
                  isPickedUp
                    ? "bg-blue-50/90 border-blue-300 shadow-xs ring-1 ring-blue-400/50"
                    : "bg-slate-50 border-slate-200 opacity-75"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black",
                        isPickedUp
                          ? "bg-blue-600 text-white ring-2 ring-blue-300/60"
                          : "bg-slate-200 text-slate-600"
                      )}
                    >
                      2
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {isPickedUp ? "🛵 Parada 2: Entregar al Cliente" : "⏳ Parada 2: Domicilio del Cliente"}
                        </span>
                        {isPickedUp && (
                          <span className="text-[9px] font-black bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded-full uppercase">
                            En curso
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs block mt-0.5">
                        {order.deliveryAddress}
                      </span>
                      {hasExactCoords && (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 mt-1">
                          🎯 Ubicación exacta con GPS fijada por comprador
                        </span>
                      )}
                      {order.notes && (
                        <span className="text-[10.5px] text-yellow-900 font-medium block mt-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                          Nota: "{order.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={mapsCustomerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 shrink-0 transition-all border shadow-xs active:scale-95",
                      isPickedUp
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 font-extrabold"
                        : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                    )}
                    title="Navegar por GPS hasta el domicilio del comprador"
                  >
                    <Compass className="w-3 h-3 text-current" />
                    <span>GPS Cliente</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Botón de RUTA COMPLETA DE 2 PARADAS (Local -> Cliente) */}
              <a
                href={mapsFullRouteUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full h-9 rounded-xl bg-slate-100 hover:bg-yellow-50 text-slate-800 hover:text-[#2D3277] border border-slate-200 hover:border-yellow-400 font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98"
                title="Abrir en Google Maps la ruta completa de ambas paradas en secuencia"
              >
                <Route className="w-3.5 h-3.5 text-yellow-700" />
                <span>Navegar Ambas Paradas (Local ➔ Domicilio)</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>

            {/* Acciones de Navegación Rápida, Llamada y Chat */}
            <div className="grid grid-cols-3 gap-1.5">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded-xl bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] font-black text-[11px] flex items-center justify-center gap-1 border border-yellow-500 transition-all shadow-xs group px-1 active:scale-95"
                title={!isPickedUp ? "Iniciar GPS a Parada 1 (Local)" : "Iniciar GPS a Parada 2 (Cliente)"}
              >
                <Compass className="w-3.5 h-3.5 text-[#2D3277] group-hover:rotate-45 transition-transform" />
                <span>{!isPickedUp ? "GPS Parada 1" : "GPS Parada 2"}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>

              <a
                href={`tel:${phone}`}
                className="h-10 rounded-xl bg-white hover:bg-yellow-50 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-200 transition-all shadow-xs px-1 active:scale-95"
                title="Llamar al cliente"
              >
                <Phone className="w-3.5 h-3.5 text-yellow-700" />
                <span>Llamar</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenOrderChat?.(order)}
                className="h-10 rounded-xl bg-white hover:bg-yellow-50 text-[#2D3277] font-bold text-[11px] flex items-center justify-center gap-1 border border-yellow-300 transition-all shadow-xs active:scale-95 px-1"
                title="Abrir chat privado de esta entrega"
              >
                <MessageSquare className="w-3.5 h-3.5 text-yellow-700" />
                <span>Chat</span>
              </button>
            </div>

            {/* Distancia y Tiempo Estimado */}
            <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Navigation className="w-3.5 h-3.5 text-yellow-700" />
                <span>Distancia estimada:</span>
              </div>
              <span className="text-slate-900 font-bold font-mono">
                {distanceDisplay} km · ~{minutesDisplay} min
              </span>
            </div>

            {/* Detalle de Cortes a Entregar */}
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
                    <span>{ticketDisplay}</span>
                    <MessageSquare className="w-2.5 h-2.5 text-[#2D3277] group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
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
                {order.items.length > 3 && (
                  <p className="text-[9.5px] text-slate-400 text-center pt-0.5 font-medium">
                    ↕ Deslizá para ver los {order.items.length} cortes
                  </p>
                )}
              </div>
            )}

            {/* Aviso Destacado de Cobro en Efectivo */}
            {isCash && (
              <div className="p-3 rounded-2xl bg-yellow-50 border-2 border-yellow-300 flex items-center justify-between text-xs shadow-xs">
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

            {/* Botón Principal según estado: Primero Retirar en Local, luego Entregar al Cliente */}
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
                    Presioná cuando tengas el paquete para pasar a la Parada 2 (Domicilio).
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
