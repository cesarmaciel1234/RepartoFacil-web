import React from "react";
import type { DriverOrder, DriverProfile, DriverWallet } from "../motor/tipos";
import { ModalDriverAuth } from "./ModalDriverAuth";
import { ModalCarteraRepartidor } from "./ModalCarteraRepartidor";
import { SidebarGeneral } from "@/components/SidebarGeneral";
import { ModalMercados } from "@/components/ModalMercados";
import { clearDriverProfile, loadDriverProfile } from "../motor/driverService";

export interface RepartidorModalsProps {
  showLoginModal: boolean;
  setShowLoginModal: (open: boolean) => void;
  pendingAcceptOrder: DriverOrder | null;
  onLoginSuccess: (driverId: string) => void;
  onSwitchToStore: () => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  wallet: DriverWallet;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  driverProfile: DriverProfile | null;
  setDriverProfile: (profile: DriverProfile | null) => void;
  onOpenMyRoute: () => void;
  isMarketsOpen: boolean;
  setIsMarketsOpen: (open: boolean) => void;
}

export function RepartidorModals({
  showLoginModal,
  setShowLoginModal,
  pendingAcceptOrder,
  onLoginSuccess,
  onSwitchToStore,
  isWalletModalOpen,
  setIsWalletModalOpen,
  wallet,
  isSidebarOpen,
  setIsSidebarOpen,
  driverProfile,
  setDriverProfile,
  onOpenMyRoute,
  isMarketsOpen,
  setIsMarketsOpen,
}: RepartidorModalsProps) {
  return (
    <>
      {/* 1. Modal de Identificación del Repartidor */}
      <ModalDriverAuth
        isOpen={showLoginModal}
        onOpenChange={(open) => {
          setShowLoginModal(open);
          if (!open && !loadDriverProfile()) {
            onSwitchToStore();
          }
        }}
        pendingOrder={pendingAcceptOrder}
        onSuccess={onLoginSuccess}
      />

      {/* 2. Modal Cartera / Billetera Repartidor */}
      <ModalCarteraRepartidor
        isOpen={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        wallet={wallet}
      />

      {/* 3. Sidebar Unificado */}
      <SidebarGeneral
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        currentMode="driver"
        onSwitchMode={(mode) => {
          // El chofer solo puede salir de modo Repartidor tocando Cerrar sesión
          if (mode === "store" && !loadDriverProfile()) {
            onSwitchToStore();
          }
        }}
        driverProfile={driverProfile}
        walletBalance={wallet.balance}
        onOpenOrders={onOpenMyRoute}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenMarkets={() => setIsMarketsOpen(true)}
        onLogout={() => {
          clearDriverProfile();
          setDriverProfile(null);
          onSwitchToStore();
        }}
      />

      {/* 4. Modal Mercados / Ecosistema Multitienda */}
      <ModalMercados
        isOpen={isMarketsOpen}
        onOpenChange={setIsMarketsOpen}
        selectedCompanyId="frigorifico-maciel"
        onSelectCompany={(company) => {
          setIsMarketsOpen(false);
          const url = new URL(window.location.href);
          url.searchParams.set("tienda", company.slug || company.id);
          window.history.replaceState({}, "", url);
          onSwitchToStore();
        }}
      />
    </>
  );
}
