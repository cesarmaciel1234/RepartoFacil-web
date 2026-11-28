"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { CheckoutFormData, OrderData } from "./tipos";
import { loadSavedCustomer } from "./pedidoService";
import { loadClientProfile } from "@/modulos/repartidor/motor/driverService";
import { calcularTarifaEnvio } from "./tarifaUberService";
import { parseAddressParts } from "./checkoutUtils";

export const REQUIRE_VERIFIED_GPS = false;

interface UseModalCheckoutStateParams {
  isOpen: boolean;
  cartTotal: number;
  companyName?: string;
  companyDeliveryFee?: number;
  freeDeliveryThreshold?: number;
  profileAddress?: string;
  selectedDeliveryAddress?: string;
  deliveryCoordinates?: { lat: number; lng: number } | null;
  onOpenAddressPicker?: () => void;
  onConfirmOrder: (formData: CheckoutFormData, clientId: string | null) => Promise<void>;
}

export function useModalCheckoutState({
  isOpen,
  cartTotal,
  companyName,
  companyDeliveryFee,
  freeDeliveryThreshold = 35000,
  profileAddress,
  selectedDeliveryAddress,
  deliveryCoordinates,
  onOpenAddressPicker,
  onConfirmOrder,
}: UseModalCheckoutStateParams) {
  const defaultBranchName = companyName || "Frigorífico Maciel · Alfaro 1964";
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
  }, [selectedDeliveryAddress, addressUnit]);

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
        setFormError(
          "Por favor ingresá el número de tu casa (altura) o marcá el punto en el mapa para que el repartidor llegue a tu puerta."
        );
        return;
      }
      if (REQUIRE_VERIFIED_GPS && !deliveryCoordinates) {
        setFormError(
          "Para envío a domicilio es obligatorio seleccionar tu ubicación en el mapa dentro de 1 km."
        );
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

  return {
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
    checkoutClientId: checkoutClientId.current,
    defaultBranchName,
  };
}
