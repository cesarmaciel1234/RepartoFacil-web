"use client";

import React, { useState, useEffect } from "react";
import { CheckoutFormData, OrderData } from "../motor/tipos";
import { buildWhatsAppLink, loadSavedCustomer } from "../motor/pedidoService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, MapPin, Phone, User, Clock, Store, ShieldCheck, ArrowRight } from "lucide-react";

interface ModalCheckoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartTotal: number;
  isSubmitting: boolean;
  onConfirmOrder: (formData: CheckoutFormData) => void;
  orderConfirmed: OrderData | null;
  onCloseConfirmed: () => void;
}

export function ModalCheckout({
  isOpen,
  onOpenChange,
  cartTotal,
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
    selectedBranch: "Sucursal Central - Maciel",
    paymentMethod: "efectivo",
    orderNotes: "",
  });

  // Cargar datos previos si existen
  useEffect(() => {
    const saved = loadSavedCustomer();
    if (saved) {
      setForm((prev) => ({
        ...prev,
        customerName: saved.customerName || prev.customerName,
        customerPhone: saved.customerPhone || prev.customerPhone,
        deliveryAddress: saved.deliveryAddress || prev.deliveryAddress,
        deliveryType: saved.deliveryType || prev.deliveryType,
        selectedBranch: saved.selectedBranch || prev.selectedBranch,
      }));
    }
  }, []);

  const deliveryFee = form.deliveryType === "delivery" && cartTotal > 0 ? (cartTotal > 30000 ? 0 : 1500) : 0;
  const finalTotal = cartTotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmOrder(form);
  };

  return (
    <>
      {/* ─── Diálogo Formulario Checkout ─── */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 w-[94vw] max-w-sm p-4 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left pb-2 border-b border-slate-800 pr-8">
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                🥩
              </span>
              Finalizar Pedido
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              Completá tus datos de contacto para coordinar la entrega con la carnicería.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                    {cartTotal >= 30000 ? "Gratis" : "$1.500"}
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
            <div className="space-y-3">
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
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Dirección de Entrega y Altura *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Calle, número, timbre o depto"
                      value={form.deliveryAddress}
                      onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs pl-8 h-10"
                      required
                    />
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
                    <option value="Sucursal Central - Maciel">Sucursal Central - Maciel</option>
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
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "efectivo", label: "Efectivo", sub: "al recibir" },
                  { id: "transferencia", label: "Transferencia", sub: "Mercado Pago" },
                  { id: "tarjeta", label: "Tarjeta", sub: "Débito / Crédito" },
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
                    <div className="leading-tight">{m.label}</div>
                    <div className="text-[9px] font-normal opacity-70 mt-0.5">{m.sub}</div>
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
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs min-h-[60px]"
              />
            </div>

            {/* Total y Botón Confirmar */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Total a abonar:</span>
                <span className="text-base text-emerald-400 font-black">{formatMoney(finalTotal)}</span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
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
            <Check className="w-8 h-8" />
          </div>

          <div>
            <span className="bg-emerald-500/15 text-emerald-400 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
              Pedido #{orderConfirmed?.id}
            </span>
            <h3 className="text-lg font-black text-white mt-2">¡Pedido Confirmado!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Tu orden ya está registrada en el sistema de la central y asignada para preparación.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-left space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Cliente:</span>
              <span className="text-white font-bold">{orderConfirmed?.customerName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Destino:</span>
              <span className="text-white font-bold truncate max-w-[160px]">
                {orderConfirmed?.deliveryAddress}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total a pagar:</span>
              <span className="text-emerald-400 font-black">
                {orderConfirmed ? formatMoney(orderConfirmed.total) : ""}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {orderConfirmed && (
              <a
                href={buildWhatsAppLink(orderConfirmed)}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
              >
                <span>Enviar Comprobante por WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            <Button
              variant="outline"
              onClick={onCloseConfirmed}
              className="w-full h-10 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
            >
              Cerrar y seguir comprando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
