import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ClientProfile } from '@/modulos/repartidor/motor/driverService';
import { DriverProfile } from '@/modulos/repartidor/motor/tipos';

export interface SidebarHeaderProps {
  isDriverMode: boolean;
  userInitial: string;
  userName: string;
  currentMode: 'store' | 'driver';
  clientProfile: ClientProfile | null;
  activeDriverProfile: DriverProfile | null;
  driverStatusLabel: string;
  onOpenClientAuth: () => void;
  onOpenDriverLogin: () => void;
}

export function SidebarHeader({
  isDriverMode,
  userInitial,
  userName,
  currentMode,
  clientProfile,
  activeDriverProfile,
  driverStatusLabel,
  onOpenClientAuth,
  onOpenDriverLogin,
}: SidebarHeaderProps) {
  return (
    <div
      className={`flex items-center gap-3 ${
        isDriverMode
          ? 'rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-white p-4 shadow-sm'
          : 'pb-4 border-b border-slate-800/80'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm shrink-0 ${
          isDriverMode
            ? 'bg-[#FFE600] border border-yellow-500 text-[#2D3277]'
            : 'rounded-full bg-slate-800 border-2 border-emerald-500/40 text-white shadow-lg'
        }`}
      >
        {userInitial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-base truncate block ${
              isDriverMode ? 'text-slate-900' : 'text-white'
            }`}
          >
            {userName}
          </span>
        </div>
        <span
          className={`text-xs block truncate ${
            isDriverMode ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {currentMode === 'driver'
            ? 'Perfil de repartidor'
            : clientProfile
            ? `Comprador · ${clientProfile.displayName || 'Cliente Registrado'}`
            : 'Comprador · Ecosistema Reparto Fácil'}
        </span>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <Badge
            className={
              currentMode === 'driver'
                ? 'bg-yellow-100 text-[#2D3277] border border-yellow-300 text-[9px] font-bold py-0'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold py-0'
            }
          >
            {currentMode === 'driver'
              ? driverStatusLabel
              : clientProfile
              ? 'Cliente Registrado'
              : 'Modo Tienda'}
          </Badge>

          {/* Botón Iniciar Sesión Cliente si está en modo tienda y no está logueado */}
          {currentMode === 'store' && !clientProfile && (
            <button
              type="button"
              onClick={onOpenClientAuth}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Iniciar Sesión
            </button>
          )}

          {/* Botón Iniciar Sesión Repartidor si está en modo repartidor y no está logueado */}
          {currentMode === 'driver' && !activeDriverProfile && (
            <button
              type="button"
              onClick={onOpenDriverLogin}
              className="text-[10px] font-bold text-yellow-800 hover:text-yellow-900 underline underline-offset-2"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
