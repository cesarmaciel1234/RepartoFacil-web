"use client";

import React from "react";
import type { OrderData } from "../../motor/tipos";
import { buildWhatsAppLink } from "../../motor/pedidoService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle } from "lucide-react";

interface ModalPedidoConfirmadoProps {
  orderConfirmed: OrderData | null;
  onCloseConfirmed: () => void;
  whatsappTargetPhone: string;
  formatMoney: (value: number) => string;
}

export function ModalPedidoConfirmado({
  orderConfirmed,
  onCloseConfirmed,
  whatsappTargetPhone,
  formatMoney,
}: ModalPedidoConfirmadoProps) {
  return (
    <Dialog
      open={!!orderConfirmed}
      onOpenChange={(open) => !open && onCloseConfirmed()}
    >
      <DialogContent className="w-[94vw] max-w-sm max-w-full overflow-x-hidden overflow-y-auto box-border space-y-4 rounded-3xl border-slate-200 bg-white p-6 text-center text-slate-900 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="space-y-1">
          <DialogTitle className="text-xl font-black text-slate-900">
            ¡Pedido Confirmado!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Tu compra ya fue ingresada al radar del comercio y repartidores.
          </DialogDescription>
        </div>

        {orderConfirmed && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-xs min-w-0 max-w-full box-border">
            <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-200 pb-2 min-w-0">
              <span className="font-bold text-slate-500 min-w-0">
                Código de Pedido:
              </span>
              <span className="font-mono text-sm font-black text-blue-700 min-w-0">
                #{orderConfirmed.id}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-1 min-w-0">
              <span className="text-slate-500 min-w-0">Total Final:</span>
              <span className="font-bold text-slate-900 min-w-0">
                {formatMoney(orderConfirmed.total)}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-1 min-w-0">
              <span className="text-slate-500 min-w-0">Entrega:</span>
              <span className="max-w-[170px] truncate font-bold text-slate-900 min-w-0">
                {orderConfirmed.deliveryAddress}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-1 min-w-0">
              <span className="text-slate-500 min-w-0">Pago:</span>
              <span className="text-[11px] font-bold uppercase text-blue-700 min-w-0">
                {{
                  cash: "Efectivo",
                  transfer: "Transferencia",
                  card: "Tarjeta",
                  web: "Pago web",
                }[orderConfirmed.paymentMethod]}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          {orderConfirmed && (
            <a
              href={buildWhatsAppLink(orderConfirmed, whatsappTargetPhone)}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-extrabold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Avisar al Comercio por WhatsApp</span>
            </a>
          )}

          <Button
            variant="outline"
            onClick={onCloseConfirmed}
            className="h-10 w-full rounded-2xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cerrar y seguir navegando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
