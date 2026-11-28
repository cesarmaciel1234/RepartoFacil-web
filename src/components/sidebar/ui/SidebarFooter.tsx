import React from 'react';
import { Button } from '@/components/ui/button';
import { AppVersion } from '@/components/AppVersion';
import { RefreshCw, LogOut } from 'lucide-react';
import { ClientProfile } from '@/modulos/repartidor/motor/driverService';

export interface SidebarFooterProps {
  isDriverMode: boolean;
  currentMode: 'store' | 'driver';
  clientProfile: ClientProfile | null;
  onClearCache: () => void;
  onCloseSession: () => void;
}

export function SidebarFooter({
  isDriverMode,
  currentMode,
  clientProfile,
  onClearCache,
  onCloseSession,
}: SidebarFooterProps) {
  return (
    <div
      className={`p-4 border-t space-y-2 ${
        isDriverMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <AppVersion dark={!isDriverMode} />
      <Button
        type="button"
        variant="outline"
        onClick={onClearCache}
        className={`w-full h-10 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
          isDriverMode
            ? 'bg-yellow-100 hover:bg-yellow-200 text-[#2D3277] border-yellow-300'
            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border-emerald-500/30'
        }`}
        title="Borrar caché guardada offline y recargar la aplicación"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${isDriverMode ? 'text-yellow-800' : 'text-emerald-400'}`}
        />
        <span>Buscar actualización (Limpiar Caché)</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onCloseSession}
        className={`w-full h-11 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
          isDriverMode
            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
            : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border-red-500/30'
        }`}
      >
        <LogOut className={`w-4 h-4 ${isDriverMode ? 'text-red-600' : 'text-red-400'}`} />
        <span>
          {currentMode === 'driver'
            ? 'Cerrar Sesión Repartidor'
            : clientProfile
            ? 'Cerrar Sesión Cliente'
            : 'Limpiar Sesión'}
        </span>
      </Button>
    </div>
  );
}
