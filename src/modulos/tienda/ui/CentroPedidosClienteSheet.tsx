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
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

interface CentroPedidosClienteSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: any[];
  onSelectOrderChat: (order: any) => void;
  onRetryOrder?: (orderId: string) => void;
  onOrderFromAnother?: () => void;
}

export function CentroPedidosClienteSheet({
  isOpen,
  onOpenChange,
  orders = [],
  onSelectOrderChat,
  onRetryOrder,
  onOrderFromAnother,
}: CentroPedidosClienteSheetProps) {
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<any | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getInitials = (text: string) => {
    const clean = (text || "CF").replace(/[^a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\s]/g, "").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return clean.slice(0, 2).toUpperCase() || "CF";
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "Ahora";
    try {
      return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Ahora";
    }
  };

  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");

  // Separar pedidos activos (en curso), entregados y cancelados/expirados por timeout
  const activeOrders = orders.filter(
    (o) =>
      o.status !== "Delivered" &&
      o.status !== "delivered" &&
      o.status !== "Cancelled" &&
      o.status !== "cancelled" &&
      o.status !== "cancelled_by_client" &&
      o.status !== "cancelled_timeout" &&
      o.status !== "Rejected" &&
      o.status !== "rejected"
  );

  const deliveredOrders = orders.filter(
    (o) => o.status === "Delivered" || o.status === "delivered"
  );

  const cancelledOrders = orders.filter(
    (o) =>
      o.status === "cancelled_timeout" ||
      o.status === "cancelled_by_client" ||
      o.status === "Cancelled" ||
      o.status === "cancelled" ||
      o.status === "Rejected" ||
      o.status === "rejected"
  );

  const handleCancelByClient = async (orderId: string) => {
    setRetryingId(orderId);
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: "cancelled_by_client" }),
      });
      try {
        const raw = localStorage.getItem("rf_orders_history");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((o) =>
              o.id === orderId ? { ...o, status: "cancelled_by_client" } : o
            );
            localStorage.setItem("rf_orders_history", JSON.stringify(updated));
          }
        }
      } catch {}
      window.dispatchEvent(new CustomEvent("rf-orders-updated"));
    } catch (e) {
      console.error("Error al cancelar pedido:", e);
    } finally {
      setRetryingId(null);
    }
  };

  const handleRetry = async (orderId: string) => {
    setRetryingId(orderId);
    try {
      if (onRetryOrder) {
        onRetryOrder(orderId);
      } else {
        await fetch("/api/orders/custodio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "retry_order", orderId }),
        });
        window.dispatchEvent(new CustomEvent("rf-orders-updated"));
      }
    } catch (e) {
      console.error("Error al retomar pedido:", e);
    } finally {
      setRetryingId(null);
    }
  };

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
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block px-1 pb-1">
                Envíos Activos ({activeOrders.length}) · Tocá un pedido para ver detalles
              </span>

              <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-900/60 border border-slate-800/90 overflow-hidden">
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
                  const isExpanded = expandedOrderId === order.id;
                  const initials = getInitials(storeName);
                  const itemsList = Array.isArray(order.items) ? order.items : [];

                  return (
                    <div
                      key={order.id}
                      className="transition-colors hover:bg-slate-900/90"
                    >
                      {/* Fila Compacta Estilo Mensajería (Al click abre detalles) */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleExpand(order.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") toggleExpand(order.id);
                        }}
                        className="p-3 flex items-center gap-3 cursor-pointer select-none"
                      >
                        {/* Avatar circular con punto de estado en vivo */}
                        <div className="relative w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-white shrink-0">
                          <span>{initials}</span>
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                              isAssigned ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                          />
                        </div>

                        {/* Centro compacto: Comercio + #RF + Dirección + Estado/Total */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs sm:text-sm font-black text-white truncate">
                                {storeName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
                                #{order.id}
                              </span>
                            </div>
                            <span className="text-[10.5px] font-mono text-slate-400 shrink-0">
                              {formatTime(order.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                            <span className="truncate flex items-center gap-1">
                              <Store className="w-3 h-3 text-slate-500 shrink-0" />
                              {order.deliveryAddress || "Tucumán 2130, Rosario"}
                            </span>
                            <span className="font-mono font-bold text-emerald-400 shrink-0">
                              {formatMoney(order.total)}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-300 truncate flex items-center gap-1">
                            <span className="text-emerald-400 font-bold">✓✓</span>
                            <span className="truncate">
                              {isAssigned
                                ? `En viaje · Chofer: ${driverName}`
                                : "Preparando pedido en el comercio..."}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                            isExpanded ? "rotate-90 text-emerald-400" : ""
                          }`}
                        />
                      </div>

                      {/* Panel Desplegable al Click con todos los detalles, Ticket y Chat */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1 bg-slate-950/70 border-t border-slate-800/70 space-y-2.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                            <Badge
                              className={`text-[9.5px] font-bold px-2 py-0.5 ${
                                isAssigned
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              }`}
                            >
                              {isAssigned ? "🛵 En viaje a tu domicilio" : "⏳ Preparando en sucursal"}
                            </Badge>

                            {(order.ticketId || order.ticket_id) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTicketOrder(order);
                                  setIsTicketModalOpen(true);
                                }}
                                className="text-[10.5px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                              >
                                🧾 Ticket #{order.ticketId || order.ticket_id} ↗
                              </button>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] font-medium text-slate-200">
                                Entrega en: {order.deliveryAddress || "Tucumán 2130, Rosario"}
                              </span>
                            </div>

                            {itemsList.length > 0 && (
                              <div className="border-t border-slate-800/80 pt-1.5 space-y-1">
                                {itemsList.map((it: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-[11px] text-slate-300"
                                  >
                                    <span className="truncate pr-2">
                                      {it.name || it.nombre} × {it.quantity || it.cantidad || 1}{" "}
                                      {it.unit || it.unidad || "un"}
                                    </span>
                                    <span className="font-mono text-slate-400 shrink-0">
                                      {formatMoney(
                                        (it.price || it.precio || 0) *
                                          (it.quantity || it.cantidad || 1)
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] border-t border-slate-800/80 pt-1.5">
                              <span className="text-slate-400">Repartidor:</span>
                              <span className="font-bold text-white flex items-center gap-1">
                                {isAssigned ? (
                                  <>
                                    <Bike className="w-3 h-3 text-emerald-400" />
                                    <span>{driverName}</span>
                                  </>
                                ) : (
                                  <span className="text-amber-400 font-normal">
                                    Buscando chofer...
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Total a pagar:</span>
                              <span className="font-bold text-emerald-400 font-mono">
                                {formatMoney(order.total)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectOrderChat(order);
                              }}
                              className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-white" />
                              <span>Abrir Chat (#{order.id})</span>
                              <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
                            </Button>

                            <Button
                              type="button"
                              disabled={retryingId === order.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelByClient(order.id);
                              }}
                              className="h-9 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-bold text-[11px]"
                            >
                              ✕ Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pedidos Rechazados o Cancelados (EN ROJO) */}
          {cancelledOrders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                Cancelados o Rechazados ({cancelledOrders.length})
              </span>
              <div className="space-y-2">
                {cancelledOrders.map((o) => {
                  const isTimeout = o.status === "cancelled_timeout";
                  const isRejected = o.status === "Rejected" || o.status === "rejected";
                  const storeName = o.branch || o.sucursal_origen || "Comercio Cobro Fácil";
                  return (
                    <div
                      key={o.id}
                      className="p-3 rounded-2xl bg-red-950/35 border border-red-500/50 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-red-500/25 pb-1.5">
                        <div className="min-w-0">
                          <div className="font-bold text-red-100 flex items-center gap-1.5 truncate">
                            <Store className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span className="truncate">{storeName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold">
                              #{o.id}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-red-300/80 line-through">
                            {formatMoney(o.total)}
                          </span>
                        </div>
                        <Badge className="bg-red-600 text-white border border-red-500 text-[9px] font-bold py-0.5 shrink-0">
                          {isRejected
                            ? "✕ RECHAZADO"
                            : isTimeout
                            ? "⏰ CANCELADO (1H)"
                            : "✕ CANCELADO POR CLIENTE"}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-red-200/80 leading-snug">
                        {isRejected
                          ? "El comercio rechazó el pedido. Podés pedir a otra empresa o consultar por chat."
                          : isTimeout
                          ? "El comercio no confirmó en 1 hora. Podés retomar el pedido o pedir a otra empresa."
                          : "Cancelaste este pedido. Podés retomarlo cuando quieras o pedir a otra empresa."}
                      </p>

                      {/* Botones de Decisión del Cliente */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          type="button"
                          disabled={retryingId === o.id}
                          onClick={() => handleRetry(o.id)}
                          className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === o.id ? "animate-spin" : ""}`} />
                          <span>{retryingId === o.id ? "Retomando..." : "Retomar Pedido"}</span>
                        </Button>

                        <Button
                          type="button"
                          onClick={() => {
                            onOpenChange(false);
                            if (onOrderFromAnother) onOrderFromAnother();
                          }}
                          className="h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5"
                        >
                          <Store className="w-3 h-3 text-emerald-400" />
                          <span>Pedir a otra Empresa</span>
                        </Button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectOrderChat(o)}
                        className="w-full text-center text-[10px] text-red-300 hover:text-red-200 font-bold pt-1 block"
                      >
                        💬 Ver conversación y tickets anteriores
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historial de Entregados Recientes (EN AZUL DISTINTIVO) */}
          {deliveredOrders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                Entregas Completadas ({deliveredOrders.length})
              </span>
              <div className="space-y-1.5">
                {deliveredOrders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="p-2.5 rounded-xl bg-blue-950/35 border border-blue-500/40 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-blue-100 font-bold flex-wrap">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono text-[10px]">
                          #{o.id}
                        </span>
                        <Badge className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0">
                          ✓ ENTREGADO
                        </Badge>
                        <span className="text-blue-200/80 truncate text-[11px]">
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
