"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Navigation, UserCheck, LogOut, Truck } from "lucide-react";
import { DriverProfile } from "../motor/tipos";

interface DriverTopBarProps {
  driverProfile: DriverProfile | null;
  onSwitchToStore: () => void;
  onOpenCopilot: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  hasGps: boolean;
}

export function DriverTopBar({
  driverProfile,
  onSwitchToStore,
  onOpenCopilot,
  onLogout,
  onOpenLoginModal,
  hasGps,
}: DriverTopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-md">
      {/* Botón Volver a la Tienda */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSwitchToStore}
        className="h-9 px-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 font-bold text-xs"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400" />
        <span className="hidden xs:inline">Volver a la</span> Tienda
      </Button>

      {/* Indicadores centrales */}
      <div className="flex items-center gap-1.5">
        <Badge
          className={`border text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            hasGps
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/15 border-amber-500/30 text-amber-400"
          }`}
        >
          <Navigation className="w-2.5 h-2.5 animate-pulse" />
          {hasGps ? "GPS ACTIVO" : "BUSCANDO GPS"}
        </Badge>
      </div>

      {/* Acciones Derecha: Copiloto IA + Perfil Repartidor */}
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenCopilot}
          className="h-8 px-2.5 rounded-xl border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Copiloto</span> IA
        </Button>

        {driverProfile ? (
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
              <Truck className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px] sm:max-w-[120px]">
              {driverProfile.firstName}
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-0.5 ml-1"
              title="Cerrar sesión de repartidor"
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
            <span>Identificarse</span>
          </Button>
        )}
      </div>
    </header>
  );
}
