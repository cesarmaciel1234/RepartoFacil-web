"use client";

import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DriverProfile } from "@/modulos/repartidor/motor/tipos";
import { ModalClientAuth } from "@/modulos/tienda/ui/ModalClientAuth";
import { useSidebarAuth } from "./sidebar/hooks/useSidebarAuth";
import { SidebarHeader } from "./sidebar/ui/SidebarHeader";
import { SidebarDriverView } from "./sidebar/ui/SidebarDriverView";
import { SidebarStoreView } from "./sidebar/ui/SidebarStoreView";
import { SidebarFooter } from "./sidebar/ui/SidebarFooter";

export interface SidebarGeneralProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentMode: "store" | "driver";
  onSwitchMode: (mode: "store" | "driver") => void;
  driverProfile?: DriverProfile | null;
  walletBalance?: number;
  onOpenWallet?: () => void;
  onOpenOrders?: () => void;
  onOpenMarkets?: () => void;
  onLogout?: () => void;
}

export function SidebarGeneral({
  isOpen,
  onOpenChange,
  currentMode,
  onSwitchMode,
  driverProfile,
  walletBalance = 0,
  onOpenWallet,
  onOpenOrders,
  onOpenMarkets,
  onLogout,
}: SidebarGeneralProps) {
  const formatMoney = (val: number) => "$" + val.toLocaleString("es-AR");

  const {
    clientProfile,
    activeDriverProfile,
    isClientAuthOpen,
    setIsClientAuthOpen,
    isDriverMode,
    userName,
    userInitial,
    driverStatusLabel,
    driverVehicleLabel,
    driverIdLabel,
    handleCloseSession,
    handleSwitchModeAndClose,
    handlePwaCacheClear,
  } = useSidebarAuth({
    driverProfileProp: driverProfile,
    currentMode,
    onOpenChange,
    onSwitchMode,
    onLogout,
  });

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className={`w-[85vw] max-w-xs border-r p-0 flex flex-col justify-between ${
            isDriverMode
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-slate-950 border-slate-800 text-slate-100"
          }`}
        >
          <div
            style={{
              paddingTop: "max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))",
              paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))",
            }}
            className="overflow-y-auto p-5 space-y-6"
          >
            {/* 1. Header Perfil */}
            <SidebarHeader
              isDriverMode={isDriverMode}
              userInitial={userInitial}
              userName={userName}
              currentMode={currentMode}
              clientProfile={clientProfile}
              activeDriverProfile={activeDriverProfile}
              driverStatusLabel={driverStatusLabel}
              onOpenClientAuth={() => setIsClientAuthOpen(true)}
              onOpenDriverLogin={() => {
                onOpenChange(false);
                window.dispatchEvent(new CustomEvent("repartofacil-open-driver-login"));
              }}
            />

            {/* 2. Menú Condicional: Exclusivo Repartidor vs Exclusivo Cliente */}
            {currentMode === "driver" ? (
              <SidebarDriverView
                walletBalance={walletBalance}
                formatMoney={formatMoney}
                driverVehicleLabel={driverVehicleLabel}
                driverStatusLabel={driverStatusLabel}
                driverIdLabel={driverIdLabel}
                onOpenWallet={onOpenWallet}
                onOpenOrders={onOpenOrders}
                onClose={() => onOpenChange(false)}
              />
            ) : (
              <SidebarStoreView
                onOpenOrders={onOpenOrders}
                onOpenWallet={onOpenWallet}
                onOpenMarkets={onOpenMarkets}
                onSwitchModeAndClose={handleSwitchModeAndClose}
                onClose={() => onOpenChange(false)}
              />
            )}
          </div>

          {/* 3. Footer con Cerrar Sesión y Actualizar Caché PWA */}
          <SidebarFooter
            isDriverMode={isDriverMode}
            currentMode={currentMode}
            clientProfile={clientProfile}
            onClearCache={handlePwaCacheClear}
            onCloseSession={handleCloseSession}
          />
        </SheetContent>
      </Sheet>

      {/* Modal de Autenticación para Cliente */}
      <ModalClientAuth
        isOpen={isClientAuthOpen}
        onOpenChange={setIsClientAuthOpen}
      />
    </>
  );
}
export default SidebarGeneral;
