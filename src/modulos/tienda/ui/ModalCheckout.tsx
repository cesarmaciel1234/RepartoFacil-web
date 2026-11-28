"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { CheckoutFormData, OrderData } from "../motor/tipos";
import { loadSavedCustomer } from "../motor/pedidoService";
import { loadClientProfile } from "@/modulos/repartidor/motor/driverService";
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
import { normalizeWhatsAppPhone, parseAddressParts } from "../motor/checkoutUtils";

export const REQUIRE_VERIFIED_GPS = false;
export { normalizeWhatsAppPhone };

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
  const defaultBranchName = companyName || "Frigorífico Maciel · Alfaro 1964";
  const whatsappTargetPhone =
    normalizeWhatsAppPhone(sucursalPhone || companyPhone) || "5491135627803";
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");
  const initializedForOpen = useRef(false);
  const checkoutClientId = useRef<string | null>(null);
  const [missingName, setMissingName] = useState(true);
  const [missingPhone, setMissingPhone] = useState(true);
  const [formError, setFormError] = useState("");
  const [addressUnit, setAddressUnit] = useState("");
  const [streetInput, setStreetInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [citySuffix, setCitySuffix] = useState("");

  const [form, setForm] = useState<CheckoutFormData>({
    customerName: "",
    customerPhone: "",
    deliveryType: "delivery",
    deliveryAddress: "",
    selectedBranch: defaultBranchName,
    paymentMethod: "efectivo",
    orderNotes: "",
  });

  const updateCombinedAddress = (
    street: string,
    num: string,
    unit: string,
    city: string
  ) => {
    let streetTrimmed = street.trim();
    let numTrimmed = num.trim();

    if (numTrimmed && streetTrimmed.endsWith(` ${numTrimmed}`)) {
      streetTrimmed = streetTrimmed.slice(0, -numTrimmed.length - 1).trim();
    } else if (!numTrimmed && /\s+\d+[\w-]*$/.test(streetTrimmed)) {
      const match = streetTrimmed.match(/^(.*?)\s+(\d+[\w-]*)$/);
      if (match) {
        streetTrimmed = match[1].trim();
        numTrimmed = match[2].trim();
      }
    }

    const streetWithNum = numTrimmed ? `${streetTrimmed} ${numTrimmed}` : streetTrimmed;
    const combined = [streetWithNum, unit.trim(), city.trim()].filter(Boolean).join(", ");
    setForm((p) => ({ ...p, deliveryAddress: combined }));
  };

  useEffect(() => {
    if (!isOpen) {
      initializedForOpen.current = false;
      return;
    }
    if (initializedForOpen.current) return;
    initializedForOpen.current = true;

    checkoutClientId.current = loadClientProfile()?.id || null;
    const saved = loadSavedCustomer();
    const customerName = saved.customerName?.trim() || "";
    const customerPhone = saved.customerPhone?.trim() || "";
    setMissingName(!customerName);
    setMissingPhone(!customerPhone);
    setFormError("");

    const initialAddr =
      profileAddress || selectedDeliveryAddress || saved.deliveryAddress || "";
    const parsed = parseAddressParts(initialAddr);
    setStreetInput(initialAddr);
    setNumberInput(parsed.number);
    setCitySuffix(parsed.city);
    if (parsed.unit) setAddressUnit(parsed.unit);

    setForm((prev) => ({
      ...prev,
      customerName,
      customerPhone,
      deliveryAddress: initialAddr,
      deliveryType: saved.deliveryType || "delivery",
      selectedBranch: defaultBranchName,
    }));
  }, [isOpen, profileAddress, selectedDeliveryAddress, defaultBranchName]);

  useEffect(() => {
    if (selectedDeliveryAddress) {
      const parsed = parseAddressParts(selectedDeliveryAddress);
      if (parsed.street) setStreetInput(parsed.street);
      if (parsed.number) setNumberInput(parsed.number);
      if (parsed.city) setCitySuffix(parsed.city);
      if (parsed.unit && !addressUnit) setAddressUnit(parsed.unit);
      setForm((prev) => ({ ...prev, deliveryAddress: selectedDeliveryAddress }));
    }
  }, [selectedDeliveryAddress]);

  const tarifa = useMemo(
    () => calcularTarifaEnvio(deliveryCoordinates || form.deliveryAddress || ""),
    [deliveryCoordinates, form.deliveryAddress]
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
    if (checkoutClientId.current && loadClientProfile()?.id !== checkoutClientId.current) {
      setFormError("La sesión cambió. Cerrá el formulario y volvé a abrirlo.");
      return;
    }
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      setFormError("Completá tus datos de contacto.");
      return;
    }
    if (form.deliveryType === "delivery") {
      if (!streetInput.trim()) {
        setFormError("Por favor ingresá la calle de tu domicilio.");
        return;
      }
      if (!numberInput.trim() && !deliveryCoordinates) {
        setFormError("Por favor ingresá el número de tu casa (altura) o marcá el punto en el mapa para que el repartidor llegue a tu puerta.");
        return;
      }
      if (REQUIRE_VERIFIED_GPS && !deliveryCoordinates) {
        setFormError("Para envío a domicilio es obligatorio seleccionar tu ubicación en el mapa dentro de 1 km.");
        onOpenAddressPicker?.();
        return;
      }
    }
    setFormError("");

    let streetTrimmed = streetInput.trim();
    let numTrimmed = numberInput.trim();
    if (numTrimmed && streetTrimmed.endsWith(` ${numTrimmed}`)) {
      streetTrimmed = streetTrimmed.slice(0, -numTrimmed.length).trim();
    } else if (/\s+\d+[\w-]*$/.test(streetTrimmed)) {
      const match = streetTrimmed.match(/^(.*?)\s+(\d+[\w-]*)$/);
      if (match) {
        streetTrimmed = match[1].trim();
        numTrimmed = match[2].trim();
      }
    }
    const streetWithNum = numTrimmed ? `${streetTrimmed} ${numTrimmed}` : streetTrimmed;
    const finalAddress = [streetWithNum, addressUnit.trim(), citySuffix.trim()]
      .filter(Boolean)
      .join(", ");

    await onConfirmOrder(
      {
        ...form,
        deliveryAddress: finalAddress,
        deliveryStreet: streetInput.trim(),
        deliveryNumber: numberInput.trim(),
        deliveryFloor: addressUnit.trim(),
        deliveryCoordinates: deliveryCoordinates || null,
      },
      checkoutClientId.current
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[94vw] max-w-sm max-w-full max-h-[90vh] overflow-x-hidden overflow-y-auto box-border rounded-3xl border-slate-200 bg-white p-4 pt-5 text-slate-900 shadow-xl">
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

          {!checkoutClientId.current && (
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
