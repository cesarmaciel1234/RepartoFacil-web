"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CheckoutFormData, OrderData } from "../motor/tipos";
import { loadSavedCustomer, buildWhatsAppLink } from "../motor/pedidoService";
import { calcularTarifaEnvio } from "../motor/tarifaUberService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Store,
  CreditCard,
  Banknote,
  Send,
  Check,
  User,
  Phone,
  MessageCircle,
  Copy,
  Zap,
} from "lucide-react";

interface ModalCheckoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartTotal: number;
  companyName?: string;
  companyDeliveryFee?: number;
  freeDeliveryThreshold?: number;
  profileAddress?: string;
  selectedDeliveryAddress?: string;
  isSubmitting: boolean;
  onConfirmOrder: (formData: CheckoutFormData) => Promise<void>;
  orderConfirmed: OrderData | null;
  onCloseConfirmed: () => void;
}

export function ModalCheckout({
  isOpen,
  onOpenChange,
  cartTotal,
  companyName,
  companyDeliveryFee,
  freeDeliveryThreshold = 35000,
  profileAddress,
  selectedDeliveryAddress,
  isSubmitting,
  onConfirmOrder,
  orderConfirmed,
  onCloseConfirmed,
}: ModalCheckoutProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  const [form, setForm] = useState<CheckoutFormData>({
    customerName: "",
    customerPhone: "",
    deliveryType: "delivery",
    deliveryAddress: "",
    selectedBranch: "Sucursal Central - Tucumán 2130",
    paymentMethod: "efectivo",
    orderNotes: "",
  });

  // Cargar datos previos si existen
  useEffect(() => {
    if (!isOpen) return;

    const saved = loadSavedCustomer();
    if (saved) {
      setForm((prev) => ({
        ...prev,
        customerName: saved.customerName || prev.customerName,
        customerPhone: saved.customerPhone || prev.customerPhone,
        deliveryAddress:
          profileAddress ||
          selectedDeliveryAddress ||
          saved.deliveryAddress ||
          prev.deliveryAddress,
        deliveryType: saved.deliveryType || prev.deliveryType,
        selectedBranch: saved.selectedBranch || prev.selectedBranch,
      }));
    }
  }, [isOpen, profileAddress, selectedDeliveryAddress]);

  // Cálculo de tarifa estándar Uber / PedidosYa
  const tarifa = useMemo(
    () => calcularTarifaEnvio(form.deliveryAddress || ""),
    [form.deliveryAddress]
  );

  const deliveryFee =
    form.deliveryType === "delivery" && cartTotal > 0
      ? cartTotal >= freeDeliveryThreshold
        ? 0
        : companyDeliveryFee ?? tarifa.totalDeliveryFee
      : 0;

  const finalTotal = cartTotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmOrder(form);
  };

  return (
    <>
      {/* ─── Diálogo Formulario Checkout ─── */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[94vw] max-w-sm max-h-[88vh] overflow-y-auto rounded-3xl border-slate-200 bg-white p-4 pt-5 text-slate-900 shadow-xl">
          <DialogHeader className="border-b border-slate-100 pb-2 pr-8 text-left">
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Store className="h-4 w-4" />
              </span>
              {companyName ? `Pagar en ${companyName}` : "Finalizar Pedido"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-slate-500">
              Revisá el método de pago y los datos de entrega de tu pedido.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            {/* Tipo de Entrega */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Modalidad de Entrega
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, deliveryType: "delivery" }))}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    form.deliveryType === "delivery"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Envío a Domicilio</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {cartTotal >= freeDeliveryThreshold
                      ? "Gratis"
                      : formatMoney(companyDeliveryFee ?? tarifa.totalDeliveryFee)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, deliveryType: "pickup" }))}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    form.deliveryType === "pickup"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Retiro en Local</span>
                  <span className="text-[10px] font-semibold text-blue-600">Sin costo</span>
                </button>
              </div>
            </div>

            {/* Datos Personales */}
            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Nombre y Apellido *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Ej. Juan Pérez"
                    value={form.customerName}
                    onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-white pl-8 text-xs text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  WhatsApp / Celular de Contacto *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Ej. 11 5566-7788"
                    value={form.customerPhone}
                    onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                    className="h-10 rounded-xl border-slate-200 bg-white pl-8 text-xs text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {form.deliveryType === "delivery" ? (
                <div className="space-y-1.5">
                  <label className="mb-0.5 block text-xs font-bold text-slate-700">
                    Dirección de Entrega y Altura *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Ej. San Lorenzo 2040, Rosario"
                      value={form.deliveryAddress}
                      onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
                      className="h-10 rounded-xl border-slate-200 bg-white pl-8 text-xs text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* Tarifa dinámica estándar Uber / PedidosYa */}
                  <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1 text-[10px] font-bold">
                        <Zap className="h-3 w-3 fill-current text-amber-500" />
                        {tarifa.isPeakHour ? "Horario Pico (1.35x demanda)" : "Horario Normal"}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {tarifa.distanceKm} km desde Market
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Envío:</span>
                      <span className="font-black text-blue-700">
                        {deliveryFee === 0 ? "GRATIS" : formatMoney(deliveryFee)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Seleccioná Sucursal de Retiro
                  </label>
                  <select
                    value={form.selectedBranch}
                    onChange={(e) => setForm((p) => ({ ...p, selectedBranch: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Sucursal Central - Tucumán 2130">Sucursal Central - Tucumán 2130</option>
                    <option value="Sucursal Frigorífico Norte">Sucursal Frigorífico Norte</option>
                    <option value="Sucursal Express Centro">Sucursal Express Centro</option>
                  </select>
                </div>
              )}
            </div>

            {/* Medio de Pago */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Medio de Pago
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "efectivo", label: "Efectivo", sub: "al recibir" },
                  { id: "transferencia", label: "Transferencia", sub: "Mercado Pago" },
                  { id: "tarjeta", label: "Tarjeta", sub: "Débito / crédito" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        paymentMethod: m.id as CheckoutFormData["paymentMethod"],
                      }))
                    }
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      form.paymentMethod === m.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="leading-tight truncate">{m.label}</div>
                    <div className="text-[9px] font-normal opacity-70 mt-0.5 truncate">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Notas / Aclaraciones (opcional)
              </label>
              <Textarea
                placeholder="Ej. Cortes envasados por separado, o tocar timbre 4B..."
                value={form.orderNotes}
                onChange={(e) => setForm((p) => ({ ...p, orderNotes: e.target.value }))}
                className="min-h-[50px] rounded-xl border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Total y Botón Confirmar */}
            <div className="space-y-2.5 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Total a abonar:</span>
                <span className="text-base font-black text-blue-700">{formatMoney(finalTotal)}</span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-98"
              >
                {isSubmitting ? (
                  <span>Procesando pedido...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirmar y Enviar Pedido</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Diálogo de Pedido Confirmado ─── */}
      <Dialog open={!!orderConfirmed} onOpenChange={(open) => !open && onCloseConfirmed()}>
        <DialogContent className="max-w-sm space-y-4 rounded-3xl border-slate-200 bg-white p-6 text-center text-slate-900 shadow-xl">
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
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">Código de Pedido:</span>
                <span className="font-mono text-sm font-black text-blue-700">
                  #{orderConfirmed.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Final:</span>
                <span className="font-bold text-slate-900">{formatMoney(orderConfirmed.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entrega:</span>
                <span className="max-w-[170px] truncate font-bold text-slate-900">
                  {orderConfirmed.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pago:</span>
                <span className="text-[11px] font-bold uppercase text-blue-700">
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
                href={buildWhatsAppLink(orderConfirmed)}
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
    </>
  );
}
