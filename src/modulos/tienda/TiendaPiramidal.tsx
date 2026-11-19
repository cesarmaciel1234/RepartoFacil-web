"use client";

import React, { useState, useMemo } from "react";
import { INITIAL_PRODUCTS, Product } from "@/data/mockProducts";
import { useCart } from "./motor/useCart";
import { createOrder } from "./motor/pedidoService";
import { CheckoutFormData, OrderData } from "./motor/tipos";
import { HeaderTienda } from "./ui/HeaderTienda";
import { FiltroCategorias } from "./ui/FiltroCategorias";
import { TarjetaProducto } from "./ui/TarjetaProducto";
import { DrawerCarrito } from "./ui/DrawerCarrito";
import { ModalCheckout } from "./ui/ModalCheckout";
import { useFirestore } from "@/firebase";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TiendaPiramidalProps {
  onSwitchToDriver: () => void;
}

export function TiendaPiramidal({ onSwitchToDriver }: TiendaPiramidalProps) {
  const firestore = useFirestore();
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemsCount,
  } = useCart();

  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderData | null>(null);

  // Filtrado reactivo de productos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === "todos" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Manejo de checkout
  const handleProceedToPayment = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (formData: CheckoutFormData) => {
    setIsSubmittingOrder(true);
    try {
      const newOrder = await createOrder(cart, formData, firestore);
      setIsCheckoutOpen(false);
      setOrderConfirmed(newOrder);
      clearCart();
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-28">
      {/* ─── Encabezado Superior ─── */}
      <HeaderTienda
        cartItemsCount={cartItemsCount}
        cartTotal={cartTotal}
        deliveryType="delivery"
        deliveryAddress=""
        onOpenCart={() => setIsCartOpen(true)}
        onSwitchToDriver={onSwitchToDriver}
      />

      {/* ─── Contenido Principal ─── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 space-y-5">
        {/* Filtros y Buscador */}
        <FiltroCategorias
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Grilla de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;
            return (
              <TarjetaProducto
                key={product.id}
                product={product}
                quantityInCart={inCart}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
              />
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="text-base font-bold text-slate-300">No encontramos productos con esa búsqueda</p>
            <p className="text-xs text-slate-500">Probá con otro término o seleccioná otra categoría.</p>
          </div>
        )}
      </main>

      {/* ─── Barra Inferior Flotante Móvil (Acceso Rápido al Carrito) ─── */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-30">
          <Button
            onClick={() => setIsCartOpen(true)}
            className="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-2xl shadow-emerald-500/40 border border-emerald-400/40 flex items-center justify-between px-4 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black leading-tight">
                  {cartItemsCount} {cartItemsCount === 1 ? "ítem" : "ítems"}
                </div>
                <div className="text-[10px] text-emerald-100 font-medium">Ver pedido</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight">{formatMoney(cartTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Button>
        </div>
      )}

      {/* ─── Drawer Carrito ─── */}
      <DrawerCarrito
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        cartTotal={cartTotal}
        deliveryType="delivery"
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* ─── Modal Checkout ─── */}
      <ModalCheckout
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartTotal={cartTotal}
        isSubmitting={isSubmittingOrder}
        onConfirmOrder={handleConfirmOrder}
        orderConfirmed={orderConfirmed}
        onCloseConfirmed={() => setOrderConfirmed(null)}
      />
    </div>
  );
}
export default TiendaPiramidal;
