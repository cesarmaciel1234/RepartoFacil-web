"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Headphones,
  Tag,
  Wallet,
  Settings,
  MessageSquare,
  ShieldCheck,
  QrCode,
  Gift,
  Truck,
  Store,
  LogOut,
  ChevronRight,
  User,
  ExternalLink,
} from "lucide-react";
import { DriverProfile } from "@/modulos/repartidor/motor/tipos";
import { loadClientProfile, ClientProfile, clearDriverProfile } from "@/modulos/repartidor/motor/driverService";
import { ModalClientAuth } from "@/modulos/tienda/ui/ModalClientAuth";
import { useState, useEffect } from "react";

interface SidebarGeneralProps {
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

  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isClientAuthOpen, setIsClientAuthOpen] = useState(false);

  useEffect(() => {
    setClientProfile(loadClientProfile());
    const sync = () => setClientProfile(loadClientProfile());
    window.addEventListener("repartofacil-auth", sync);
    return () => window.removeEventListener("repartofacil-auth", sync);
  }, []);

  const userName =
    currentMode === "driver" && driverProfile
      ? driverProfile.firstName
      : clientProfile
      ? clientProfile.displayName
      : "Cliente Reparto Fácil";

  const userInitial = userName.charAt(0).toUpperCase();

  const handleCloseSession = () => {
    onOpenChange(false);
    clearDriverProfile();
    setClientProfile(null);
    if (onLogout) onLogout();
    if (currentMode === "driver") {
      onSwitchMode("store");
    }
  };

  const handleSwitchModeAndClose = () => {
    onOpenChange(false);
    onSwitchMode(currentMode === "store" ? "driver" : "store");
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-xs bg-slate-950 border-r border-slate-800 text-slate-100 p-0 flex flex-col justify-between"
        >
          <div className="overflow-y-auto p-5 space-y-6">
            {/* 1. Header Perfil (Estilo DiDi / PedidosYa - Captura 1) */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base text-white truncate block">
                    {userName}
                  </span>
                </div>
                <span className="text-xs text-slate-400 block truncate">
                  {currentMode === "driver"
                    ? "Repartidor Activo · En Turno"
                    : clientProfile
                    ? clientProfile.email
                    : "Frigorífico Maciel Ecosistema"}
                </span>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <Badge
                    className={
                      currentMode === "driver"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold py-0"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold py-0"
                    }
                  >
                    {currentMode === "driver"
                      ? "Modo Conductor"
                      : clientProfile
                      ? "Cliente Registrado"
                      : "Modo Tienda"}
                  </Badge>

                  {/* Botón Iniciar Sesión Cliente si está en modo tienda y no está logueado */}
                  {currentMode === "store" && !clientProfile && (
                    <button
                      type="button"
                      onClick={() => setIsClientAuthOpen(true)}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      Iniciar Sesión
                    </button>
                  )}
                </div>
              </div>
            </div>

          {/* 2. Grid 3x3 de Acciones Rápidas (Estilo DiDi - Captura 1) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Accesos Principales
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* Solicitudes / Pedidos */}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  if (onOpenOrders) onOpenOrders();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center mb-1">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">Pedidos</span>
              </button>

              {/* Mi Billetera */}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  if (onOpenWallet) onOpenWallet();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">Billetera</span>
              </button>

              {/* Mercados / Locales */}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  if (onOpenMarkets) onOpenMarkets();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-amber-400 flex items-center justify-center mb-1">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">Mercados</span>
              </button>

              {/* Descuentos */}
              <button
                type="button"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-purple-400 flex items-center justify-center mb-1">
                  <Tag className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">Ofertas</span>
              </button>

              {/* Ayuda & WhatsApp */}
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-green-400 flex items-center justify-center mb-1">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">Ayuda</span>
              </a>

              {/* Cobro Fácil QR */}
              <button
                type="button"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-all text-center group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-blue-400 flex items-center justify-center mb-1">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">CobroFácil</span>
              </button>
            </div>
          </div>

          {/* 3. Sección "Otras Funciones" (Captura 1) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Otras Funciones
            </span>

            {/* Alternar a Repartidor o Tienda */}
            <button
              type="button"
              onClick={handleSwitchModeAndClose}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between text-left hover:border-emerald-500/60 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  {currentMode === "store" ? (
                    <Truck className="w-4 h-4" />
                  ) : (
                    <Store className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {currentMode === "store"
                      ? "Conectarse como Repartidor"
                      : "Ir a la Tienda de Compras"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentMode === "store"
                      ? "Ver radar de pedidos y ganar dinero"
                      : "Ver cortes cárnicos y hacer pedidos"}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Compartí y Gana */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Compartí y ganá</div>
                  <div className="text-[10px] text-slate-400">Descuentos en carnicería</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            {/* Integración Cobro Fácil en Render */}
            <a
              href="https://cobrofacil.onrender.com"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left hover:border-blue-500/40 transition-all block"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Cobro Fácil Cloud</div>
                  <div className="text-[10px] text-slate-400">Base de datos central</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </div>

          {/* 4. Footer con Cerrar Sesión (Nos vuelve a Tienda si estamos en Repartidor) */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseSession}
              className="w-full h-11 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>
                {currentMode === "driver"
                  ? "Cerrar Sesión Repartidor"
                  : clientProfile
                  ? "Cerrar Sesión Cliente"
                  : "Limpiar Sesión"}
              </span>
            </Button>
          </div>
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
