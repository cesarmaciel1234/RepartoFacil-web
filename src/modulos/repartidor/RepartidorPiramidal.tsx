"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-600 font-mono text-xs">
      Cargando mapa GPS...
    </div>
  ),
});

import { useDriverOrders } from "./motor/useDriverOrders";
import { useDriverGps } from "./motor/useDriverGps";
import { useDriverPresence } from "./motor/useDriverPresence";
import { useBottomSheetDrag } from "./motor/useBottomSheetDrag";
import { loadDriverProfile, clearDriverProfile } from "./motor/driverService";
import type { DriverOrder, DriverProfile } from "./motor/tipos";
import { STORE_DEFAULT_DERQUI } from "./motor/tipos";
import { DriverTopBar } from "./ui/DriverTopBar";
import { RepartidorPwaLayout } from "./ui/RepartidorPwaLayout";
import { TabPedidosDisponibles } from "./ui/TabPedidosDisponibles";
import { TabMiRuta } from "./ui/TabMiRuta";
import { DriverCopilotSheet } from "./ui/DriverCopilotSheet";
import { OrderChatSheet } from "./ui/OrderChatSheet";
import { CentroMensajeriaDriverSheet } from "./ui/CentroMensajeriaDriverSheet";
import { RepartidorSheetTabs } from "./ui/RepartidorSheetTabs";
import { RepartidorModals } from "./ui/RepartidorModals";
import { ShieldAlert, Navigation, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMensajesNoLeidos } from "@/modulos/tienda/pedidos/hooks/useMensajesNoLeidos";

interface RepartidorPiramidalProps {
  onSwitchToStore: () => void;
}

