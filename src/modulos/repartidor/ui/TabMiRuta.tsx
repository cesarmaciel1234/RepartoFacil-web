"use client";

import React, { useState } from "react";
import { DriverOrder, formatShortOrderCode, STORE_DEFAULT_DERQUI } from "../motor/tipos";
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
  PackageCheck,
  MessageSquare,
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
        
        // Estado del pedido: ¿Ya fue retirado en la tienda?
        const isPacked = ["ready", "embalado"].includes(
          String(order.status).trim().toLowerCase()
        );
        const isPickedUp = ["picked up", "in transit", "en_camino"].includes(
          String(order.status).trim().toLowerCase()
        );

        // ─── 1. Destino Físico Exacto de la Tienda de Retiro (Parada 1) ───
        const rawBranch = order.branch || STORE_DEFAULT_DERQUI.name;
        const isAlfaroBranch =
          rawBranch.toLowerCase().includes("alfaro") ||
          rawBranch.toLowerCase().includes("maciel") ||
          rawBranch.toLowerCase().includes("derqui");
        
        // Dirección física real de la sucursal de Cobro Fácil en Presidente Derqui
        const storeAddressClean = isAlfaroBranch
          ? STORE_DEFAULT_DERQUI.address
          : rawBranch.length > 5
          ? rawBranch
          : STORE_DEFAULT_DERQUI.address;

        const storeTarget = order.storeCoords?.lat && order.storeCoords?.lng
          ? `${order.storeCoords.lat},${order.storeCoords.lng}`
          : `${STORE_DEFAULT_DERQUI.coords.lat},${STORE_DEFAULT_DERQUI.coords.lng}`;

        const branchDisplay = isAlfaroBranch
          ? STORE_DEFAULT_DERQUI.name + " · Pte. Derqui"
          : rawBranch;

        // ─── 2. Destino del Domicilio del Comprador (Parada 2) ───
        const hasExactCoords = Boolean(order.destinationCoords?.lat && order.destinationCoords?.lng);
        const customerTarget = hasExactCoords
          ? `${order.destinationCoords!.lat},${order.destinationCoords!.lng}`
          : encodeURIComponent(order.deliveryAddress);

        // ─── Enlaces GPS Específicos por Etapa ───
        // Parada 1: SIEMPRE a la Tienda de Retiro
        const mapsStoreUrl = `https://www.google.com/maps/dir/?api=1&destination=${storeTarget}&travelmode=${travelmode}&dir_action=navigate`;
        
        // Parada 2: SIEMPRE al Domicilio del Cliente
        const mapsCustomerUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerTarget}&travelmode=${travelmode}&dir_action=navigate`;

        const ticketDisplay = formatShortOrderCode(order.id);

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

                {/* Subtítulo de Estado de la Misión */}
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {isPickedUp ? (
                    <Badge className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 shadow-xs">
                      🛵 EN CAMINO AL DOMICILIO (PARADA 2)
                    </Badge>
                  ) : isPacked ? (
                    <Badge className="bg-[#FFE600] text-[#2D3277] font-black text-[10px] px-2 py-0.5 animate-pulse shadow-xs shadow-yellow-500/30">
                      📦 LISTO: IR A RETIRAR A LA TIENDA (PARADA 1)
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5">
                      🏪 PREPARANDO: IR A LA TIENDA (PARADA 1)
                    </Badge>
                  )}
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

            {/* ─── Puntos de Ruta Reales: Tarjeta Única por Tramo Activo ─── */}
            {!isPickedUp ? (
              /* ─── TRAMO 1 ÚNICO: RETIRAR EN COMERCIO ─── */
              <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-300 px-2.5 py-1 rounded-xl">
                    <span>📍</span>
                    <span>Paso 1 de 2 · Retirar en comercio</span>
                  </span>
                  <span className="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg uppercase animate-pulse">
                    Parada actual
                  </span>
                </div>

                <div>
                  <span className="font-black text-slate-900 text-sm block">
                    {branchDisplay}
                  </span>
                  <span className="text-xs text-slate-600 block mt-0.5">
                    📍 Dirección: {storeAddressClean}
                  </span>
                </div>

                {/* Botones integrados del Tramo 1 */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={mapsStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border border-yellow-500 bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] shadow-sm active:scale-95 transition-all px-1"
                    title="Navegar en Google Maps a la tienda física"
                  >
                    <Compass className="w-4 h-4 text-[#2D3277]" />
                    <span>GPS Tienda</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <a
                    href={`tel:${phone}`}
                    className="h-11 rounded-xl bg-white hover:bg-yellow-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm active:scale-95 transition-all px-1"
                    title="Llamar al comercio o cliente"
                  >
                    <Phone className="w-4 h-4 text-yellow-700" />
                    <span>Llamar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenOrderChat?.(order)}
                    className="h-11 rounded-xl bg-white hover:bg-yellow-50 text-[#2D3277] font-bold text-xs flex items-center justify-center gap-1.5 border border-yellow-300 shadow-sm active:scale-95 transition-all px-1"
                    title="Abrir chat de la orden"
                  >
                    <MessageSquare className="w-4 h-4 text-yellow-700" />
                    <span>Chat</span>
                  </button>
                </div>

                {/* Botón Principal de Acción Tramo 1 */}
                <div className="pt-1">
                  <Button
                    onClick={() => onPickupOrder(order.id)}
                    disabled={pendingOrderIds.includes(order.id)}
                    className="w-full h-12 rounded-xl bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-yellow-500/20 active:scale-98 transition-all border-2 border-yellow-500"
                  >
                    <PackageCheck className="w-5 h-5 text-[#2D3277]" />
                    <span>
                      {pendingOrderIds.includes(order.id)
                        ? "CONFIRMANDO RETIRO EN TIENDA..."
                        : "YA RETIRÉ EL PEDIDO EN LA TIENDA"}
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              /* ─── TRAMO 2 ÚNICO: ENTREGAR AL CLIENTE ─── */
              <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 px-2.5 py-1 rounded-xl shadow-xs">
                    <span>🛵</span>
                    <span>Paso 2 de 2 · Entregar al cliente</span>
                  </span>
                  <span className="text-[10px] font-black text-blue-900 bg-blue-200 px-2 py-0.5 rounded-lg uppercase animate-pulse">
                    En entrega
                  </span>
                </div>

                {/* Cobro en efectivo destacado si corresponde */}
                {isCash && (
                  <div className="p-3 rounded-xl bg-amber-100/90 border border-amber-300 flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2 text-amber-950 font-bold">
                      <Banknote className="w-5 h-5 shrink-0 text-amber-800" />
                      <div>
                        <span className="block text-amber-950 font-black">Cobrar en efectivo:</span>
                        <span className="text-[10px] text-amber-800 font-normal">
                          Verificar antes de entregar
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-black text-amber-950 font-mono">
                      {formatMoney(order.total)}
                    </span>
                  </div>
                )}

                <div>
                  <span className="font-black text-slate-900 text-sm block">
                    {order.deliveryAddress}
                  </span>
                  {hasExactCoords && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300 mt-1">
                      🎯 Ubicación exacta con GPS fijada por comprador
                    </span>
                  )}
                  {order.notes && (
                    <span className="text-xs text-yellow-950 font-medium block mt-1 bg-yellow-100/80 px-2.5 py-1 rounded-lg border border-yellow-300">
                      Nota: "{order.notes}"
                    </span>
                  )}
                </div>

                {/* Botones integrados del Tramo 2 */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={mapsCustomerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border border-blue-700 bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95 transition-all px-1"
                    title="Navegar en Google Maps al domicilio del comprador"
                  >
                    <Compass className="w-4 h-4 text-white" />
                    <span>GPS Cliente</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <a
                    href={`tel:${phone}`}
                    className="h-11 rounded-xl bg-white hover:bg-yellow-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm active:scale-95 transition-all px-1"
                    title="Llamar al cliente"
                  >
                    <Phone className="w-4 h-4 text-yellow-700" />
                    <span>Llamar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenOrderChat?.(order)}
                    className="h-11 rounded-xl bg-white hover:bg-yellow-50 text-[#2D3277] font-bold text-xs flex items-center justify-center gap-1.5 border border-yellow-300 shadow-sm active:scale-95 transition-all px-1"
                    title="Abrir chat de la orden"
                  >
                    <MessageSquare className="w-4 h-4 text-yellow-700" />
                    <span>Chat</span>
                  </button>
                </div>

                {/* Botón Principal de Acción Tramo 2 */}
                <div className="pt-1">
                  <Button
                    onClick={() => onCompleteDelivery(order.id)}
                    disabled={pendingOrderIds.includes(order.id)}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all border border-blue-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>
                      {pendingOrderIds.includes(order.id)
                        ? "CONFIRMANDO ENTREGA EN DESTINO..."
                        : "MARCAR COMO ENTREGADO"}
                    </span>
                  </Button>
                </div>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
