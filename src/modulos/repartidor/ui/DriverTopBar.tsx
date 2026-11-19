"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, UserCheck, LogOut, Truck, Wallet } from "lucide-react";
import { DriverProfile } from "../motor/tipos";

interface DriverTopBarProps {
  driverProfile: DriverProfile | null;
  walletBalance: number;
  onSwitchToStore: () => void;
  onOpenCopilot: () => void;
  onOpenWallet: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  hasGps: boolean;
}

export function DriverTopBar({
  driverProfile,
  walletBalance,
  onSwitchToStore,
  onOpenCopilot,
  onOpenWallet,
  onLogout,
  onOpenLoginModal,
}: DriverTopBarProps) {
  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");

  return (
    <header className="absolute top-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none flex items-center justify-between gap-2">
      {/* Botón Volver a la Tienda (Píldora flotante izquierda estilo Rappi / PedidosYa) */}
      <button
        type="button"
        onClick={onSwitchToStore}
        className="pointer-events-auto h-11 px-3.5 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center gap-1.5 font-bold text-xs text-slate-200 hover:text-white active:scale-95 transition-all"
        title="Volver a la Tienda"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400" />
        <span className="hidden xs:inline">Tienda</span>
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
          <div className="h-11 px-3 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px] sm:max-w-[120px]">
              {driverProfile.firstName}
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="h-11 px-3.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-md active:scale-95 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ingresar</span>
          </button>
        )}
      </div>
    </header>
  );
}
