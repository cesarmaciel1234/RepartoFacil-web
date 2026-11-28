"use client";

import React, { useEffect } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import { useCart } from "./motor/useCart";
import { useCatalogoTienda } from "./catalogo/hooks/useCatalogoTienda";
import { usePedidosCliente } from "./pedidos/hooks/usePedidosCliente";
import { AvisoCatalogo, formatSavedTime } from "./catalogo/AvisoCatalogo";
import { HeaderTienda } from "./ui/HeaderTienda";
import { useMensajesNoLeidos } from "./pedidos/hooks/useMensajesNoLeidos";
import { NavegacionTienda } from "./ui/NavegacionTienda";
import { TiendaPwaLayout } from "./ui/TiendaPwaLayout";
import { TiendaModalesContainer } from "./ui/TiendaModalesContainer";
import { BotonCarritoFlotante } from "./ui/BotonCarritoFlotante";
import { TiendaActiveTabContent } from "./ui/TiendaActiveTabContent";
import { useTiendaModales } from "./motor/useTiendaModales";
import { useTiendaAddress } from "./motor/useTiendaAddress";
import { useTiendaNavegacion } from "./motor/useTiendaNavegacion";
import { useTiendaOrderSubmission } from "./motor/useTiendaOrderSubmission";
import { useTiendaCatalogoState } from "./motor/useTiendaCatalogoState";
import {
  clearClientProfile,
  loadDriverProfile,
} from "../repartidor/motor/driverService";
import { WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TiendaPiramidalProps {
  onSwitchToDriver: () => void;
}

export function TiendaPiramidal({ onSwitchToDriver }: TiendaPiramidalProps) {
  const { toast } = useToast();
  const {
    cart,
    isLoaded: isCartLoaded,
    reconcileCatalogProducts,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCompanyCart,
    cartTotal,
  } = useCart();

  // Gestión modular de modales y sheets
  const modales = useTiendaModales();

  // Gestión modular de dirección y perfil de cliente
  const {
    clientProfile,
    setClientProfile,
    deliveryAddress,
    deliveryCoordinates,
    handleAddressChange,
    syncAddressFromSavedCoordinates,
  } = useTiendaAddress({
    onAddressUpdatedForCheckout: () => {
      if (modales.checkoutCompanyId) {
        modales.setIsCheckoutOpen(true);
      }
    },
  });

  // Catálogo reactivo
  const {
    products,
    companies,
    status: catalogStatus,
    productsStatus: catalogProductsStatus,
    productsWarnings,
    companiesCached,
    productsCached,
    companiesSavedAt,
    productsSavedAt,
    cacheError,
    reload: reloadCatalog,
    productCountByCompany,
  } = useCatalogoTienda();

  // Gestión modular de navegación y URLs
  const {
    selectedCompany,
    selectedCategory,
    setSelectedCategory,
    activeBottomTab,
    setActiveBottomTab,
    searchQuery,
    setSearchQuery,
    openCompany,
    closeCompany,
  } = useTiendaNavegacion({
    companies,
    catalogStatus,
  });

  // Lógica modular de catálogo, departamentos y carritos agrupados (Cerebro)
  const {
    companyDepartments,
    filteredProducts,
    companyCatalogSize,
    companyCarts,
    selectedCompanyCart,
    checkoutCart,
    checkoutCartTotal,
  } = useTiendaCatalogoState({
    products,
    companies,
    selectedCompany,
    selectedCategory,
    searchQuery,
    cart,
    catalogProductsStatus,
    checkoutCompanyId: modales.checkoutCompanyId,
  });

  useEffect(() => {
    if (!isCartLoaded) return;
    reconcileCatalogProducts(
      catalogProductsStatus === "ready" ? products : []
    );
  }, [
    catalogProductsStatus,
    isCartLoaded,
    products,
    reconcileCatalogProducts,
  ]);

  // Gestión modular de confirmación y creación de pedidos
  const { isSubmittingOrder, handleProceedToPayment, handleConfirmOrder } =
    useTiendaOrderSubmission({
      companies,
      catalogProductsStatus,
      checkoutCompanyId: modales.checkoutCompanyId,
      checkoutCart,
      openCheckout: modales.openCheckout,
      closeCheckout: () => modales.setIsCheckoutOpen(false),
      setOrderConfirmed: modales.setOrderConfirmed,
      clearCompanyCart,
      setClientProfile,
    });

  const { clientOrdersList, ordersCached, ordersSavedAt } = usePedidosCliente({
    selectedChatOrder: modales.selectedChatOrder,
    setSelectedChatOrder: modales.setSelectedChatOrder,
    orderConfirmed: modales.orderConfirmed,
  });

  const { unread, unreadTotal, unreadError } = useMensajesNoLeidos();

  const handleAddToCart = (product: (typeof products)[number]) => {
    if (!selectedCompany) return;
    addToCart({
      ...product,
      companyId: product.companyId || selectedCompany.id,
      companyName: product.companyName || selectedCompany.name,
    });
  };

  const updateSelectedCompanyQuantity = (productId: string, delta: number) => {
    const productCompanyId =
      filteredProducts.find((product) => product.id === productId)?.companyId ||
      selectedCompany?.id;
    if (productCompanyId) updateQuantity(productId, delta, productCompanyId);
  };

  const handleConnectAsDriver = () => {
    const activeDriver = loadDriverProfile();
    if (activeDriver) {
      onSwitchToDriver();
    } else {
      modales.setIsDriverAuthOpen(true);
    }
  };

  const handlePullRefresh = async () => {
    await Promise.allSettled([
      reloadCatalog(),
      new Promise<void>((resolve) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("rf-orders-updated"));
        }
        setTimeout(resolve, 500);
      }),
    ]);
  };

  return (
    <>
      <TiendaPwaLayout
        onRefresh={handlePullRefresh}
        header={
          <HeaderTienda
            cartCount={companyCarts.length}
            cartTotal={catalogProductsStatus === "ready" ? cartTotal : 0}
            deliveryType="delivery"
            deliveryAddress={deliveryAddress}
            selectedCompanyName={selectedCompany ? selectedCompany.name : null}
            onBackToMarkets={() => closeCompany()}
            onChangeAddress={() => modales.setIsAddressModalOpen(true)}
            onOpenCart={() => {
              modales.setActiveCartCompanyId(null);
              modales.setIsCartOpen(true);
            }}
            onSwitchToDriver={onSwitchToDriver}
            onOpenOrderChat={() => modales.setIsMessagesOpen(true)}
            unreadCount={unreadTotal}
            unreadError={unreadError}
          />
        }
        floatingCart={
          <BotonCarritoFlotante
            selectedCompanyCart={selectedCompanyCart}
            onOpenCart={(companyId) => {
              modales.setActiveCartCompanyId(companyId);
              modales.setIsCartOpen(true);
            }}
          />
        }
        bottomNav={
          <NavegacionTienda
            activeSection={activeBottomTab}
            onChangeSection={(section) => {
              setActiveBottomTab(section);
              closeCompany();
            }}
          />
        }
      >
        <AvisoCatalogo
          companiesCached={companiesCached}
          productsCached={productsCached}
          companiesSavedAt={companiesSavedAt}
          productsSavedAt={productsSavedAt}
          productsError={catalogProductsStatus === "error"}
          warnings={productsWarnings}
          cacheError={cacheError}
          onRetry={() => {
            void reloadCatalog();
          }}
        />
        {activeBottomTab === "orders" && ordersCached && ordersSavedAt && clientOrdersList.length > 0 && (
          <div role="status" className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
            <WifiOff className="h-4 w-4 shrink-0 text-amber-700" />
            <span>Modo sin conexión: mostrando copia guardada de tus pedidos ({formatSavedTime(ordersSavedAt)}). Los estados se actualizarán al reconectar.</span>
          </div>
        )}
        <TiendaActiveTabContent
          activeBottomTab={activeBottomTab}
          selectedCompany={selectedCompany}
          clientProfile={clientProfile}
          deliveryAddress={deliveryAddress}
          deliveryCoordinates={deliveryCoordinates}
          clientOrdersList={clientOrdersList}
          companies={companies}
          companiesCached={companiesCached}
          products={products}
          catalogStatus={catalogStatus}
          catalogProductsStatus={catalogProductsStatus}
          reloadCatalog={() => {
            void reloadCatalog();
          }}
          productCountByCompany={productCountByCompany}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          companyDepartments={companyDepartments}
          filteredProducts={filteredProducts}
          cart={cart}
          companyCatalogSize={companyCatalogSize}
          openCompany={openCompany}
          closeCompany={closeCompany}
          setActiveBottomTab={setActiveBottomTab}
          onLogin={() => modales.setIsClientAuthOpen(true)}
          onLogout={() => {
            clearClientProfile();
            setClientProfile(null);
          }}
          onEditAddress={() => modales.setIsAddressModalOpen(true)}
          onSwitchToDriver={handleConnectAsDriver}
          onSelectActiveOrder={(order) => {
            modales.openOrdersHub(String(order.id));
          }}
          onSelectOrderChat={(order) => {
            modales.openOrderChat(order);
          }}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={updateSelectedCompanyQuantity}
        />
      </TiendaPwaLayout>

      {/* ─── Contenedor Modular de Modales y Sheets ─── */}
      <TiendaModalesContainer
        isCartOpen={modales.isCartOpen}
        onCartOpenChange={modales.setIsCartOpen}
        companyCarts={companyCarts}
        activeCartCompanyId={modales.activeCartCompanyId}
        inventoryReady={catalogProductsStatus === "ready"}
        deliveryAddress={deliveryAddress}
        deliveryCoordinates={deliveryCoordinates}
        onSelectCompanyCart={modales.setActiveCartCompanyId}
        onUpdateDrawerQuantity={(pId, delta, cId) => updateQuantity(pId, delta, cId)}
        onRemoveDrawerItem={(pId, cId) => removeFromCart(pId, cId)}
        onClearCompanyCart={clearCompanyCart}
        onProceedToPayment={handleProceedToPayment}
        onContinueShopping={(companyId) => {
          const company = companies.find(
            (entry) =>
              entry.id === companyId ||
              entry.slug === companyId ||
              entry.id === `empresa-${companyId}`
          );
          if (!company) {
            toast({
              title: "No encontramos este comercio",
              description: "Volvé a la lista de comercios y abrí su carrito nuevamente.",
              variant: "destructive",
            });
            return;
          }
          openCompany(company);
          modales.closeCart();
          modales.setActiveCartCompanyId(null);
        }}
        isCheckoutOpen={modales.isCheckoutOpen}
        onCheckoutOpenChange={modales.setIsCheckoutOpen}
        checkoutCartTotal={checkoutCartTotal}
        checkoutCompanyId={modales.checkoutCompanyId}
        clientProfile={clientProfile}
        isSubmittingOrder={isSubmittingOrder}
        onConfirmOrder={handleConfirmOrder}
        onOpenLoginFromCheckout={() => modales.setIsClientAuthOpen(true)}
        onOpenAddressPickerFromCheckout={modales.openAddressPicker}
        orderConfirmed={modales.orderConfirmed}
        onCloseConfirmed={() => {
          modales.setOrderConfirmed(null);
          modales.setCheckoutCompanyId(null);
        }}
        isAddressModalOpen={modales.isAddressModalOpen}
        onAddressModalOpenChange={modales.setIsAddressModalOpen}
        onSelectAddress={handleAddressChange}
        isClientAuthOpen={modales.isClientAuthOpen}
        onClientAuthOpenChange={modales.setIsClientAuthOpen}
        onClientAuthSuccess={() => {
          modales.setIsClientAuthOpen(false);
          syncAddressFromSavedCoordinates();
          if (modales.checkoutCompanyId && checkoutCart.length > 0) {
            modales.setIsCheckoutOpen(true);
          }
        }}
        isDriverAuthOpen={modales.isDriverAuthOpen}
        onDriverAuthOpenChange={modales.setIsDriverAuthOpen}
        onDriverAuthSuccess={() => {
          modales.setIsDriverAuthOpen(false);
          onSwitchToDriver();
        }}
        isOrdersHubOpen={modales.isOrdersHubOpen}
        onOrdersHubOpenChange={modales.setIsOrdersHubOpen}
        clientOrdersList={clientOrdersList}
        ordersCached={ordersCached}
        ordersSavedAt={ordersSavedAt}
        activeOrderId={modales.activeOrderId}
        isMessagesOpen={modales.isMessagesOpen}
        onMessagesOpenChange={modales.setIsMessagesOpen}
        unread={unread}
        unreadError={unreadError}
        isOrderChatOpen={modales.isOrderChatOpen}
        onOrderChatOpenChange={modales.setIsOrderChatOpen}
        selectedChatOrder={modales.selectedChatOrder}
        onBackToOrdersHubFromChat={() => {
          modales.setIsOrderChatOpen(false);
          modales.setIsMessagesOpen(true);
        }}
      />
    </>
  );
}
