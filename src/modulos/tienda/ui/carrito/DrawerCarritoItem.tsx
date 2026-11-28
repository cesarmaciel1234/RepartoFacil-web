"use client";

import React from "react";
import type { CartItem } from "../../motor/tipos";
import { ImagenProducto } from "../ImagenProducto";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  hasValidPrice,
  isProductPurchasable,
  productAvailabilityMessage,
} from "../../motor/productoDisponibilidad";

interface DrawerCarritoItemProps {
  item: CartItem;
  companyId: string;
  inventoryReady: boolean;
  onUpdateQuantity: (productId: string, delta: number, companyId: string) => void;
  formatMoney: (value: number) => string;
}

export function DrawerCarritoItem({
  item,
  companyId,
  inventoryReady,
  onUpdateQuantity,
  formatMoney,
}: DrawerCarritoItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <ImagenProducto
        src={item.product.image}
        alt={item.product.name}
        className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-slate-900">{item.product.name}</h4>
        {inventoryReady &&
        item.product.priceSource === "tpv" &&
        hasValidPrice(item.product) ? (
          <>
            <p className="mt-0.5 text-xs font-extrabold text-slate-900">
              {formatMoney(item.product.price * item.quantity)}
            </p>
            <p className="text-[10px] text-slate-500">
              {formatMoney(item.product.price)}
              {item.product.unit ? ` / ${item.product.unit}` : ""}
            </p>
          </>
        ) : (
          <p className="mt-0.5 text-xs font-bold text-amber-800">
            Precio pendiente
          </p>
        )}
        {(!inventoryReady ||
          !isProductPurchasable(item.product) ||
          item.quantity > item.product.stockKg) && (
          <p className="mt-1 text-[10px] font-semibold text-amber-800">
            {!inventoryReady
              ? "Inventario pendiente de validar."
              : productAvailabilityMessage(item.product) ||
                "La cantidad supera el stock vigente."}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center rounded-full bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.product.id, -1, companyId)}
          aria-label={`Quitar una unidad de ${item.product.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-700"
        >
          {item.quantity === 1 ? (
            <Trash2 className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </button>
        <span className="w-6 text-center text-xs font-black text-slate-900">
          {item.quantity}
        </span>
        <button
          type="button"
          disabled={
            !inventoryReady ||
            !isProductPurchasable(item.product) ||
            item.quantity >= item.product.stockKg
          }
          onClick={() => onUpdateQuantity(item.product.id, 1, companyId)}
          aria-label={`Agregar una unidad de ${item.product.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-900 disabled:text-slate-300"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
