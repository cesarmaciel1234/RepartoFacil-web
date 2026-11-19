"use client";

import React from "react";
import { Sparkles, User, LogOut, Truck, Wallet, Menu } from "lucide-react";
import { DriverProfile } from "../motor/tipos";

interface DriverTopBarProps {
  driverProfile: DriverProfile | null;
  walletBalance: number;
  onOpenSidebar: () => void;
  onOpenCopilot: () => void;
  onOpenWallet: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  hasGps: boolean;
}

export function DriverTopBar({
  driverProfile,
  walletBalance,
  onOpenSidebar,
  onOpenCopilot,
  onOpenWallet,
  onLogout,
  onOpenLoginModal,
}: DriverTopBarProps) {
  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");
  const driverInitial = driverProfile?.firstName
    ? driverProfile.firstName.charAt(0).toUpperCase()
    : "R";

  return (
    <header className="absolute top-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none flex items-center justify-between gap-2">
      {/* Botón Avatar / Menú Lateral Flotante (Estilo DiDi / PedidosYa - Captura 1) */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="pointer-events-auto h-11 w-11 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-emerald-500/50 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center justify-center font-black text-sm text-white active:scale-95 transition-all group"
        title="Abrir Menú y Mi Perfil"
      >
        <span className="group-hover:scale-110 transition-transform">{driverInitial}</span>
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
      </button>

      {/* Píldora Central de Ganancias en Vivo (Estándar Uber Driver / PedidosYa) */}
      <button
        type="button"
        onClick={onOpenWallet}
        className="pointer-events-auto h-11 px-4 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-emerald-500/50 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center gap-2 transition-all active:scale-95 group"
        title="Ver Mi Cartera y Ganancias"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Wallet className="w-3.5 h-3.5" />
        </div>
        <span className="font-black text-sm text-white tracking-tight group-hover:text-emerald-300 transition-colors">
          {formatMoney(walletBalance)}
        </span>
      </button>

      {/* Acciones Derecha: Copiloto IA + Perfil Repartidor flotantes */}
      <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCopilot}
          className="h-11 w-11 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all"
          title="Copiloto IA de Reparto"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {driverProfile ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="h-11 px-3 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center gap-2 active:scale-95 transition-all"
            title="Ver Opciones de Cuenta"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px] sm:max-w-[120px]">
              {driverProfile.firstName}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="h-11 px-3.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-md active:scale-95 transition-all"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ingresar</span>
          </button>
        )}
      </div>
    </header>
  );
}
