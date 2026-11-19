"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Product } from "@/data/mockProducts";
import { CartItem } from "./tipos";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rf_cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Carga inicial segura desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {
      console.warn("No se pudo cargar el carrito local:", e);
    }
  }, []);

  // Persistencia automática ante cambios
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("No se pudo guardar el carrito local:", e);
    }
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });

    toast({
      title: "Agregado al carrito",
      description: `${product.name} fue añadido.`,
      duration: 1500,
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQ = item.quantity + delta;
            return nextQ > 0 ? { ...item, quantity: nextQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemsCount,
  };
}
