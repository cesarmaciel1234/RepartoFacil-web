"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { ModalCambiarDireccion } from "./ui/ModalCambiarDireccion";
import { ModalClientAuth } from "./ui/ModalClientAuth";
import { CentroPedidosClienteSheet } from "./ui/CentroPedidosClienteSheet";
import { OrderChatSheet } from "../repartidor/ui/OrderChatSheet";
import { SidebarGeneral } from "@/components/SidebarGeneral";
import { ModalMercados } from "@/components/ModalMercados";
import { loadClientProfile, getOrCreateActiveClientIdentity } from "../repartidor/motor/driverService";
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

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  // Al arrancar, no hay empresa "clavada": arranca en la vista de empresas / mercados
  const [selectedCompany, setSelectedCompany] = useState<CompanyStore | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClientAuthOpen, setIsClientAuthOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOrdersHubOpen, setIsOrdersHubOpen] = useState(false);
  const [isOrderChatOpen, setIsOrderChatOpen] = useState(false);
  const [selectedChatOrder, setSelectedChatOrder] = useState<any>(null);
  const [clientOrdersList, setClientOrdersList] = useState<any[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("Tucumán 2130, Rosario");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderData | null>(null);

  // Sincronizar lista de órdenes del comprador (locales + PostgreSQL con aislamiento estricto por clientId)
  useEffect(() => {
    const syncOrders = async () => {
      const { clientId: activeClientId } = getOrCreateActiveClientIdentity();
      let combined: any[] = [];
      try {
        const raw = localStorage.getItem("rf_orders_history");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            combined = parsed.filter((o) => o.clientId === activeClientId);
          }
        }
      } catch {}

      try {
        const url = `/api/orders?cliente_id=${encodeURIComponent(activeClientId)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const cloudOrders = await res.json();
          if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
            const map = new Map<string, any>();
            cloudOrders.forEach((o) => map.set(o.id, o));
            combined.forEach((o) => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            combined = Array.from(map.values());
          }
        }
      } catch {}

      setClientOrdersList(combined);
      if (combined.length === 0) {
        setSelectedChatOrder(null);
      } else if (!selectedChatOrder || !combined.some((o) => o.id === selectedChatOrder.id)) {
        setSelectedChatOrder(combined[0]);
      }
    };

    syncOrders();
    const interval = setInterval(syncOrders, 4000);
    window.addEventListener("rf-orders-updated", syncOrders);
    window.addEventListener("repartofacil-client-auth", syncOrders);
    window.addEventListener("repartofacil-auth", syncOrders);
    window.addEventListener("storage", syncOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener("rf-orders-updated", syncOrders);
      window.removeEventListener("repartofacil-client-auth", syncOrders);
      window.removeEventListener("repartofacil-auth", syncOrders);
      window.removeEventListener("storage", syncOrders);
    };
  }, [selectedChatOrder, orderConfirmed]);

  const activeOrdersCount = useMemo(() => {
    return clientOrdersList.filter(
      (o) => o.status !== "Delivered" && o.status !== "Cancelled"
    ).length;
  }, [clientOrdersList]);

  // Sincronizar catálogo real directamente desde la base de datos de Cobro Fácil (pos_base)
  useEffect(() => {
    fetch("/api/cobrofacil/products", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          // Mantener solo productos mock de empresas que NO sean Maciel ni Empresa Prueba (ej. kiosco-al-toque)
          const otherProducts = INITIAL_PRODUCTS.filter(
            (p) =>
              p.companyId &&
              p.companyId !== "frigorifico-maciel" &&
              p.companyId !== "empresa-prueba"
          );
          const map = new Map<string, any>();
          data.products.forEach((p: any) => map.set(p.id, p));
          otherProducts.forEach((p: any) => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          setProducts(Array.from(map.values()));
        }
      })
      .catch((err) => console.warn("Error cargando productos de Cobro Fácil:", err));
  }, []);

  // Cargar y sincronizar dirección de entrega del cliente
  useEffect(() => {
    const client = loadClientProfile();
    const savedAddr = localStorage.getItem("repartofacil_delivery_address");
    if (client?.address) {
      setDeliveryAddress(client.address);
    } else if (savedAddr) {
      setDeliveryAddress(savedAddr);
    }

    const syncAuth = () => {
      const c = loadClientProfile();
      if (c?.address) setDeliveryAddress(c.address);
    };
    window.addEventListener("repartofacil-auth", syncAuth);
    return () => window.removeEventListener("repartofacil-auth", syncAuth);
  }, []);

  const handleAddressChange = (newAddr: string) => {
    setDeliveryAddress(newAddr);
    localStorage.setItem("repartofacil_delivery_address", newAddr);
  };

  // Catálogo activo de la empresa seleccionada desde su inventario de base de datos
  const activeCompanyCatalog = useMemo(() => {
    if (!selectedCompany) return [];
    const sId = (selectedCompany.id || "").toLowerCase();
    const sSlug = (selectedCompany.slug || "").toLowerCase();

    const companyProducts = products.filter((p) => {
      const pComp = (p.companyId || "").toLowerCase();
      if (sId === "frigorifico-maciel" || sSlug === "maciel") {
        return pComp === "frigorifico-maciel" || pComp === "maciel";
      }
      if (sId === "empresa-prueba" || sSlug === "prueba") {
        return pComp === "empresa-prueba" || pComp === "prueba";
      }
      return pComp === sId || (sSlug && pComp === sSlug);
    });

    return companyProducts.length > 0
      ? companyProducts
      : products
          .filter((p) => p.companyId === "frigorifico-maciel")
          .slice(0, 16)
          .map((p) => ({
            ...p,
            id: `${selectedCompany.id}-${p.id}`,
            companyId: selectedCompany.id,
            companyName: selectedCompany.name,
          }));
  }, [products, selectedCompany]);

  // Departamentos reales del inventario de la empresa seleccionada (para los filtros por departamento)
  const companyDepartments = useMemo(() => {
    if (!selectedCompany) return [];
    const counts = new Map<string, number>();
    activeCompanyCatalog.forEach((p: any) => {
      const dep = String(p.department || p.categoryName || p.category || "GENERAL")
        .trim()
        .toUpperCase();
      counts.set(dep, (counts.get(dep) || 0) + 1);
    });

    const getDeptIcon = (d: string) => {
      if (d.includes("CARNE") || d.includes("VACUN")) return "🥩";
      if (d.includes("AVE") || d.includes("POLLO")) return "🍗";
      if (d.includes("CERDO")) return "🥓";
      if (d.includes("ACHURA")) return "🔥";
      if (d.includes("EMBUTID") || d.includes("FIAMBR")) return "🌭";
      if (d.includes("PREPARAD") || d.includes("MILANES")) return "🍲";
      if (d.includes("HUEVO")) return "🥚";
      if (d.includes("ALMACEN") || d.includes("CONDIMENT")) return "🛒";
      if (d.includes("VERDU")) return "🥬";
      if (d.includes("CONGELAD")) return "❄️";
      if (d.includes("GRASA")) return "🧈";
      if (d.includes("BEBIDA") || d.includes("KIOSCO")) return "🥤";
      return "📦";
    };

    const deptList = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([dep, count]) => ({
        id: dep.toLowerCase(),
        name: `${dep} (${count})`,
        icon: getDeptIcon(dep),
      }));

    return [
      { id: "todos", name: `Todos (${activeCompanyCatalog.length})`, icon: "🔥" },
      ...deptList,
    ];
  }, [selectedCompany, activeCompanyCatalog]);

  // Filtrado reactivo de productos por departamento del inventario y búsqueda
  const filteredProducts = useMemo(() => {
    if (!selectedCompany) return [];
    const q = searchQuery.toLowerCase().trim();
    const selCat = selectedCategory.toLowerCase();

    return activeCompanyCatalog.filter((p: any) => {
      const pDep = String(p.department || p.categoryName || p.category || "GENERAL")
        .trim()
        .toLowerCase();

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        pDep.includes(q);

      const matchesCat =
        selCat === "todos" ||
        pDep === selCat ||
        (p.category || "").toLowerCase() === selCat;

      return matchesSearch && matchesCat;
    });
  }, [activeCompanyCatalog, selectedCategory, searchQuery, selectedCompany]);

  // Manejo de checkout: libre navegación en tienda, solo se pide login al pagar (y luego no vuelve a pedir)
  const handleProceedToPayment = () => {
    setIsCartOpen(false);
    const client = loadClientProfile();
    if (!client) {
      setIsClientAuthOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (formData: CheckoutFormData) => {
    setIsSubmittingOrder(true);
    try {
      if (selectedCompany) {
        formData.companyId = selectedCompany.id;
        formData.companySlug = selectedCompany.slug || selectedCompany.id.replace(/^empresa-/, "");
        formData.empresaId =
          selectedCompany.empresa_id ||
          (selectedCompany.slug === "prueba" || selectedCompany.id === "empresa-prueba"
            ? 2
            : selectedCompany.slug === "maciel" || selectedCompany.id === "frigorifico-maciel"
            ? 1
            : undefined);
        formData.selectedBranch = selectedCompany.name;
      }
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans pb-36">
      {/* ─── Encabezado Superior (con selector de dirección editable y de empresa) ─── */}
      <HeaderTienda
        cartItemsCount={cartItemsCount}
        cartTotal={cartTotal}
        deliveryType="delivery"
        deliveryAddress={deliveryAddress}
        selectedCompanyName={selectedCompany ? selectedCompany.name : null}
        onBackToMarkets={() => {
          setSelectedCompany(null);
          setSearchQuery("");
        }}
        onChangeAddress={() => setIsAddressModalOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMarkets={() => setIsMarketsOpen(true)}
        onSwitchToDriver={onSwitchToDriver}
        onOpenOrderChat={() => setIsOrdersHubOpen(true)}
        activeOrdersCount={activeOrdersCount}
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

            {/* Filtros por Departamentos reales del Inventario y Buscador interno */}
            <FiltroCategorias
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              categories={companyDepartments}
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
        <div
          style={{
            bottom: "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))",
          }}
          className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-30"
        >
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
        defaultDeliveryAddress={deliveryAddress}
        onConfirmOrder={handleConfirmOrder}
        orderConfirmed={orderConfirmed}
        onCloseConfirmed={() => setOrderConfirmed(null)}
      />

      {/* ─── Modal para Editar / Cambiar Dirección de Entrega ─── */}
      <ModalCambiarDireccion
        isOpen={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        currentAddress={deliveryAddress}
        onSelectAddress={handleAddressChange}
      />

      {/* ─── Modal de Autenticación de Cliente (Solo requerido al pagar si no está logueado) ─── */}
      <ModalClientAuth
        isOpen={isClientAuthOpen}
        onOpenChange={setIsClientAuthOpen}
        onSuccess={() => {
          setIsClientAuthOpen(false);
          const client = loadClientProfile();
          if (client?.address) {
            setDeliveryAddress(client.address);
          }
          if (cart.length > 0) {
            setIsCheckoutOpen(true);
          }
        }}
      />

      {/* ─── Centro de Pedidos en Curso (Hub Multitienda con el camioncito) ─── */}
      <CentroPedidosClienteSheet
        isOpen={isOrdersHubOpen}
        onOpenChange={setIsOrdersHubOpen}
        orders={clientOrdersList}
        onSelectOrderChat={(order) => {
          setSelectedChatOrder(order);
          setIsOrdersHubOpen(false);
          setIsOrderChatOpen(true);
        }}
        onOrderFromAnother={() => {
          setSelectedCompany(null);
          setIsMarketsOpen(true);
        }}
      />

      {/* ─── Chat Tripartito Privado del Pedido Seleccionado ─── */}
      <OrderChatSheet
        isOpen={isOrderChatOpen}
        onOpenChange={setIsOrderChatOpen}
        activeOrder={selectedChatOrder || clientOrdersList[0] || null}
        viewerRole="client"
        deliveryAddress={deliveryAddress}
        onBackToOrdersHub={() => {
          setIsOrderChatOpen(false);
          setIsOrdersHubOpen(true);
        }}
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
