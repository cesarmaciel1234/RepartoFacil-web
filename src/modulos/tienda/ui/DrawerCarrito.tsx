"use client";

import React, { useEffect, useState } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { CartItem } from "../motor/tipos";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  Bike,
  Clock3,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { calcularTarifaEnvio, haversineKm } from "../motor/tarifaUberService";
import {
  COMPANY_COORDINATES_UPDATED_EVENT,
  isCompanyCoordinates,
  normalizeCompanyAddress,
  readCompanyCoordinatesCache,
} from "../motor/ubicacionComercio";
import { isProductPurchasable } from "../motor/productoDisponibilidad";
import { DrawerCarritoItem } from "./carrito/DrawerCarritoItem";
import { DrawerCarritoCompanyCard } from "./carrito/DrawerCarritoCompanyCard";
import { DrawerCarritoFooter } from "./carrito/DrawerCarritoFooter";

const FREE_DELIVERY_THRESHOLD = 35000;

export interface CompanyCartSummary {
  companyId: string;
  companyName: string;
  company?: CompanyStore;
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface DrawerCarritoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companyCarts: CompanyCartSummary[];
  activeCompanyCartId: string | null;
  inventoryReady: boolean;
  deliveryType: "delivery" | "pickup";
  deliveryAddress: string;
  deliveryCoordinates: { lat: number; lng: number } | null;
  onSelectCompanyCart: (companyId: string | null) => void;
  onUpdateQuantity: (productId: string, delta: number, companyId: string) => void;
  onRemoveItem: (productId: string, companyId: string) => void;
  onClearCompanyCart: (companyId: string) => void;
  onRemoveCompanyCart: (companyId: string) => void;
  onProceedToPayment: (companyId: string) => void;
  onContinueShopping: (companyId: string) => void;
}

