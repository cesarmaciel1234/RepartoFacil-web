"use client";

import React from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import type { Product } from "@/data/mockProducts";
import type { CartItem } from "../motor/useCart";
import type { CatalogStatus } from "../catalogo/hooks/useCatalogoTienda";
import { InicioTienda } from "../pantallas/InicioTienda";
import { SupermercadosTienda } from "../pantallas/SupermercadosTienda";
import { PromocionesTienda } from "../pantallas/PromocionesTienda";
import { HistorialPedidosTienda } from "../pantallas/HistorialPedidosTienda";
import { PerfilCliente } from "../pantallas/PerfilCliente";
import { CatalogoEmpresaTienda } from "../catalogo/pantallas/CatalogoEmpresaTienda";
import { authHeaders } from "@/lib/clientAuth";

interface TiendaActiveTabContentProps {
  activeBottomTab: "home" | "markets" | "promotions" | "orders" | "profile";
  selectedCompany: CompanyStore | null;
  clientProfile: any;
  deliveryAddress: string;
  deliveryCoordinates: { lat: number; lng: number } | null;
  clientOrdersList: any[];
  companies: CompanyStore[];
  companiesCached: boolean;
  products: Product[];
  catalogStatus: CatalogStatus;
  catalogProductsStatus: CatalogStatus;
  reloadCatalog: () => void;
  productCountByCompany: Record<string, number>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  companyDepartments: { id: string; name: string; icon: string }[];
  filteredProducts: Product[];
  cart: CartItem[];
  companyCatalogSize: number;
  openCompany: (company: CompanyStore, initialSearch?: string) => void;
  closeCompany: () => void;
  setActiveBottomTab: (tab: "home" | "markets" | "promotions" | "orders" | "profile") => void;
  onLogin: () => void;
  onLogout: () => void;
  onEditAddress: () => void;
  onSwitchToDriver: () => void;
  onSelectActiveOrder: (order: any) => void;
  onSelectOrderChat: (order: any) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export function TiendaActiveTabContent({
  activeBottomTab,
  selectedCompany,
  clientProfile,
  deliveryAddress,
  deliveryCoordinates,
  clientOrdersList,
  companies,
  companiesCached,
  products,
  catalogStatus,
  catalogProductsStatus,
  reloadCatalog,
  productCountByCompany,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  companyDepartments,
  filteredProducts,
  cart,
  companyCatalogSize,
  openCompany,
  closeCompany,
  setActiveBottomTab,
  onLogin,
  onLogout,
  onEditAddress,
  onSwitchToDriver,
  onSelectActiveOrder,
  onSelectOrderChat,
  onAddToCart,
  onUpdateQuantity,
}: TiendaActiveTabContentProps) {
  const browseProps = {
    companies,
    companiesCached,
    products,
    status: catalogStatus,
    onRetry: reloadCatalog,
    productCountByCompany,
    onSelectCompany: (company: CompanyStore, initialSearch?: string) =>
      openCompany(company, initialSearch || ""),
    searchQuery,
    onSearchChange: setSearchQuery,
    deliveryAddress,
    deliveryCoordinates,
  };

  if (activeBottomTab === "profile") {
    return (
      <PerfilCliente
        clientProfile={clientProfile}
        isClientAuthenticated={!!clientProfile && !!authHeaders("Client").Authorization}
        deliveryAddress={deliveryAddress}
        onLogin={onLogin}
        onLogout={onLogout}
        onEditAddress={onEditAddress}
        onSwitchToDriver={onSwitchToDriver}
      />
    );
  }

  if (activeBottomTab === "orders") {
    return (
      <HistorialPedidosTienda
        orders={clientOrdersList}
        onGoToHome={() => setActiveBottomTab("home")}
        onSelectActiveOrder={onSelectActiveOrder}
        onSelectOrderChat={onSelectOrderChat}
      />
    );
  }

  if (!selectedCompany) {
    if (activeBottomTab === "markets") {
      return <SupermercadosTienda {...browseProps} />;
    }
    if (activeBottomTab === "promotions") {
      return <PromocionesTienda {...browseProps} />;
    }
    return <InicioTienda {...browseProps} />;
  }

  return (
    <CatalogoEmpresaTienda
      company={selectedCompany}
      companyCached={companiesCached}
      categories={companyDepartments}
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      products={filteredProducts}
      cart={cart}
      deliveryCoordinates={deliveryCoordinates}
      deliveryAddress={deliveryAddress}
      onOpenChangeAddress={onEditAddress}
      catalogStatus={catalogProductsStatus}
      onRetry={reloadCatalog}
      onSearchChange={setSearchQuery}
      onCategorySelect={setSelectedCategory}
      onAddToCart={onAddToCart}
      onUpdateQuantity={onUpdateQuantity}
      catalogSize={companyCatalogSize}
      onBackToStores={closeCompany}
    />
  );
}
