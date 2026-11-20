"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModalTicketDigital } from "@/components/ModalTicketDigital";
import {
  Truck,
  Store,
  MapPin,
  Clock,
  MessageSquare,
  Bike,
  CheckCircle2,
  Package,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface CentroPedidosClienteSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: any[];
  onSelectOrderChat: (order: any) => void;
}

export function CentroPedidosClienteSheet({
  isOpen,
  onOpenChange,
  orders = [],
  onSelectOrderChat,
}: CentroPedidosClienteSheetProps) {
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<any | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");

  // Separar pedidos activos (en curso) de los ya entregados
  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );
  const deliveredOrders = orders.filter(
    (o) => o.status === "Delivered"
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-slate-950 border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full"
      >
        {/* Encabezado del Centro de Pedidos */}
        <SheetHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-sm font-black text-white flex items-center gap-2">
                Centro de Envíos en Curso
                {activeOrders.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </SheetTitle>
              <p className="text-[11px] text-slate-400 font-medium">
                Seguimiento multitienda y chat privado por pedido
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold py-0.5">
            {activeOrders.length} activo{activeOrders.length === 1 ? "" : "s"}
          </Badge>
        </SheetHeader>

        {/* Lista de Pedidos en Curso */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No tenés pedidos en camino</h4>
              <p className="text-xs text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                Cuando compres en una o más empresas, vas a poder seguir el estado y chatear con cada repartidor desde acá.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Envíos Activos ({activeOrders.length})
              </span>

              {activeOrders.map((order) => {
                const storeName =
                  order.branch ||
                  order.sucursal_origen ||
                  "Comercio Cobro Fácil";
                const isAssigned =
                  order.status === "Assigned" ||
                  order.status === "Picked Up" ||
                  order.status === "In Transit";
                const driverName = order.driverName || "Lucas Motomensajero";

                return (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-3 relative overflow-hidden"
                  >
                    {/* Banda superior de la empresa */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-white truncate">
                          <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{storeName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            #{order.id}
                          </span>
                          {(order.ticketId || order.ticket_id) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTicketOrder(order);
                                setIsTicketModalOpen(true);
                              }}
                              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                              title="Ver Ticket Digital Cobro Fácil"
                            >
                              🧾 Ticket #{order.ticketId || order.ticket_id} ↗
                            </button>
                          )}
                        </div>
                      </div>

                      <Badge
                        className={`text-[9px] font-bold px-2 py-0.5 shrink-0 ${
                          isAssigned
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {isAssigned ? "🛵 En viaje" : "⏳ Preparando"}
                      </Badge>
                    </div>

                    {/* Datos del Reparto */}
                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] font-medium text-slate-300 truncate">
                          {order.deliveryAddress || "Bv. Oroño 1420, Rosario"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] border-t border-slate-800/50 pt-1.5">
                        <span className="text-slate-400">Total a pagar:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatMoney(order.total)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Repartidor:</span>
                        <span className="font-bold text-white flex items-center gap-1">
                          {isAssigned ? (
                            <>
                              <Bike className="w-3 h-3 text-emerald-400" />
                              <span>{driverName}</span>
                            </>
                          ) : (
                            <span className="text-amber-400 font-normal">Buscando chofer...</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Botón Acción: Abrir Chat Privado de este Pedido */}
                    <Button
                      type="button"
                      onClick={() => onSelectOrderChat(order)}
                      className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-98 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                      <span>Abrir Chat Privado (#{order.id})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historial de Entregados Recientes */}
          {deliveredOrders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Entregas Anteriores ({deliveredOrders.length})
              </span>
              <div className="space-y-1.5">
                {deliveredOrders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-white text-[11px]">#{o.id}</span>
                        <span className="text-slate-400 truncate text-[11px]">
                          · {o.branch || "Sucursal Central"}
                        </span>
                      </div>
                      {(o.ticketId || o.ticket_id) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicketOrder(o);
                            setIsTicketModalOpen(true);
                          }}
                          className="mt-1 text-[9.5px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded-md flex items-center gap-1 transition-all"
                        >
                          🧾 Ticket #{o.ticketId || o.ticket_id} ↗
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectOrderChat(o)}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 pl-2"
                    >
                      <span>Ver chat</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Ticket Digital Idéntico a Cobro Fácil */}
        <ModalTicketDigital
          isOpen={isTicketModalOpen}
          onOpenChange={setIsTicketModalOpen}
          order={selectedTicketOrder}
        />
      </SheetContent>
    </Sheet>
  );
}
