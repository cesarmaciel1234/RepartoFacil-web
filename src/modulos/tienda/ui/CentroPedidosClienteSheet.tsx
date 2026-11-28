"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModalTicketDigital } from "@/components/ModalTicketDigital";
import { OrderChatSheet } from "../../repartidor/ui/OrderChatSheet";
import { Truck, ArrowLeft, Package, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatSavedTime } from "../catalogo/AvisoCatalogo";
import { authHeaders } from "@/lib/clientAuth";
import { CentroPedidoDetalleView } from "./CentroPedidoDetalleView";
import { CentroPedidoItemRow } from "./CentroPedidoItemRow";

interface CentroPedidosClienteSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: any[];
  ordersCached?: boolean;
  ordersSavedAt?: string | null;
  initialOrderId?: string | null;
}

export function CentroPedidosClienteSheet({
  isOpen,
  onOpenChange,
  orders = [],
  ordersCached = false,
  ordersSavedAt = null,
  initialOrderId = null,
}: CentroPedidosClienteSheetProps) {
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<any | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) setSelectedOrderId(initialOrderId);
  }, [isOpen, initialOrderId]);

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

  // Separar pedidos activos (en curso)
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

  const selectedOrder =
    activeOrders.find((order) => String(order.id) === selectedOrderId) || null;
  const selectedOrderStoreName =
    selectedOrder?.branch || selectedOrder?.sucursal_origen || "Comercio Cobro Fácil";
  const selectedOrderIsAssigned =
    selectedOrder?.status === "Assigned" ||
    selectedOrder?.status === "Picked Up" ||
    selectedOrder?.status === "In Transit";
  const selectedOrderIsPickup =
    String(selectedOrder?.deliveryType || selectedOrder?.tipo_entrega || "").toLowerCase() === "pickup";
  const selectedOrderDriverName = selectedOrder?.driverName || "Repartidor";
  const selectedOrderItems =
    selectedOrder && Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
  const selectedOrderHasTicket = Boolean(selectedOrder?.ticketId || selectedOrder?.ticket_id);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedOrderId(null);
      setIsChatOpen(false);
      setOrderToCancel(null);
    }
    onOpenChange(open);
  };

  const handleCancelByClient = async (orderId: string) => {
    setRetryingId(orderId);
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders("Client") },
        body: JSON.stringify({ id: orderId, status: "cancelled_by_client" }),
      });
      if (!response.ok) {
        throw new Error(`El servidor respondió ${response.status}`);
      }

      try {
        const raw = localStorage.getItem("rf_orders_history");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((o) =>
              String(o.id) === orderId ? { ...o, status: "cancelled_by_client" } : o
            );
            localStorage.setItem("rf_orders_history", JSON.stringify(updated));
          }
        }
      } catch (cacheError) {
        console.error("Error al actualizar el historial local:", cacheError);
      }

      window.dispatchEvent(new CustomEvent("rf-orders-updated"));
      setSelectedOrderId(null);
      setIsChatOpen(false);
      setOrderToCancel(null);
      toast({ title: "Pedido cancelado" });
    } catch (e) {
      console.error("Error al cancelar pedido:", e);
      toast({
        title: "No se pudo cancelar",
        description: "Intentá nuevamente en unos momentos.",
        variant: "destructive",
      });
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="bg-slate-950/45 backdrop-blur-sm"
        className="fixed bottom-0 left-0 top-auto flex max-h-[72dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-3xl rounded-b-none border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/20 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        {!isChatOpen && (
          <DialogHeader className="shrink-0 flex-row items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 pr-12 text-left">
            {selectedOrder ? (
              <>
                <div className="flex min-w-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Volver a pedidos"
                    onClick={() => {
                      setSelectedOrderId(null);
                      setOrderToCancel(null);
                    }}
                    className="-ml-2 h-9 w-9 shrink-0 rounded-full text-slate-600 hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="min-w-0">
                    <DialogTitle className="text-sm font-black text-slate-900">
                      Detalle del pedido
                    </DialogTitle>
                    <DialogDescription className="text-[11px] font-medium text-slate-500">
                      #{selectedOrder.id}
                    </DialogDescription>
                  </div>
                </div>
                <Badge className="mr-1 shrink-0 border border-blue-100 bg-blue-50 py-0.5 text-[10px] font-bold text-blue-700">
                  {selectedOrderIsPickup
                    ? ["ready", "embalado"].includes(String(selectedOrder.status || "").toLowerCase())
                      ? "Listo para retirar"
                      : ["delivered"].includes(String(selectedOrder.status || "").toLowerCase())
                        ? "Retirado"
                        : "Preparando"
                    : selectedOrderIsAssigned
                      ? "En camino"
                      : "Preparando"}
                </Badge>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <DialogTitle className="flex items-center gap-2 text-sm font-black text-slate-900">
                      {ordersCached ? "Pedidos guardados" : "Pedidos en vivo"}
                      {!ordersCached && activeOrders.length > 0 && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      )}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-[11px] font-medium text-slate-500">
                      {ordersCached ? "Los estados pueden haber cambiado" : "Seguimiento en tiempo real y chat por pedido"}
                    </DialogDescription>
                  </div>
                </div>
                <Badge className="mr-1 shrink-0 border border-blue-100 bg-blue-50 py-0.5 text-[10px] font-bold text-blue-700">
                  {activeOrders.length} activo{activeOrders.length === 1 ? "" : "s"}
                </Badge>
              </>
            )}
          </DialogHeader>
        )}

        <div
          className={
            isChatOpen
              ? "min-h-0 flex-1 overflow-hidden bg-white"
              : "min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-5"
          }
        >
          {ordersCached && ordersSavedAt && orders.length > 0 && !isChatOpen && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              <WifiOff className="h-4 w-4 shrink-0 text-amber-700" />
              <span>Modo sin conexión: mostrando pedidos guardados ({formatSavedTime(ordersSavedAt)}). Los estados se actualizarán al reconectar.</span>
            </div>
          )}

          {isChatOpen && selectedOrder && (
            <OrderChatSheet
              embedded
              isOpen={isChatOpen}
              onOpenChange={setIsChatOpen}
              activeOrder={selectedOrder}
              viewerRole="client"
              deliveryAddress={selectedOrder.deliveryAddress}
              onBackToOrdersHub={() => setIsChatOpen(false)}
            />
          )}

          {selectedOrder && !isChatOpen && (
            <CentroPedidoDetalleView
              selectedOrder={selectedOrder}
              selectedOrderStoreName={selectedOrderStoreName}
              selectedOrderIsPickup={selectedOrderIsPickup}
              selectedOrderIsAssigned={selectedOrderIsAssigned}
              selectedOrderDriverName={selectedOrderDriverName}
              selectedOrderItems={selectedOrderItems}
              selectedOrderHasTicket={selectedOrderHasTicket}
              retryingId={retryingId}
              orderToCancel={orderToCancel}
              formatTime={formatTime}
              formatMoney={formatMoney}
              onOpenTicket={(order) => {
                setSelectedTicketOrder(order);
                setIsTicketModalOpen(true);
              }}
              onOpenChat={() => {
                setOrderToCancel(null);
                setIsChatOpen(true);
              }}
              onSetOrderToCancel={setOrderToCancel}
              onCancelByClient={handleCancelByClient}
            />
          )}

          {!selectedOrder && (activeOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No tenés pedidos en camino</h4>
              <p className="mx-auto max-w-[260px] text-xs leading-relaxed text-slate-500">
                Cuando compres en una o más empresas, vas a poder seguir el estado y chatear con cada repartidor desde acá.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="block px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Envíos Activos ({activeOrders.length}) · Tocá un pedido para ver detalles
              </span>

              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {activeOrders.map((order) => (
                  <CentroPedidoItemRow
                    key={order.id}
                    order={order}
                    onSelect={(id) => setSelectedOrderId(id)}
                    getInitials={getInitials}
                    formatTime={formatTime}
                    formatMoney={formatMoney}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Ticket Digital */}
        <ModalTicketDigital
          isOpen={isTicketModalOpen}
          onOpenChange={setIsTicketModalOpen}
          order={selectedTicketOrder}
        />
      </DialogContent>
    </Dialog>
  );
}
