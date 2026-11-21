"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs">
      Cargando mapa GPS...
    </div>
  ),
});
import { useDriverOrders } from "./motor/useDriverOrders";
import { useDriverGps } from "./motor/useDriverGps";
import { loadDriverProfile, clearDriverProfile } from "./motor/driverService";
import type { DriverOrder, DriverProfile } from "./motor/tipos";
import { DriverTopBar } from "./ui/DriverTopBar";
import { TabPedidosDisponibles } from "./ui/TabPedidosDisponibles";
import { TabMiRuta } from "./ui/TabMiRuta";
import { ModalDriverAuth } from "./ui/ModalDriverAuth";
import { ModalCarteraRepartidor } from "./ui/ModalCarteraRepartidor";
import { DriverCopilotSheet } from "./ui/DriverCopilotSheet";
import { OrderChatSheet } from "./ui/OrderChatSheet";
import { CentroMensajeriaDriverSheet } from "./ui/CentroMensajeriaDriverSheet";
import { SidebarGeneral } from "@/components/SidebarGeneral";
import { ModalMercados } from "@/components/ModalMercados";
import { Layers, Truck, ShieldAlert, Navigation, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RepartidorPiramidalProps {
  onSwitchToStore: () => void;
}

export function RepartidorPiramidal({ onSwitchToStore }: RepartidorPiramidalProps) {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"pedidos" | "ruta" | "alerta">("pedidos");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isOrderChatOpen, setIsOrderChatOpen] = useState(false);
  const [isChatInboxOpen, setIsChatInboxOpen] = useState(false);
  const [selectedDriverChatOrder, setSelectedDriverChatOrder] = useState<DriverOrder | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapCenterTrigger, setMapCenterTrigger] = useState(0);

  // Bottom Sheet drag state
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Cargar perfil del conductor (para entrar como repartidor se requiere estar logueado)
  useEffect(() => {
    const p = loadDriverProfile();
    setDriverProfile(p);
    if (!p) {
      setShowLoginModal(true);
    }

    const handleAuthChange = () => {
      setDriverProfile(loadDriverProfile());
    };
    window.addEventListener("repartofacil-auth", handleAuthChange);
    return () => window.removeEventListener("repartofacil-auth", handleAuthChange);
  }, []);

  // Motores de la pirámide
  const { coords, heading } = useDriverGps(driverProfile?.id);
  const {
    availableOrders,
    myActiveOrders,
    handleTakeOrder,
    handleCompleteDelivery,
    pendingAcceptOrder,
    showLoginModal,
    setShowLoginModal,
    confirmOrderAfterLogin,
    wallet,
  } = useDriverOrders(driverProfile?.id);

  // Heartbeat de telemetría y presencia para el Custodio del Sistema
  useEffect(() => {
    if (!driverProfile?.id || myActiveOrders.length === 0) return;
    const sendPing = async () => {
      try {
        await fetch("/api/orders/custodio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ping",
            driverId: driverProfile.id,
            lat: coords?.lat || null,
            lng: coords?.lng || null,
          }),
        });
      } catch {
        // Red offline transitoria
      }
    };
    sendPing();
    const timer = setInterval(sendPing, 15000);
    return () => clearInterval(timer);
  }, [driverProfile?.id, coords?.lat, coords?.lng, myActiveOrders.length]);

  // Manejo de drag en móvil
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startY.current = clientY;
  };

  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (!isDragging) return;
      const delta = clientY - startY.current;
      setDragY(delta);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (dragY < -60) setIsExpanded(true);
      else if (dragY > 60) setIsExpanded(false);
      setDragY(0);
    };

    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);

    if (isDragging) {
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", handleEnd);
    }
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleEnd);
    };
  }, [isDragging, dragY]);

  const sheetY = isExpanded ? Math.max(0, dragY) : `calc(100% - 150px + ${Math.min(0, dragY)}px)`;

  const handleFocusActiveRoute = () => {
    setActiveTab("ruta");
    setIsExpanded(true);
    setIsNavigating(true);
    setMapCenterTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative h-screen h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* ─── 1. Mapa Interactivo de Fondo (Full Screen) ─── */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap
          center={coords ? [coords.lat, coords.lng] : [-32.9372, -60.6542]}
          heading={heading}
          alerts={null}
          activeOrders={null}
          fleet={null}
          isNavigating={isNavigating}
          centerTrigger={mapCenterTrigger}
          currentUserId={driverProfile?.id}
        />
      </div>

      {/* ─── 2. Botones Flotantes Superiores (Estándar Rappi / PedidosYa / DiDi) ─── */}
      <DriverTopBar
        driverProfile={driverProfile}
        walletBalance={wallet.balance}
        activeOrder={myActiveOrders[0] || null}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenOrderChat={() => {
          if (myActiveOrders.length > 1) {
            setIsChatInboxOpen(true);
          } else if (myActiveOrders.length === 1) {
            setSelectedDriverChatOrder(myActiveOrders[0]);
            setIsOrderChatOpen(true);
          } else {
            setIsChatInboxOpen(true);
          }
        }}
        onFocusActiveRoute={handleFocusActiveRoute}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onLogout={() => {
          clearDriverProfile();
          setDriverProfile(null);
          onSwitchToStore();
        }}
        onOpenLoginModal={() => setShowLoginModal(true)}
        hasGps={!!coords}
      />

      {/* ─── 3. Controles Flotantes del Mapa ─── */}
      <div className="absolute top-20 right-3 z-20 flex flex-col gap-2">
        <Button
          size="icon"
          onClick={() => setIsNavigating(!isNavigating)}
          className={cn(
            "h-11 w-11 rounded-2xl shadow-xl transition-all border border-slate-700/80 backdrop-blur-md",
            isNavigating ? "bg-emerald-500 text-white" : "bg-slate-900/90 text-slate-200"
          )}
          title="Modo Navegación"
        >
          <Navigation className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          onClick={() => setMapCenterTrigger((p) => p + 1)}
          className="h-11 w-11 rounded-2xl shadow-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 active:scale-95 backdrop-blur-md"
          title="Centrar en mi ubicación"
        >
          <Target className="w-5 h-5" />
        </Button>
      </div>

      {/* ─── 4. Panel Deslizable Inferior (Sheet) ─── */}
      <div
        className={cn(
          "absolute left-0 right-0 bottom-0 z-30 transform will-change-transform",
          !isDragging && "transition-transform duration-300"
        )}
        style={{ transform: `translateY(${sheetY})` }}
      >
        <div className="h-[80vh] w-full max-w-lg mx-auto bg-slate-950 rounded-t-[36px] shadow-[0_-20px_50px_rgba(0,0,0,0.95)] flex flex-col relative border-t-2 border-slate-700">
          {/* Handle de arrastre y Pestañas */}
          <div
            className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
            onMouseDown={(e) => handleDragStart(e.clientY)}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-700 mb-3" />
            <div className="w-full px-4">
              <div className="flex bg-slate-800/90 rounded-2xl p-1 border border-slate-700/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("pedidos");
                    setIsExpanded(true);
                  }}
                  className={cn(
                    "flex-1 h-10 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black relative",
                    activeTab === "pedidos"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Layers className="w-4 h-4" />
                  <span>Disponibles</span>
                  {availableOrders.length > 0 && (
                    <span className="bg-slate-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {availableOrders.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("ruta");
                    setIsExpanded(true);
                  }}
                  className={cn(
                    "flex-1 h-10 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black relative",
                    activeTab === "ruta"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Truck className="w-4 h-4" />
                  <span>Mi Ruta</span>
                  {myActiveOrders.length > 0 && (
                    <span className="bg-emerald-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {myActiveOrders.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("alerta");
                    setIsExpanded(true);
                  }}
                  className={cn(
                    "flex-1 h-10 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-black relative",
                    activeTab === "alerta"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Alertas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido scrolleable de la pestaña */}
          <div className="flex-1 overflow-y-auto px-4 pb-[max(4rem,calc(env(safe-area-inset-bottom)+2rem))] pt-2 scrollbar-none text-left">
            {activeTab === "pedidos" && (
              <TabPedidosDisponibles
                orders={availableOrders}
                onAcceptOrder={handleTakeOrder}
              />
            )}

            {activeTab === "ruta" && (
              <TabMiRuta
                activeOrders={myActiveOrders}
                onCompleteDelivery={handleCompleteDelivery}
                onOpenOrderChat={(order) => {
                  setSelectedDriverChatOrder(order);
                  setIsOrderChatOpen(true);
                }}
              />
            )}

            {activeTab === "alerta" && (
              <div className="py-12 text-center space-y-2">
                <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Sin incidencias en la zona</h4>
                <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
                  Tránsito fluido en el corredor central de Rosario (Tucumán y San Lorenzo).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. Modal de Identificación del Repartidor (Requerido para operar como repartidor) ─── */}
      <ModalDriverAuth
        isOpen={showLoginModal}
        onOpenChange={(open) => {
          setShowLoginModal(open);
          if (!open && !loadDriverProfile()) {
            onSwitchToStore();
          }
        }}
        pendingOrder={pendingAcceptOrder}
        onSuccess={(id) => {
          const prof = loadDriverProfile();
          setDriverProfile(prof);
          if (pendingAcceptOrder) {
            confirmOrderAfterLogin(id);
            setActiveTab("ruta");
            setIsExpanded(true);
          }
        }}
      />

      {/* ─── 6. Copiloto IA Sheet ─── */}
      <DriverCopilotSheet
        isOpen={isCopilotOpen}
        onOpenChange={setIsCopilotOpen}
        activeOrdersCount={myActiveOrders.length}
      />

      {/* ─── 6a. Centro de Mensajería WhatsApp-Style (Inbox de Pedidos) ─── */}
      <CentroMensajeriaDriverSheet
        isOpen={isChatInboxOpen}
        onOpenChange={setIsChatInboxOpen}
        orders={myActiveOrders}
        onSelectOrderChat={(order) => {
          setSelectedDriverChatOrder(order);
          setIsChatInboxOpen(false);
          setIsOrderChatOpen(true);
        }}
      />

      {/* ─── 6b. Chat Tripartito de Entrega (Repartidor · Cliente · Empresa CobroFácil) ─── */}
      <OrderChatSheet
        isOpen={isOrderChatOpen}
        onOpenChange={setIsOrderChatOpen}
        activeOrder={selectedDriverChatOrder || myActiveOrders[0] || null}
        viewerRole="driver"
        driverName={driverProfile?.firstName || "Lucas Motomensajero"}
        clientName={
          (selectedDriverChatOrder || myActiveOrders[0])?.clientName ||
          (selectedDriverChatOrder || myActiveOrders[0])?.customerName
        }
        deliveryAddress={(selectedDriverChatOrder || myActiveOrders[0])?.deliveryAddress}
        onBackToOrdersHub={() => {
          setIsOrderChatOpen(false);
          if (myActiveOrders.length > 1) {
            setIsChatInboxOpen(true);
          }
        }}
      />

      {/* ─── 7. Modal Cartera / Billetera Repartidor ─── */}
      <ModalCarteraRepartidor
        isOpen={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        wallet={wallet}
      />

      {/* ─── 8. Sidebar Unificado DiDi / PedidosYa (Captura 1) ─── */}
      <SidebarGeneral
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        currentMode="driver"
        onSwitchMode={(mode) => {
          if (mode === "store") onSwitchToStore();
        }}
        driverProfile={driverProfile}
        walletBalance={wallet.balance}
        onOpenOrders={() => {
          setActiveTab("ruta");
          setIsExpanded(true);
        }}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenMarkets={() => setIsMarketsOpen(true)}
        onLogout={() => {
          clearDriverProfile();
          setDriverProfile(null);
          onSwitchToStore();
        }}
      />

      {/* ─── 9. Modal Mercados / Ecosistema Multitienda Cobro Fácil (Captura 4) ─── */}
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
    </div>
  );
}
export default RepartidorPiramidal;
