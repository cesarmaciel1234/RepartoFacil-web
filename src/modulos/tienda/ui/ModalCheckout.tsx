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
  isSubmitting: boolean;
  defaultDeliveryAddress?: string;
  onConfirmOrder: (formData: CheckoutFormData) => Promise<void>;
  orderConfirmed: OrderData | null;
  onCloseConfirmed: () => void;
}

export function ModalCheckout({
  isOpen,
  onOpenChange,
  cartTotal,
  isSubmitting,
  defaultDeliveryAddress,
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
        deliveryAddress: saved.deliveryAddress || defaultDeliveryAddress || prev.deliveryAddress,
        deliveryType: saved.deliveryType || prev.deliveryType,
        selectedBranch: saved.selectedBranch || prev.selectedBranch,
      }));
    }
  }, [defaultDeliveryAddress, isOpen]);

  // Cálculo de tarifa estándar Uber / PedidosYa
  const tarifa = useMemo(
    () => calcularTarifaEnvio(form.deliveryAddress || ""),
    [form.deliveryAddress]
  );

  const deliveryFee =
    form.deliveryType === "delivery" && cartTotal > 0
      ? cartTotal >= 35000
        ? 0
        : tarifa.totalDeliveryFee
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 w-[94vw] max-w-sm p-4 pt-5 rounded-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b border-slate-800 pr-8">
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                🥩
              </span>
              Finalizar Pedido
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              Completá tus datos para coordinar la entrega directa de la carnicería.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            {/* Tipo de Entrega */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Modalidad de Entrega
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, deliveryType: "delivery" }))}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    form.deliveryType === "delivery"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Envío a Domicilio</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {cartTotal >= 35000 ? "Gratis" : formatMoney(tarifa.totalDeliveryFee)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, deliveryType: "pickup" }))}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    form.deliveryType === "pickup"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Retiro en Local</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Sin costo</span>
                </button>
              </div>
            </div>

            {/* Datos Personales */}
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nombre y Apellido *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Ej. Juan Pérez"
                    value={form.customerName}
                    onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs pl-8 h-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  WhatsApp / Celular de Contacto *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Ej. 11 5566-7788"
                    value={form.customerPhone}
                    onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs pl-8 h-10"
                    required
                  />
                </div>
              </div>

              {form.deliveryType === "delivery" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block mb-0.5">
                    Dirección de Entrega y Altura *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Ej. San Lorenzo 2040, Rosario"
                      value={form.deliveryAddress}
                      onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs pl-8 h-10"
                      required
                    />
                  </div>

                  {/* Tarifa dinámica estándar Uber / PedidosYa */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 font-bold text-[10px]">
                        <Zap className="w-3 h-3 text-amber-400 fill-current" />
                        {tarifa.isPeakHour ? "Horario Pico (1.35x demanda)" : "Horario Normal"}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {tarifa.distanceKm} km desde Market
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Envío:</span>
                      <span className="text-emerald-400 font-black">
                        {deliveryFee === 0 ? "GRATIS" : formatMoney(deliveryFee)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Seleccioná Sucursal de Retiro
                  </label>
                  <select
                    value={form.selectedBranch}
                    onChange={(e) => setForm((p) => ({ ...p, selectedBranch: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl text-xs px-3 h-10 focus:outline-none focus:border-emerald-500"
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
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Medio de Pago
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "efectivo", label: "Efectivo", sub: "al recibir" },
                  { id: "transferencia", label: "Transf.", sub: "Mercado Pago" },
                  { id: "tarjeta", label: "Tarjeta", sub: "Déb./Créd." },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, paymentMethod: m.id as any }))}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      form.paymentMethod === m.id
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
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
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Notas / Aclaraciones (opcional)
              </label>
              <Textarea
                placeholder="Ej. Cortes envasados por separado, o tocar timbre 4B..."
                value={form.orderNotes}
                onChange={(e) => setForm((p) => ({ ...p, orderNotes: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs min-h-[50px]"
              />
            </div>

            {/* Total y Botón Confirmar */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Total a abonar:</span>
                <span className="text-base text-emerald-400 font-black">{formatMoney(finalTotal)}</span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm p-6 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-xl font-black text-white">
              ¡Pedido Confirmado!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Tu compra ya fue ingresada al radar del comercio y repartidores.
            </DialogDescription>
          </div>

          {orderConfirmed && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="font-bold text-slate-400">Código de Pedido:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  #{orderConfirmed.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Final:</span>
                <span className="font-bold text-white">{formatMoney(orderConfirmed.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entrega:</span>
                <span className="font-bold text-white truncate max-w-[170px]">
                  {orderConfirmed.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pago:</span>
                <span className="font-bold text-emerald-300 uppercase text-[11px]">
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
                className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Avisar al Comercio por WhatsApp</span>
              </a>
            )}

            <Button
              variant="outline"
              onClick={onCloseConfirmed}
              className="w-full h-10 rounded-2xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
            >
              Cerrar y seguir navegando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
