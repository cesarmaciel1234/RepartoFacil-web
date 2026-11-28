import React from 'react';
import {
  Truck,
  Wallet,
  History,
  Navigation,
  Headphones,
  QrCode,
  Bike,
  ShieldCheck,
  User,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export interface SidebarDriverViewProps {
  walletBalance: number;
  formatMoney: (val: number) => string;
  driverVehicleLabel: string;
  driverStatusLabel: string;
  driverIdLabel: string;
  onOpenWallet?: () => void;
  onOpenOrders?: () => void;
  onClose: () => void;
}

export function SidebarDriverView({
  walletBalance,
  formatMoney,
  driverVehicleLabel,
  driverStatusLabel,
  driverIdLabel,
  onOpenWallet,
  onOpenOrders,
  onClose,
}: SidebarDriverViewProps) {
  return (
    <div className="space-y-4">
      {onOpenWallet && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenWallet();
          }}
          className="w-full rounded-3xl border border-yellow-300 bg-[#FFE600] p-4 text-left shadow-sm transition hover:bg-yellow-300 active:scale-[0.99]"
        >
          <span className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#2D3277]">
            Ganancias disponibles
            <ChevronRight className="h-4 w-4" />
          </span>
          <span className="mt-1 block text-2xl font-black tracking-tight text-[#2D3277]">
            {formatMoney(walletBalance)}
          </span>
          <span className="mt-1 block text-[11px] font-semibold text-slate-700">
            Ver movimientos y efectivo rendido
          </span>
        </button>
      )}

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider block">
          Herramientas de Repartidor
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Mi Ruta */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenOrders) onOpenOrders();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-yellow-100 text-[#2D3277] flex items-center justify-center mb-1">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Mi Ruta</span>
          </button>

          {/* Mi Billetera */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenWallet) onOpenWallet();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-yellow-100 text-[#2D3277] flex items-center justify-center mb-1">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Billetera</span>
          </button>

          {/* Historial de Entregas */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenWallet) onOpenWallet();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-slate-500 group-hover:text-[#2D3277] flex items-center justify-center mb-1">
              <History className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Historial</span>
          </button>

          {/* Mapa GPS */}
          <button
            type="button"
            onClick={onClose}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-slate-500 group-hover:text-[#2D3277] flex items-center justify-center mb-1">
              <Navigation className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Mapa GPS</span>
          </button>

          {/* Soporte Chofer */}
          <a
            href="https://wa.me/5493415551234?text=Hola,%20solicito%20soporte%20operativo%20de%20reparto"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-slate-500 group-hover:text-[#2D3277] flex items-center justify-center mb-1">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Soporte</span>
          </a>

          {/* Cobro Fácil QR / TPV */}
          <a
            href="https://cobrofacil.157.151.3.66.sslip.io"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-slate-500 group-hover:text-[#2D3277] flex items-center justify-center mb-1">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">CobroFácil</span>
          </a>
        </div>
      </div>

      {/* Ficha Operativa del Repartidor */}
      <div className="space-y-2 pt-3 border-t border-slate-200">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Información del repartidor
        </span>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Bike className="w-3.5 h-3.5 text-yellow-700" />
              Vehículo:
            </span>
            <span className="text-slate-900 font-bold">{driverVehicleLabel}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-700" />
              Estado:
            </span>
            <span className="text-slate-900 font-bold">{driverStatusLabel}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-yellow-700" />
              ID de repartidor:
            </span>
            <span className="text-slate-900 font-bold">{driverIdLabel}</span>
          </div>
        </div>

        {/* Enlace Directo a Cobro Fácil Cloud */}
        <a
          href="https://cobrofacil.157.151.3.66.sslip.io"
          target="_blank"
          rel="noreferrer"
          className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-left hover:border-yellow-400 hover:bg-yellow-50 transition-all block"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-yellow-100 text-[#2D3277] flex items-center justify-center">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Cobro Fácil Cloud</div>
              <div className="text-[10px] text-slate-500">Base de datos PostgreSQL central</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
