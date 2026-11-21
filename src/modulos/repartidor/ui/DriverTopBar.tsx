"use client";

import React from "react";
import { Sparkles, User, Truck, Bell } from "lucide-react";
import { DriverProfile, DriverOrder } from "../motor/tipos";

interface DriverTopBarProps {
  driverProfile: DriverProfile | null;
  walletBalance?: number;
  activeOrder?: DriverOrder | null;
  onOpenSidebar: () => void;
  onOpenCopilot: () => void;
  onOpenOrderChat: () => void;
  onFocusActiveRoute?: () => void;
  onOpenWallet?: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  hasGps: boolean;
}

export function DriverTopBar({
  driverProfile,
  walletBalance = 0,
  activeOrder,
  onOpenSidebar,
  onOpenCopilot,
  onOpenOrderChat,
  onFocusActiveRoute,
  onOpenWallet,
  onLogout,
  onOpenLoginModal,
}: DriverTopBarProps) {
  const driverInitial = driverProfile?.firstName
    ? driverProfile.firstName.charAt(0).toUpperCase()
    : "R";

  return (
    <header
      style={{
        paddingTop: "max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))",
      }}
      className="absolute top-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none flex items-center justify-between gap-2"
    >
      {/* Botón Avatar / Menú Lateral Flotante (Acceso al Perfil y Cartera en el menú) */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="pointer-events-auto h-11 w-11 rounded-full bg-[#FFE600] hover:bg-yellow-300 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20 flex items-center justify-center font-black text-sm text-[#2D3277] active:scale-95 transition-all group"
        title="Abrir Menú y Mi Perfil"
      >
        <span className="group-hover:scale-110 transition-transform">{driverInitial}</span>
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
      </button>

      {/* Acciones Derecha: Copiloto IA + Campana Chat Tripartito + Estado Pedido/Perfil */}
      <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
        {/* Copiloto IA */}
        <button
          type="button"
          onClick={onOpenCopilot}
          className="h-11 w-11 rounded-full bg-white hover:bg-yellow-50 border border-yellow-300 text-[#2D3277] shadow-lg shadow-slate-900/10 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all"
          title="Copiloto IA de Reparto"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Campana de Notificaciones & Chat de Pedido Tripartito */}
        <button
          type="button"
          onClick={onOpenOrderChat}
          className="relative h-11 w-11 rounded-full bg-white hover:bg-yellow-50 border border-yellow-300 text-[#2D3277] shadow-lg shadow-slate-900/10 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all"
          title="Chat y Avisos de Entrega (Repartidor · Cliente · Empresa)"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </button>

        {/* Píldora de Pedido en Curso o Perfil del Repartidor */}
        {activeOrder ? (
          <button
            type="button"
            onClick={onFocusActiveRoute}
            className="h-11 px-3 rounded-full bg-white hover:bg-yellow-50 border border-yellow-400 shadow-lg shadow-slate-900/10 backdrop-blur-md flex items-center gap-2 active:scale-95 transition-all text-left group"
            title="Pedido activo en curso · Toca para centrar la ruta en vivo"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
              <div className="w-6 h-6 rounded-full bg-[#FFE600] text-[#2D3277] flex items-center justify-center text-[10px] font-black">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex flex-col pr-1">
              <span className="text-[11px] font-black text-[#2D3277] leading-tight">
                {activeOrder.id}
              </span>
              <span className="text-[9px] font-bold text-emerald-400/90 leading-tight uppercase tracking-wider">
                En curso
              </span>
            </div>
          </button>
        ) : driverProfile ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="h-11 px-3 rounded-full bg-white hover:bg-yellow-50 border border-yellow-400 shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95 transition-all"
            title="Ver Opciones de Cuenta"
          >
            <div className="w-6 h-6 rounded-full bg-yellow-100 text-[#2D3277] flex items-center justify-center text-[10px] font-black">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[80px] sm:max-w-[120px]">
              {driverProfile.firstName}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="h-11 px-3.5 rounded-full bg-[#FFE600] hover:bg-yellow-300 text-[#2D3277] text-xs font-black flex items-center gap-1.5 border border-yellow-500 shadow-lg shadow-slate-900/10 backdrop-blur-md active:scale-95 transition-all"
          >
            <User className="w-3.5 h-3.5 text-[#2D3277]" />
            <span>Ingresar</span>
          </button>
        )}
      </div>
    </header>
  );
}
