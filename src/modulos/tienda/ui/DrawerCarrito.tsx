"use client";

import React from "react";
import { CartItem } from "../motor/tipos";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from "lucide-react";

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

  const deliveryFee = deliveryType === "delivery" && cartTotal > 0 ? (cartTotal > 30000 ? 0 : 1500) : 0;
  const finalTotal = cartTotal + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-[100vw] sm:max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full overflow-x-hidden">
        {/* Header Drawer */}
        <SheetHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-black text-white">Tu Carrito</SheetTitle>
              <p className="text-[11px] text-slate-400 font-medium">
                {cart.length} {cart.length === 1 ? "producto" : "productos"} seleccionados
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors"
            >
              Vaciar
            </button>
          )}
        </SheetHeader>

        {/* Lista de Ítems */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Tu carrito está vacío</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Explorá nuestros cortes seleccionados y armá tu pedido para la parrilla o la semana.
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-2.5 flex items-center gap-3"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-white truncate">{item.product.name}</h4>
                  <p className="text-[11px] text-emerald-400 font-extrabold mt-0.5">
                    {formatMoney(item.product.price)}
                    <span className="text-[10px] text-slate-400 font-normal"> /{item.product.unit}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Subtotal: {formatMoney(item.product.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-5 text-center font-black text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer y Totales */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
            {/* Banner Envío Gratis */}
            {deliveryType === "delivery" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center gap-2 text-xs">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-300 font-medium leading-tight">
                  {cartTotal >= 30000
                    ? "¡Envío GRATIS aplicado a tu pedido!"
                    : `Sumá ${formatMoney(30000 - cartTotal)} más para tener envío gratis.`}
                </span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal productos</span>
                <span className="font-bold text-slate-200">{formatMoney(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Envío</span>
                <span className="font-bold text-slate-200">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Gratis</span>
                  ) : (
                    formatMoney(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Final</span>
                <span className="text-base text-emerald-400 font-black">{formatMoney(finalTotal)}</span>
              </div>
            </div>

            {/* Botón Pagar */}
            <Button
              onClick={onProceedToPayment}
              className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Continuar y Pagar</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Compra directa con Frigorífico Maciel · Pago seguro
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
