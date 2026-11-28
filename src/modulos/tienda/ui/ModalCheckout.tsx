"use client";

import React from "react";
import { CheckoutFormData, OrderData } from "../motor/tipos";
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
import {
  Store,
  Check,
  User,
  Phone,
  Zap,
} from "lucide-react";
import { ModalPedidoConfirmado } from "./checkout/ModalPedidoConfirmado";
import { CheckoutDeliveryTypeSelector } from "./checkout/CheckoutDeliveryTypeSelector";
import { CheckoutAddressSection } from "./checkout/CheckoutAddressSection";
import { CheckoutPaymentSelector } from "./checkout/CheckoutPaymentSelector";
import { normalizeWhatsAppPhone } from "../motor/checkoutUtils";
import { useModalCheckoutState, REQUIRE_VERIFIED_GPS } from "../motor/useModalCheckoutState";

export { REQUIRE_VERIFIED_GPS, normalizeWhatsAppPhone };

interface ModalCheckoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartTotal: number;
  companyName?: string;
  companyDeliveryFee?: number;
  freeDeliveryThreshold?: number;
  profileAddress?: string;
  selectedDeliveryAddress?: string;
  deliveryCoordinates?: { lat: number; lng: number } | null;
  onOpenAddressPicker?: () => void;
  isSubmitting: boolean;
  onConfirmOrder: (formData: CheckoutFormData, clientId: string | null) => Promise<void>;
  orderConfirmed: OrderData | null;
  onCloseConfirmed: () => void;
  sucursalPhone?: string;
  companyPhone?: string;
  onOpenLogin?: () => void;
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
  deliveryCoordinates,
  onOpenAddressPicker,
  isSubmitting,
  onConfirmOrder,
  orderConfirmed,
  onCloseConfirmed,
  sucursalPhone,
  companyPhone,
  onOpenLogin,
}: ModalCheckoutProps) {
  const whatsappTargetPhone =
    normalizeWhatsAppPhone(sucursalPhone || companyPhone) || "5491135627803";
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  const {
    form,
    setForm,
    missingName,
    missingPhone,
    formError,
    addressUnit,
    setAddressUnit,
    streetInput,
    setStreetInput,
    numberInput,
    setNumberInput,
    citySuffix,
    updateCombinedAddress,
    tarifa,
    deliveryFee,
    finalTotal,
    handleSubmit,
    checkoutClientId,
    defaultBranchName,
  } = useModalCheckoutState({
    isOpen,
    cartTotal,
    companyName,
    companyDeliveryFee,
    freeDeliveryThreshold,
    profileAddress,
    selectedDeliveryAddress,
    deliveryCoordinates,
    onOpenAddressPicker,
    onConfirmOrder,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          overlayClassName="z-[70]"
          className="z-[70] w-[94vw] max-w-sm max-w-full max-h-[90vh] overflow-x-hidden overflow-y-auto box-border rounded-3xl border-slate-200 bg-white p-4 pt-5 text-slate-900 shadow-xl"
        >
          <DialogHeader className="border-b border-slate-100 pb-2 pr-8 text-left min-w-0 max-w-full">
            <DialogTitle className="flex flex-wrap items-center gap-2 text-lg font-black text-slate-900 min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Store className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{companyName ? `Pagar en ${companyName}` : "Finalizar Pedido"}</span>
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-slate-500 min-w-0">
              Revisá el método de pago y los datos de entrega de tu pedido.
            </DialogDescription>
          </DialogHeader>

          {!checkoutClientId && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 px-3.5 py-2 text-xs text-blue-900 shadow-xs min-w-0 box-border">
              <span className="font-semibold flex items-center gap-1.5 min-w-0">
                <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Pedido rápido sin contraseña</span>
              </span>
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenLogin();
                  }}
                  className="font-black text-blue-700 hover:text-blue-900 underline cursor-pointer text-[11px] shrink-0"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 max-w-full box-border min-w-0">
            <CheckoutDeliveryTypeSelector
              deliveryType={form.deliveryType}
              onChangeDeliveryType={(type) => setForm((p) => ({ ...p, deliveryType: type }))}
              cartTotal={cartTotal}
              freeDeliveryThreshold={freeDeliveryThreshold}
              companyDeliveryFee={companyDeliveryFee}
              tarifaFee={tarifa.totalDeliveryFee}
              formatMoney={formatMoney}
            />

            <div className="space-y-2.5">
              {missingName && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nombre y Apellido *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      autoComplete="name"
                      placeholder="Ej. Juan Pérez"
                      value={form.customerName}
                      onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                      className="h-10 rounded-xl border-slate-200 bg-white pl-8 text-xs text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              )}

              {missingPhone && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    WhatsApp / Celular de Contacto *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="Ej. 11 5566-7788"
                      value={form.customerPhone}
                      onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                      className="h-10 rounded-xl border-slate-200 bg-white pl-8 text-xs text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              )}

              {form.deliveryType === "delivery" ? (
                <CheckoutAddressSection
                  streetInput={streetInput}
                  numberInput={numberInput}
                  addressUnit={addressUnit}
                  citySuffix={citySuffix}
                  deliveryCoordinates={deliveryCoordinates}
                  onOpenAddressPicker={onOpenAddressPicker}
                  onStreetChange={(val) => {
                    setStreetInput(val);
                    updateCombinedAddress(val, numberInput, addressUnit, citySuffix);
                  }}
                  onNumberChange={(val) => {
                    setNumberInput(val);
                    updateCombinedAddress(streetInput, val, addressUnit, citySuffix);
                  }}
                  onUnitChange={(val) => {
                    setAddressUnit(val);
                    updateCombinedAddress(streetInput, numberInput, val, citySuffix);
                  }}
                  tarifa={tarifa}
                  deliveryFee={deliveryFee}
                  formatMoney={formatMoney}
                />
              ) : (
                <div className="min-w-0 max-w-full">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Sucursal de Retiro
                  </label>
                  <select
                    value={form.selectedBranch}
                    onChange={(e) => setForm((p) => ({ ...p, selectedBranch: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none min-w-0"
                  >
                    <option value={defaultBranchName}>{defaultBranchName}</option>
                  </select>
                </div>
              )}
            </div>

            <CheckoutPaymentSelector
              paymentMethod={form.paymentMethod}
              onChangePaymentMethod={(method) => setForm((p) => ({ ...p, paymentMethod: method }))}
            />

            <div className="min-w-0 max-w-full">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Notas / Aclaraciones (opcional)
              </label>
              <Textarea
                placeholder="Ej. Cortes envasados por separado, o tocar timbre 4B..."
                value={form.orderNotes}
                onChange={(e) => setForm((p) => ({ ...p, orderNotes: e.target.value }))}
                className="min-h-[50px] rounded-xl border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 min-w-0"
              />
            </div>

            <div className="space-y-2.5 border-t border-slate-100 pt-2 min-w-0 max-w-full">
              {formError && (
                <p role="alert" className="text-xs font-medium text-red-600 min-w-0 break-words">
                  {formError}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold min-w-0">
                <span className="text-slate-500 min-w-0">Total a abonar:</span>
                <span className="text-base font-black text-blue-700 min-w-0">
                  {formatMoney(finalTotal)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-wrap min-w-0 max-w-full box-border h-auto min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-98"
              >
                {isSubmitting ? (
                  <span className="min-w-0 truncate">Procesando pedido...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="min-w-0 text-center">Confirmar y Enviar Pedido</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ModalPedidoConfirmado
        orderConfirmed={orderConfirmed}
        onCloseConfirmed={onCloseConfirmed}
        whatsappTargetPhone={whatsappTargetPhone}
        formatMoney={formatMoney}
      />
    </>
  );
}
