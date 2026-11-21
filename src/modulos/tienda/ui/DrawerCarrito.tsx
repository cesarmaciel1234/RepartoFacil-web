"use client";

import React from "react";
import type { CartItem } from "../motor/tipos";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from "lucide-react";

const FREE_DELIVERY_THRESHOLD = 35000;

interface DrawerCarritoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  cartTotal: number;
  deliveryType: "delivery" | "pickup";
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
}

export function DrawerCarrito({
  isOpen,
  onOpenChange,
  cart,
  cartTotal,
  deliveryType,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
}: DrawerCarritoProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");
  const itemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const deliveryFee =
    deliveryType === "delivery" && cartTotal > 0
      ? cartTotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : 2100
      : 0;
  const finalTotal = cartTotal + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full max-w-[100vw] flex-col overflow-x-hidden border-l border-slate-200 bg-white p-0 text-slate-900 sm:max-w-md">
        {/* Header Drawer */}
        <SheetHeader
          style={{
            paddingTop: "max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))",
          }}
          className="flex flex-row items-center justify-between border-b border-slate-100 bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-black text-slate-900">Tu pedido</SheetTitle>
              <p className="text-[11px] font-medium text-slate-500">
                {itemsCount} {itemsCount === 1 ? "producto" : "productos"} en tu carrito
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-[11px] font-bold text-slate-500 transition-colors hover:text-red-600"
            >
              Vaciar
            </button>
          )}
        </SheetHeader>

        {/* Lista de Ítems */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-blue-500">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Tu carrito está vacío</h4>
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
                Explorar productos
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-14 w-14 shrink-0 rounded-xl bg-slate-100 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-[9px] font-bold text-blue-600">
                    {item.product.companyName || "Frigorífico Maciel"}
                  </span>
                  <h4 className="truncate text-xs font-bold text-slate-900">{item.product.name}</h4>
                  <p className="mt-0.5 text-[11px] font-extrabold text-blue-700">
                    {formatMoney(item.product.price)}
                    <span className="text-[10px] font-normal text-slate-500">
                      {" "}
                      /{item.product.unit}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                    Subtotal: {formatMoney(item.product.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      aria-label={`Quitar una unidad de ${item.product.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      aria-label={`Agregar una unidad de ${item.product.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.product.id)}
                    aria-label={`Eliminar ${item.product.name} del carrito`}
                    className="p-1.5 text-slate-400 transition-colors hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer y Totales */}
        {cart.length > 0 && (
          <div
            style={{
              paddingBottom: "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))",
            }}
            className="space-y-3 border-t border-slate-200 bg-white p-4"
          >
            {/* Banner Envío Gratis */}
            {deliveryType === "delivery" && (
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-xs">
                <Truck className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="text-[11px] font-medium leading-tight text-blue-800">
                  {cartTotal >= FREE_DELIVERY_THRESHOLD
                    ? "¡Envío GRATIS aplicado a tu pedido!"
                    : `Sumá ${formatMoney(FREE_DELIVERY_THRESHOLD - cartTotal)} más para tener envío gratis.`}
                </span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal productos</span>
                <span className="font-bold text-slate-800">{formatMoney(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Envío</span>
                <span className="font-bold text-slate-800">
                  {deliveryFee === 0 ? (
                    <span className="text-[10px] font-extrabold uppercase text-blue-700">
                      Gratis
                    </span>
                  ) : (
                    formatMoney(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                <span>Total</span>
                <span className="text-base font-black text-blue-700">{formatMoney(finalTotal)}</span>
              </div>
            </div>

            {/* Botón Pagar */}
            <Button
              onClick={onProceedToPayment}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-98"
            >
              <span>Continuar y Pagar</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="flex items-center justify-center gap-1 text-center text-[10px] text-slate-500">
              <ShieldCheck className="h-3 w-3 text-blue-600" />
              Compra segura · Conectado con Cobro Fácil
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
