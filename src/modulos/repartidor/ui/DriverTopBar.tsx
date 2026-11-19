"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Navigation, UserCheck, LogOut, Truck, Wallet } from "lucide-react";
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
  hasGps,
}: DriverTopBarProps) {
  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-1.5 shadow-md">
      {/* Botón Volver a la Tienda */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSwitchToStore}
        className="h-9 px-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 font-bold text-xs shrink-0"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400" />
        <span className="hidden xs:inline">Volver</span>
      </Button>

      {/* Botón Cartera / Billetera en Vivo */}
      <button
        type="button"
        onClick={onOpenWallet}
        className="h-9 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm"
        title="Abrir Cartera de Repartidor"
      >
        <Wallet className="w-4 h-4 text-emerald-400" />
        <span className="font-black text-xs text-white tracking-tight">
          {formatMoney(walletBalance)}
        </span>
      </button>

      {/* Acciones Derecha: Copiloto IA + Perfil Repartidor */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenCopilot}
          className="h-8 px-2 rounded-xl border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Copiloto</span>
        </Button>

        {driverProfile ? (
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
              <Truck className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[70px] sm:max-w-[120px]">
              {driverProfile.firstName}
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-0.5 ml-0.5"
              title="Cerrar sesión"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={onOpenLoginModal}
            className="h-8 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ingresar</span>
          </Button>
        )}
      </div>
    </header>
  );
}