export function DrawerCarrito({
  isOpen,
  onOpenChange,
  companyCarts,
  activeCompanyCartId,
  inventoryReady,
  deliveryType,
  deliveryAddress,
  deliveryCoordinates,
  onSelectCompanyCart,
  onUpdateQuantity,
  onClearCompanyCart,
  onRemoveCompanyCart,
  onProceedToPayment,
  onContinueShopping,
}: DrawerCarritoProps) {
  const [companyDistances, setCompanyDistances] = useState<Record<string, number | null>>({});
  const formatMoney = (value: number) => "$" + value.toLocaleString("es-AR");

  const activeCart = companyCarts.find(
    (companyCart) => companyCart.companyId === activeCompanyCartId
  );
  const activeItems = activeCart?.items || [];
  const unavailableItem = activeItems.find(
    (item) =>
      !isProductPurchasable(item.product) ||
      item.quantity > item.product.stockKg
  );
  const hasUnavailableItems = !inventoryReady || Boolean(unavailableItem);
  const activeTotal = inventoryReady ? activeCart?.total || 0 : 0;
  const freeDeliveryThreshold =
    activeCart?.company?.freeDeliveryThreshold || FREE_DELIVERY_THRESHOLD;
  const calculatedDeliveryFee = calcularTarifaEnvio(deliveryAddress || "").totalDeliveryFee;
  const deliveryFee =
    deliveryType === "delivery" && activeTotal > 0
      ? activeTotal >= freeDeliveryThreshold
        ? 0
        : activeCart?.company?.deliveryFee ?? calculatedDeliveryFee
      : 0;
  const finalTotal = activeTotal + deliveryFee;

  useEffect(() => {
    if (!deliveryCoordinates) {
      setCompanyDistances({});
      return;
    }

    const updateCompanyDistances = () => {
      const cache = readCompanyCoordinatesCache();
      const distances: Record<string, number | null> = {};

      for (const companyCart of companyCarts) {
        const company = companyCart.company;
        const addressKey = normalizeCompanyAddress(company?.address || "");
        const coordinates = isCompanyCoordinates(company?.coordinates)
          ? company.coordinates
          : cache[addressKey];
        distances[companyCart.companyId] = coordinates
          ? haversineKm(
              deliveryCoordinates.lat,
              deliveryCoordinates.lng,
              coordinates.lat,
              coordinates.lng
            )
          : null;
      }

      setCompanyDistances(distances);
    };

    updateCompanyDistances();
    if (!isOpen) return;

    window.addEventListener(COMPANY_COORDINATES_UPDATED_EVENT, updateCompanyDistances);
    return () =>
      window.removeEventListener(COMPANY_COORDINATES_UPDATED_EVENT, updateCompanyDistances);
  }, [companyCarts, deliveryCoordinates?.lat, deliveryCoordinates?.lng, isOpen]);

  const distanceLabel = (companyId: string) => {
    if (!deliveryCoordinates) return "Elegí tu ubicación";
    const distance = companyDistances[companyId];
    if (distance !== null && distance !== undefined) return `~${distance.toFixed(1)} km`;
    return "A calcular";
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full max-w-[100vw] flex-col overflow-x-hidden border-l border-slate-200 bg-white p-0 text-slate-900 sm:max-w-md">
        <SheetHeader
          style={{
            paddingTop: "max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))",
          }}
          className="flex flex-row items-center justify-between border-b border-slate-100 bg-white p-4"
        >
          <div className="flex min-w-0 items-center gap-2">
            {activeCart && (
              <button
                type="button"
                onClick={() => onSelectCompanyCart(null)}
                aria-label="Volver a tus carritos"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate text-base font-black text-slate-900">
                {activeCart ? "Tu carrito" : "Tus carritos"}
              </SheetTitle>
              <SheetDescription className="text-[11px] font-medium text-slate-500">
                {activeCart
                  ? activeCart.companyName
                  : `${companyCarts.length} ${
                      companyCarts.length === 1 ? "comercio" : "comercios"
                    } con productos`}
              </SheetDescription>
            </div>
          </div>
          {activeCart && (
            <button
              type="button"
              onClick={() => onClearCompanyCart(activeCart.companyId)}
              className="shrink-0 text-[11px] font-bold text-slate-500 transition-colors hover:text-red-600"
            >
              Vaciar
            </button>
          )}
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
          {!activeCart ? (
            companyCarts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-4 p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-blue-500">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Todavía no tenés carritos
                  </h4>
                  <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-500">
                    Explorá los comercios y agregá tus productos favoritos.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-10 rounded-xl border-blue-200 bg-white px-5 text-xs font-bold text-blue-700 hover:bg-blue-50"
                >
                  Explorar comercios
                </Button>
              </div>
            ) : (
              companyCarts.map((companyCart) => (
                <DrawerCarritoCompanyCard
                  key={companyCart.companyId}
                  companyCart={companyCart}
                  distanceLabel={distanceLabel(companyCart.companyId)}
                  onSelectCompanyCart={onSelectCompanyCart}
                  onRemoveCompanyCart={onRemoveCompanyCart}
                  formatMoney={formatMoney}
                />
              ))
            )
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  {activeCart.company?.logoUrl ? (
                    <img
                      src={activeCart.company.logoUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-2xl bg-slate-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">
                      {activeCart.companyName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {activeCart.companyName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      {activeCart.company && (
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                          {activeCart.company.deliveryTimeMin}-
                          {activeCart.company.deliveryTimeMax} min
                        </span>
                      )}
                      <span
                        className="flex items-center gap-1"
                        title="Distancia aproximada desde tu ubicación"
                      >
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        {distanceLabel(activeCart.companyId)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="h-3.5 w-3.5 text-slate-400" />
                        {deliveryFee === 0 ? "Envío gratis" : formatMoney(deliveryFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {activeItems.map((item) => (
                <DrawerCarritoItem
                  key={`${activeCart.companyId}:${item.product.id}`}
                  item={item}
                  companyId={activeCart.companyId}
                  inventoryReady={inventoryReady}
                  onUpdateQuantity={onUpdateQuantity}
                  formatMoney={formatMoney}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => onContinueShopping(activeCart.companyId)}
                className="w-full rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                Seguir comprando en {activeCart.companyName}
              </Button>
            </>
          )}
        </div>

        {activeCart && activeItems.length > 0 && (
          <DrawerCarritoFooter
            deliveryType={deliveryType}
            activeTotal={activeTotal}
            deliveryFee={deliveryFee}
            finalTotal={finalTotal}
            freeDeliveryThreshold={freeDeliveryThreshold}
            hasUnavailableItems={hasUnavailableItems}
            unavailableItem={unavailableItem}
            inventoryReady={inventoryReady}
            companyId={activeCart.companyId}
            onProceedToPayment={(cId) => {
              onOpenChange(false);
              onProceedToPayment(cId);
            }}
            formatMoney={formatMoney}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
