"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, MessageSquare, ExternalLink } from "lucide-react";

export interface CentroPedidoDetalleViewProps {
  selectedOrder: any;
  selectedOrderStoreName: string;
  selectedOrderIsPickup: boolean;
  selectedOrderIsAssigned: boolean;
  selectedOrderDriverName: string;
  selectedOrderItems: any[];
  selectedOrderHasTicket: boolean;
  retryingId: string | null;
  orderToCancel: any | null;
  formatTime: (iso?: string) => string;
  formatMoney: (val: number) => string;
  onOpenTicket: (order: any) => void;
  onOpenChat: () => void;
  onSetOrderToCancel: (order: any | null) => void;
  onCancelByClient: (orderId: string) => void;
}

export function CentroPedidoDetalleView({
  selectedOrder,
  selectedOrderStoreName,
  selectedOrderIsPickup,
  selectedOrderIsAssigned,
  selectedOrderDriverName,
  selectedOrderItems,
  selectedOrderHasTicket,
  retryingId,
  orderToCancel,
  formatTime,
  formatMoney,
  onOpenTicket,
  onOpenChat,
  onSetOrderToCancel,
  onCancelByClient,
}: CentroPedidoDetalleViewProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900">
              {selectedOrderStoreName}
            </p>
            <p className="text-[11px] text-slate-500">
              {formatTime(selectedOrder.createdAt)}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="min-w-0 font-medium text-slate-900">
              <span className="mr-1 font-semibold text-slate-500">
                {selectedOrderIsPickup ? "Retiro:" : "Entrega:"}
              </span>
              {selectedOrderIsPickup
                ? (selectedOrder.branch || selectedOrder.sucursal_origen || "Local del comercio")
                : (selectedOrder.deliveryAddress || "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui")}
            </p>
          </div>

          {selectedOrderItems.length > 0 && !selectedOrderHasTicket && (
            <div className="space-y-2 border-t border-slate-200 pt-2">
              <p className="font-semibold text-slate-500">Productos</p>
              {selectedOrderItems.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 text-slate-700"
                >
                  <span className="min-w-0 truncate">
                    {item.name || item.nombre} × {item.quantity || item.cantidad || 1}{" "}
                    {item.unit || item.unidad || "un"}
                  </span>
                  <span className="shrink-0 font-mono text-slate-500">
                    {formatMoney(
                      (item.price || item.precio || 0) *
                        (item.quantity || item.cantidad || 1)
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-500">Envío</span>
            <span className="font-mono font-semibold text-slate-700">
              {formatMoney(selectedOrder.deliveryFee)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {selectedOrderIsPickup ? "Modalidad" : "Repartidor"}
            </span>
            <span className="font-semibold text-slate-900">
              {selectedOrderIsPickup
                ? "🏪 Retiro en mostrador"
                : selectedOrderIsAssigned
                  ? selectedOrderDriverName
                  : "Buscando chofer..."}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-500">Total</span>
            <span className="font-mono font-extrabold text-emerald-700">
              {formatMoney(selectedOrder.total)}
            </span>
          </div>
        </div>

        {selectedOrderHasTicket && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenTicket(selectedOrder)}
            className="h-9 w-full rounded-xl border-blue-100 bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            Ver ticket #{selectedOrder.ticketId || selectedOrder.ticket_id}
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onOpenChat}
          aria-label="Abrir chat"
          className="h-10 flex-1 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat
        </Button>
        <Button
          type="button"
          disabled={retryingId === String(selectedOrder.id)}
          onClick={() => onSetOrderToCancel(selectedOrder)}
          className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 hover:bg-red-100"
        >
          Cancelar
        </Button>
      </div>

      {orderToCancel?.id === selectedOrder.id && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2"
        >
          <p className="text-xs font-semibold text-slate-700">
            ¿Deseás cancelar?
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onSetOrderToCancel(null)}
              className="h-8 rounded-lg px-2.5 text-xs text-slate-600"
            >
              Volver
            </Button>
            <Button
              type="button"
              disabled={retryingId === String(orderToCancel.id)}
              onClick={() => onCancelByClient(String(orderToCancel.id))}
              className="h-8 rounded-lg bg-red-600 px-2.5 text-xs font-bold text-white hover:bg-red-700"
            >
              {retryingId === String(orderToCancel.id) ? "Cancelando..." : "Sí, cancelar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
