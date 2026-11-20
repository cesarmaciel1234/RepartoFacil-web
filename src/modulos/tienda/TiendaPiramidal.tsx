"use client";

import React, { useState, useMemo } from "react";
import { INITIAL_PRODUCTS, Product } from "@/data/mockProducts";
import { MOCK_COMPANIES, CompanyStore } from "@/data/mockCompanies";
import { useCart } from "./motor/useCart";
import { createOrder } from "./motor/pedidoService";
import { CheckoutFormData, OrderData } from "./motor/tipos";
import { HeaderTienda } from "./ui/HeaderTienda";
import { FiltroCategorias } from "./ui/FiltroCategorias";
import { TarjetaProducto } from "./ui/TarjetaProducto";
import { VistaMercadosEmpresas } from "./ui/VistaMercadosEmpresas";
import { DrawerCarrito } from "./ui/DrawerCarrito";
import { ModalCheckout } from "./ui/ModalCheckout";
import { SidebarGeneral } from "@/components/SidebarGeneral";
import { ModalMercados } from "@/components/ModalMercados";
import { useFirestore } from "@/firebase";
import { ShoppingBag, ArrowRight, ArrowLeft, Store, Star, Clock, Bike } from "lucide-react";
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
  // Al arrancar, no hay empresa "clavada": arranca en la vista de empresas / mercados
  const [selectedCompany, setSelectedCompany] = useState<CompanyStore | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderData | null>(null);

  // Filtrado reactivo de productos cuando se está dentro del catálogo de una empresa
  const filteredProducts = useMemo(() => {
    if (!selectedCompany) return [];
    const q = searchQuery.toLowerCase().trim();

    return products.filter((p) => {
      const matchesCompany =
        p.companyId === selectedCompany.id ||
        (!p.companyId && selectedCompany.id === "frigorifico-maciel");

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "todos" || p.category === selectedCategory;

      return matchesCompany && matchesSearch && matchesCat;
    });
  }, [products, selectedCategory, searchQuery, selectedCompany]);

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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans pb-36 overflow-y-auto">
      {/* ─── Encabezado Superior (con Sidebar DiDi reutilizado y selector de empresa) ─── */}
      <HeaderTienda
        cartItemsCount={cartItemsCount}
        cartTotal={cartTotal}
        deliveryType="delivery"
        deliveryAddress=""
        selectedCompanyName={selectedCompany ? selectedCompany.name : null}
        onBackToMarkets={() => {
          setSelectedCompany(null);
          setSearchQuery("");
        }}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMarkets={() => setIsMarketsOpen(true)}
        onSwitchToDriver={onSwitchToDriver}
      />

      {/* ─── Contenido Principal ─── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {!selectedCompany ? (
          /* ─── Vista 1: PÁGINA PRINCIPAL - EMPRESAS Y MERCADOS (Captura 2 y 3) ─── */
          <div className="space-y-4">
            <VistaMercadosEmpresas
              onSelectCompany={(comp, initialSearch) => {
                setSelectedCompany(comp);
                if (initialSearch) setSearchQuery(initialSearch);
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        ) : (
          /* ─── Vista 2: CATÁLOGO DE LA EMPRESA SELECCIONADA (Captura 4) ─── */
          <div className="space-y-4">
            {/* Barra superior de retorno a empresas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany(null);
                    setSearchQuery("");
                  }}
                  className="h-8 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 border border-slate-700/80"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Locales</span>
                </button>
                <div className="h-4 w-px bg-slate-700 hidden sm:block" />
                <span className="text-xs font-bold text-white truncate">
                  {selectedCompany.name}
                </span>
              </div>

              {/* Métricas de la empresa */}
              <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold pl-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {selectedCompany.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {selectedCompany.deliveryTimeMin}-{selectedCompany.deliveryTimeMax} min
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Bike className="w-3.5 h-3.5" />
                  ${selectedCompany.deliveryFee.toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            {/* Filtros de Categorías y Buscador interno */}
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
              <div className="text-center py-16 space-y-2 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-6">
                <p className="text-base font-bold text-slate-300">
                  No encontramos productos con &ldquo;{searchQuery}&rdquo; en {selectedCompany.name}
                </p>
                <p className="text-xs text-slate-500">
                  Probá con otro término o volvé a la lista de empresas para buscar en otros locales.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany(null);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs"
                >
                  Buscar en todos los comercios
                </button>
              </div>
            )}
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

      {/* ─── Drawer Lateral del Carrito ─── */}
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

      {/* ─── Modal de Checkout y Pago ─── */}
      <ModalCheckout
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartTotal={cartTotal}
        isSubmitting={isSubmittingOrder}
        onConfirmOrder={handleConfirmOrder}
        orderConfirmed={orderConfirmed}
        onCloseConfirmed={() => setOrderConfirmed(null)}
      />

      {/* ─── Sidebar Unificado DiDi / PedidosYa (Captura 1) ─── */}
      <SidebarGeneral
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        currentMode="store"
        onSwitchMode={(mode) => {
          if (mode === "driver") onSwitchToDriver();
        }}
        onOpenMarkets={() => setIsMarketsOpen(true)}
        onOpenOrders={() => setIsCartOpen(true)}
        onOpenWallet={() => onSwitchToDriver()}
      />

      {/* ─── Modal Mercados / Ecosistema Multitienda Cobro Fácil (Captura 4) ─── */}
      <ModalMercados
        isOpen={isMarketsOpen}
        onOpenChange={setIsMarketsOpen}
        selectedCompanyId={selectedCompany?.id || ""}
        onSelectCompany={(comp) => {
          setSelectedCompany(comp);
          setIsMarketsOpen(false);
        }}
      />
    </div>
  );
}