export function RepartidorPiramidal({ onSwitchToStore }: RepartidorPiramidalProps) {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"pedidos" | "ruta" | "alerta" | "mensajes">("pedidos");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [selectedDriverChatOrder, setSelectedDriverChatOrder] = useState<DriverOrder | null>(null);
  const [chatOriginTab, setChatOriginTab] = useState<"pedidos" | "ruta" | "mensajes">("ruta");
  const [isCopilotConversationOpen, setIsCopilotConversationOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapCenterTrigger, setMapCenterTrigger] = useState(0);
  const [previewOrder, setPreviewOrder] = useState<DriverOrder | null>(null);

  // Bottom Sheet drag state
  const { isExpanded, setIsExpanded, isDragging, didDrag, handleDragStart, sheetY } =
    useBottomSheetDrag();

  // Cargar perfil del conductor
  useEffect(() => {
    const p = loadDriverProfile();
    setDriverProfile(p);
    if (!p) {
      onSwitchToStore();
      return;
    }

    const handleAuthChange = () => {
      const updated = loadDriverProfile();
      setDriverProfile(updated);
      if (!updated) {
        onSwitchToStore();
      }
    };
    const handleOpenLogin = () => {
      setShowLoginModal(true);
    };
    window.addEventListener("repartofacil-auth", handleAuthChange);
    window.addEventListener("repartofacil-driver-auth", handleAuthChange);
    window.addEventListener("repartofacil-open-driver-login", handleOpenLogin);
    return () => {
      window.removeEventListener("repartofacil-auth", handleAuthChange);
      window.removeEventListener("repartofacil-driver-auth", handleAuthChange);
      window.removeEventListener("repartofacil-open-driver-login", handleOpenLogin);
    };
  }, [onSwitchToStore]);

  // Motores de la pirámide
  const { coords, heading } = useDriverGps(driverProfile?.id);
  const {
    availableOrders,
    myActiveOrders,
    handleTakeOrder,
    handlePickupOrder,
    handleCompleteDelivery,
    pendingAcceptOrder,
    showLoginModal,
    setShowLoginModal,
    confirmOrderAfterLogin,
    wallet,
    pendingActions,
    syncError,
    syncPending,
  } = useDriverOrders(driverProfile?.id);

  const { unreadTotal: chatUnreadCount } = useMensajesNoLeidos("Driver");
  const [copilotUnreadCount, setCopilotUnreadCount] = useState(0);
  const prevAvailableCountRef = useRef(0);

  // Telemetría, pings de vida, wake lock y notificaciones
  useDriverPresence({
    driverId: driverProfile?.id,
    hasActiveOrders: myActiveOrders.length > 0,
    isNavigating,
    coords: coords ? { lat: coords.lat, lng: coords.lng } : null,
  });

  // Si ingresan nuevas oportunidades en Disponibles, Copo IA genera sugerencia/badge
  useEffect(() => {
    if (availableOrders.length > prevAvailableCountRef.current && prevAvailableCountRef.current > 0) {
      setCopilotUnreadCount((prev) => prev + (availableOrders.length - prevAvailableCountRef.current));
    }
    prevAvailableCountRef.current = availableOrders.length;
  }, [availableOrders.length]);

  useEffect(() => {
    if (selectedDriverChatOrder && !myActiveOrders.some((order) => order.id === selectedDriverChatOrder.id)) {
      setSelectedDriverChatOrder(null);
    }
  }, [selectedDriverChatOrder, myActiveOrders]);

  const handleFocusActiveRoute = () => {
    setActiveTab("ruta");
    setIsExpanded(true);
    setIsNavigating(true);
    setMapCenterTrigger((prev) => prev + 1);
  };

  const showMessageInbox = () => {
    setSelectedDriverChatOrder(null);
    setIsCopilotConversationOpen(false);
    setActiveTab("mensajes");
    setIsExpanded(true);
  };

  const openCopilotConversation = () => {
    setSelectedDriverChatOrder(null);
    setIsCopilotConversationOpen(true);
    setCopilotUnreadCount(0);
    setActiveTab("mensajes");
    setIsExpanded(true);
  };

  const openOrderConversation = (order: DriverOrder) => {
    setChatOriginTab(activeTab === "mensajes" ? "mensajes" : "ruta");
    setSelectedDriverChatOrder(order);
    setIsCopilotConversationOpen(false);
    setActiveTab("mensajes");
    setIsExpanded(true);
  };

  const handleBackFromOrderChat = () => {
    setSelectedDriverChatOrder(null);
    setIsCopilotConversationOpen(false);
    setActiveTab(chatOriginTab);
    setIsExpanded(true);
  };

  const activeOrder = myActiveOrders[0] || null;
  const isOrderPickedUp = Boolean(
    activeOrder &&
      ["picked up", "in transit"].includes(String(activeOrder.status).trim().toLowerCase())
  );

  const activeNavDestination: [number, number] | null = activeOrder
    ? isOrderPickedUp
      ? activeOrder.destinationCoords?.lat && activeOrder.destinationCoords?.lng
        ? [activeOrder.destinationCoords.lat, activeOrder.destinationCoords.lng]
        : null
      : activeOrder.storeCoords?.lat && activeOrder.storeCoords?.lng
      ? [activeOrder.storeCoords.lat, activeOrder.storeCoords.lng]
      : [STORE_DEFAULT_DERQUI.coords.lat, STORE_DEFAULT_DERQUI.coords.lng]
    : null;

  return (
    <RepartidorPwaLayout
      map={
        <InteractiveMap
          center={coords ? [coords.lat, coords.lng] : [STORE_DEFAULT_DERQUI.coords.lat, STORE_DEFAULT_DERQUI.coords.lng]}
          destination={activeNavDestination}
          heading={heading}
          alerts={null}
          activeOrders={myActiveOrders}
          availableOrders={availableOrders}
          previewOrder={myActiveOrders.length === 0 ? previewOrder : null}
          onSelectPreviewOrder={(order) => setPreviewOrder(order)}
          hasActiveOrder={myActiveOrders.length > 0}
          isOrderPickedUp={isOrderPickedUp}
          driverVehicle={driverProfile?.vehicleType || "Motorcycle"}
          isNavigating={isNavigating}
          centerTrigger={mapCenterTrigger}
          currentUserId={driverProfile?.id}
          onSelectOrder={openOrderConversation}
          onTakeOrder={(orderId) => {
            const ord = availableOrders.find((o) => o.id === orderId);
            if (ord) handleTakeOrder(ord);
          }}
        />
      }
      topBar={
        <DriverTopBar
          driverProfile={driverProfile}
          walletBalance={wallet.balance}
          activeOrder={myActiveOrders[0] || null}
          chatUnreadCount={chatUnreadCount}
          copilotUnreadCount={copilotUnreadCount}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenCopilot={openCopilotConversation}
          onOpenOrderChat={showMessageInbox}
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
      }
      controls={
        <div className="absolute top-20 right-3 z-20 flex flex-col gap-2">
          <Button
            size="icon"
            onClick={() => setIsNavigating(!isNavigating)}
            className={cn(
              "h-11 w-11 rounded-2xl shadow-lg transition-all border backdrop-blur-md",
              isNavigating
                ? "bg-[#FFE600] border-yellow-500 text-[#2D3277]"
                : "bg-white border-slate-200 text-[#2D3277]"
            )}
            title="Modo Navegación"
          >
            <Navigation className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => setMapCenterTrigger((p) => p + 1)}
            className="h-11 w-11 rounded-2xl shadow-lg bg-white border border-yellow-300 text-[#2D3277] active:scale-95 backdrop-blur-md"
            title="Centrar en mi ubicación"
          >
            <Target className="w-5 h-5" />
          </Button>
        </div>
      }
      sheet={
        <div
          className={cn(
            "absolute left-0 right-0 bottom-0 z-30 transform will-change-transform",
            !isDragging && "transition-transform duration-300"
          )}
          style={{ transform: `translateY(${sheetY})` }}
        >
          <div className="w-full max-w-lg mx-auto h-[80dvh] bg-white rounded-t-[36px] shadow-[0_-16px_40px_rgba(15,23,42,0.2)] flex flex-col relative border-t-2 border-yellow-400">
            {/* Handle de arrastre y Pestañas */}
            <RepartidorSheetTabs
              activeTab={activeTab}
              onSelectTab={(tab) => {
                if (tab === "mensajes") showMessageInbox();
                else {
                  setActiveTab(tab);
                  setIsExpanded(true);
                }
              }}
              availableCount={availableOrders.length}
              activeOrdersCount={myActiveOrders.length}
              chatUnreadCount={chatUnreadCount}
              isExpanded={isExpanded}
              onToggleExpand={() => {
                if (!didDrag.current) setIsExpanded((expanded) => !expanded);
              }}
              onDragStart={handleDragStart}
            />

            {/* Contenido scrolleable de la pestaña */}
            <div
              className={cn(
                "flex-1 min-h-0 pt-2 scrollbar-none text-left",
                activeTab === "mensajes"
                  ? "flex flex-col overflow-hidden px-0 pb-0"
                  : "overflow-y-auto px-4 pb-[max(4rem,calc(env(safe-area-inset-bottom)+2rem))]"
              )}
            >
              {(pendingActions.length > 0 || syncError) && (
                <div
                  role={pendingActions.length > 0 ? "status" : "alert"}
                  className={cn(
                    "mx-4 mb-3 rounded-xl border p-3 text-xs",
                    pendingActions.length > 0
                      ? "border-amber-300 bg-amber-50 text-amber-950"
                      : "border-red-300 bg-red-50 text-red-950"
                  )}
                >
                  <p className="font-bold">
                    {pendingActions.length > 0
                      ? `${pendingActions.length} acción${pendingActions.length === 1 ? "" : "es"} pendiente${pendingActions.length === 1 ? "" : "s"} de confirmación`
                      : "El servidor rechazó la acción"}
                  </p>
                  <p className="mt-1">
                    {syncError || "No se confirma la asignación ni la ganancia hasta que responda el servidor."}
                  </p>
                  {pendingActions.length > 0 && (
                    <button type="button" onClick={() => void syncPending()} className="mt-2 font-bold underline">
                      Reintentar sincronización
                    </button>
                  )}
                </div>
              )}

              {activeTab === "pedidos" && (
                <TabPedidosDisponibles
                  orders={availableOrders}
                  onAcceptOrder={handleTakeOrder}
                  pendingOrderIds={pendingActions.map((action) => action.order.id)}
                  hasActiveOrder={myActiveOrders.length > 0}
                  previewOrderId={previewOrder?.id}
                  onPreviewOrder={(order) => setPreviewOrder(order)}
                />
              )}

              {activeTab === "ruta" && (
                <TabMiRuta
                  activeOrders={myActiveOrders}
                  onPickupOrder={handlePickupOrder}
                  onCompleteDelivery={handleCompleteDelivery}
                  onOpenOrderChat={openOrderConversation}
                  pendingOrderIds={pendingActions.map((action) => action.order.id)}
                />
              )}

              {activeTab === "alerta" && (
                <div className="py-12 text-center space-y-2">
                  <ShieldAlert className="w-10 h-10 text-yellow-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Sin incidencias en la zona</h4>
                  <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                    Sin incidencias reportadas en tu zona de reparto.
                  </p>
                </div>
              )}

              {activeTab === "mensajes" && selectedDriverChatOrder && (
                <OrderChatSheet
                  key={selectedDriverChatOrder.id}
                  embedded
                  isOpen
                  onOpenChange={(open) => {
                    if (!open) handleBackFromOrderChat();
                  }}
                  activeOrder={selectedDriverChatOrder}
                  viewerRole="driver"
                  driverName={driverProfile?.firstName || "Repartidor"}
                  clientName={
                    selectedDriverChatOrder.clientName ||
                    selectedDriverChatOrder.customerName
                  }
                  deliveryAddress={selectedDriverChatOrder.deliveryAddress}
                  onBackToOrdersHub={handleBackFromOrderChat}
                  backButtonLabel={chatOriginTab === "ruta" ? "Volver a Mi Ruta" : "Volver a mensajes"}
                />
              )}

              <div
                className={cn(
                  "min-h-0 flex-1 flex-col",
                  activeTab === "mensajes" && isCopilotConversationOpen ? "flex" : "hidden"
                )}
              >
                <DriverCopilotSheet
                  onBack={showMessageInbox}
                  activeOrdersCount={myActiveOrders.length}
                />
              </div>

              {activeTab === "mensajes" && !selectedDriverChatOrder && !isCopilotConversationOpen && (
                <CentroMensajeriaDriverSheet
                  isOpen
                  orders={myActiveOrders}
                  onSelectOrderChat={openOrderConversation}
                  onSelectCopilot={openCopilotConversation}
                />
              )}
            </div>
          </div>
        </div>
      }
      modals={
        <RepartidorModals
          showLoginModal={showLoginModal}
          setShowLoginModal={setShowLoginModal}
          pendingAcceptOrder={pendingAcceptOrder}
          onLoginSuccess={(id) => {
            const prof = loadDriverProfile();
            setDriverProfile(prof);
            if (pendingAcceptOrder) {
              confirmOrderAfterLogin(id);
              setActiveTab("ruta");
              setIsExpanded(true);
            }
          }}
          onSwitchToStore={onSwitchToStore}
          isWalletModalOpen={isWalletModalOpen}
          setIsWalletModalOpen={setIsWalletModalOpen}
          wallet={wallet}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          driverProfile={driverProfile}
          setDriverProfile={setDriverProfile}
          onOpenMyRoute={() => {
            setActiveTab("ruta");
            setIsExpanded(true);
          }}
          isMarketsOpen={isMarketsOpen}
          setIsMarketsOpen={setIsMarketsOpen}
        />
      }
    />
  );
}

export default RepartidorPiramidal;
