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
import { DriverProfile } from "./motor/tipos";
import { DriverTopBar } from "./ui/DriverTopBar";
import { TabPedidosDisponibles } from "./ui/TabPedidosDisponibles";
import { TabMiRuta } from "./ui/TabMiRuta";
import { ModalDriverAuth } from "./ui/ModalDriverAuth";
import { DriverCopilotSheet } from "./ui/DriverCopilotSheet";
import { Layers, Truck, ShieldAlert, Navigation, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RepartidorPiramidalProps {
  onSwitchToStore: () => void;
}

export function RepartidorPiramidal({ onSwitchToStore }: RepartidorPiramidalProps) {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"pedidos" | "ruta" | "alerta">("pedidos");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapCenterTrigger, setMapCenterTrigger] = useState(0);

  // Bottom Sheet drag state
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Cargar perfil del conductor
  useEffect(() => {
    const p = loadDriverProfile();
    setDriverProfile(p);

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
  } = useDriverOrders(driverProfile?.id);

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

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ─── 1. Top Bar fija ─── */}
      <DriverTopBar
        driverProfile={driverProfile}
        onSwitchToStore={onSwitchToStore}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onLogout={clearDriverProfile}
        onOpenLoginModal={() => setShowLoginModal(true)}
        hasGps={!!coords}
      />

      {/* ─── 2. Mapa Interactivo de Fondo ─── */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap
          center={coords ? [coords.lat, coords.lng] : [-34.6037, -58.3816]}
          alerts={null}
          activeOrders={null}
          fleet={null}
          isNavigating={isNavigating}
          centerTrigger={mapCenterTrigger}
          currentUserId={driverProfile?.id}
        />
      </div>

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
        <div className="h-[80vh] w-full max-w-lg mx-auto bg-slate-900/95 backdrop-blur-2xl rounded-t-[36px] shadow-[0_-20px_50px_rgba(0,0,0,0.6)] flex flex-col relative border-t border-slate-800">
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
          <div className="flex-1 overflow-y-auto px-4 pb-16 pt-2 scrollbar-none text-left">
            {activeTab === "pedidos" && (
              <TabPedidosDisponibles
                orders={availableOrders}
                onAcceptOrder={(order) => handleTakeOrder(order, driverProfile?.id)}
              />
            )}

            {activeTab === "ruta" && (
              <TabMiRuta
                activeOrders={myActiveOrders}
                onCompleteDelivery={handleCompleteDelivery}
              />
            )}

            {activeTab === "alerta" && (
              <div className="py-8 text-center space-y-2">
                <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Tránsito y Alertas de Zona</h4>
                <p className="text-xs text-slate-400">
                  Sin demoras reportadas en las rutas de entrega hacia los clientes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. Modal de Identificación del Repartidor (Solo se activa al aceptar pedido o identificarse) ─── */}
      <ModalDriverAuth
        isOpen={showLoginModal}
        onOpenChange={setShowLoginModal}
        pendingOrder={pendingAcceptOrder}
        onSuccess={(id) => {
          confirmOrderAfterLogin(id);
          setActiveTab("ruta");
          setIsExpanded(true);
        }}
      />

      {/* ─── 6. Copiloto IA Sheet ─── */}
      <DriverCopilotSheet
        isOpen={isCopilotOpen}
        onOpenChange={setIsCopilotOpen}
        activeOrdersCount={myActiveOrders.length}
      />
    </div>
  );
}
export default RepartidorPiramidal;
