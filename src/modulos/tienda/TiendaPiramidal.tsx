"use client";

import React, { useEffect, useState } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import { useCart } from "./motor/useCart";
import { createOrder } from "./motor/pedidoService";
import type { CheckoutFormData, DeliveryCoordinates, OrderData } from "./motor/tipos";
import { useCatalogoTienda } from "./catalogo/hooks/useCatalogoTienda";
import { usePedidosCliente } from "./pedidos/hooks/usePedidosCliente";
import { CatalogoEmpresaTienda } from "./catalogo/pantallas/CatalogoEmpresaTienda";
import { HeaderTienda } from "./ui/HeaderTienda";
import { DrawerCarrito } from "./ui/DrawerCarrito";
import { ModalCheckout } from "./ui/ModalCheckout";
import { ModalCambiarDireccion } from "./ui/ModalCambiarDireccion";
import { ModalClientAuth } from "./ui/ModalClientAuth";
import { CentroPedidosClienteSheet } from "./ui/CentroPedidosClienteSheet";
import { OrderChatSheet } from "../repartidor/ui/OrderChatSheet";
import { InicioTienda } from "./pantallas/InicioTienda";
import { SupermercadosTienda } from "./pantallas/SupermercadosTienda";
import { PromocionesTienda } from "./pantallas/PromocionesTienda";
import { HistorialPedidosTienda } from "./pantallas/HistorialPedidosTienda";
import { PerfilCliente } from "./pantallas/PerfilCliente";
import { NavegacionTienda, type SeccionTienda } from "./ui/NavegacionTienda";
import {
  clearClientProfile,
  loadClientProfile,
  type ClientProfile,
} from "../repartidor/motor/driverService";
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

  // Al arrancar, no hay empresa "clavada": arranca en la vista de empresas / mercados
  const [selectedCompany, setSelectedCompany] = useState<CompanyStore | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [activeBottomTab, setActiveBottomTab] = useState<SeccionTienda>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClientAuthOpen, setIsClientAuthOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOrdersHubOpen, setIsOrdersHubOpen] = useState(false);
  const [isOrderChatOpen, setIsOrderChatOpen] = useState(false);
  const [selectedChatOrder, setSelectedChatOrder] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("Tucumán 2130, Rosario");
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<DeliveryCoordinates | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<OrderData | null>(null);
  const {
    products,
    companies,
    selectedCompanyDistanceKm,
    isCompanyDistanceLoading,
    companyDepartments,
    filteredProducts,
  } = useCatalogoTienda({
    selectedCompany,
    selectedCategory,
    searchQuery,
    deliveryCoordinates,
  });
  const { clientOrdersList, activeOrdersCount } = usePedidosCliente({
    selectedChatOrder,
    setSelectedChatOrder,
    orderConfirmed,
  });

  // Cargar y sincronizar dirección de entrega del cliente
  useEffect(() => {
    const client = loadClientProfile();
    setClientProfile(client);
    const savedAddr = localStorage.getItem("repartofacil_delivery_address");
    const activeAddress = client?.address || savedAddr || "Tucumán 2130, Rosario";
    let savedCoordinates: DeliveryCoordinates | null = null;
    try {
      const rawCoordinates = localStorage.getItem("repartofacil_delivery_coordinates");
      if (rawCoordinates) {
        const parsed = JSON.parse(rawCoordinates);
        if (
          typeof parsed.address === "string" &&
          Number.isFinite(parsed.lat) &&
          Number.isFinite(parsed.lng)
        ) {
          savedCoordinates = parsed;
        }
      }
    } catch (error) {
      console.warn("No se pudieron cargar las coordenadas de entrega:", error);
    }

    setDeliveryAddress(activeAddress);
    setDeliveryCoordinates(savedCoordinates?.address === activeAddress ? savedCoordinates : null);
    if (client?.address) {
      setDeliveryAddress(client.address);
    }

    const syncAuth = () => {
      const c = loadClientProfile();
      setClientProfile(c);
      if (c?.address) {
        setDeliveryAddress(c.address);
        setDeliveryCoordinates((current) => current?.address === c.address ? current : null);
      }
    };
    window.addEventListener("repartofacil-auth", syncAuth);
    window.addEventListener("repartofacil-client-auth", syncAuth);
    return () => {
      window.removeEventListener("repartofacil-auth", syncAuth);
      window.removeEventListener("repartofacil-client-auth", syncAuth);
    };
  }, []);

  const handleAddressChange = (
    newAddr: string,
    coordinates: { lat: number; lng: number }
  ) => {
    const location = { address: newAddr, ...coordinates };
    setDeliveryAddress(newAddr);
    setDeliveryCoordinates(location);
    localStorage.setItem("repartofacil_delivery_address", newAddr);
    localStorage.setItem("repartofacil_delivery_coordinates", JSON.stringify(location));
  };

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
  const browseProps = {
    companies,
    products,
    onSelectCompany: (company: CompanyStore, initialSearch?: string) => {
      setSelectedCompany(company);
      if (initialSearch) setSearchQuery(initialSearch);
    },
    searchQuery,
    onSearchChange: setSearchQuery,
    deliveryAddress,
    deliveryCoordinates,
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col font-sans pb-32">
      {/* ─── Encabezado Superior (Blanco y Azul con el camioncito y el carrito arriba) ─── */}
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
        onOpenCart={() => setIsCartOpen(true)}
        onSwitchToDriver={onSwitchToDriver}
        onOpenOrderChat={() => setIsOrdersHubOpen(true)}
        activeOrdersCount={activeOrdersCount}
      />

      {/* ─── Contenido Principal ─── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {activeBottomTab === "profile" ? (
          <PerfilCliente
            clientProfile={clientProfile}
            deliveryAddress={deliveryAddress}
            onLogin={() => setIsClientAuthOpen(true)}
            onLogout={() => {
              clearClientProfile();
              setClientProfile(null);
            }}
            onEditAddress={() => setIsAddressModalOpen(true)}
            onSwitchToDriver={onSwitchToDriver}
          />
        ) : activeBottomTab === "orders" ? (
          <HistorialPedidosTienda
            orders={clientOrdersList}
            onGoToHome={() => setActiveBottomTab("home")}
            onSelectOrderChat={(order) => {
              setSelectedChatOrder(order);
              setIsOrderChatOpen(true);
            }}
          />
        ) : !selectedCompany ? (
          activeBottomTab === "markets" ? (
            <SupermercadosTienda {...browseProps} />
          ) : activeBottomTab === "promotions" ? (
            <PromocionesTienda {...browseProps} />
          ) : (
            <InicioTienda {...browseProps} />
          )
        ) : (
          <CatalogoEmpresaTienda
            company={selectedCompany}
            deliveryCoordinates={deliveryCoordinates}
            distanceKm={selectedCompanyDistanceKm}
            isDistanceLoading={isCompanyDistanceLoading}
            categories={companyDepartments}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            products={filteredProducts}
            cart={cart}
            onSearchChange={setSearchQuery}
            onCategorySelect={setSelectedCategory}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            onBackToStores={() => {
              setSelectedCompany(null);
              setSearchQuery("");
            }}
            onOpenAddress={() => setIsAddressModalOpen(true)}
          />
        )}
      </main>

      {/* ─── Barra Inferior Flotante Móvil (Acceso Rápido al Carrito) ─── */}
      {cartItemsCount > 0 && (
        <div
          style={{
            bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
          }}
          className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-30"
        >
          <Button
            onClick={() => setIsCartOpen(true)}
            className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xl shadow-blue-600/30 border border-blue-500 flex items-center justify-between px-4 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black leading-tight">
                  {cartItemsCount} {cartItemsCount === 1 ? "ítem" : "ítems"}
                </div>
                <div className="text-[10px] text-blue-100 font-medium">Ver pedido</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight">{formatMoney(cartTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Button>
        </div>
      )}

      <NavegacionTienda
        activeSection={activeBottomTab}
        onChangeSection={(section) => {
          setActiveBottomTab(section);
          setSelectedCompany(null);
          setSearchQuery("");
        }}
      />

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
    </div>
  );
}
