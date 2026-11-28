import React from 'react';
import {
  Package,
  Wallet,
  Store,
  Tag,
  Headphones,
  QrCode,
  Truck,
  Gift,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export interface SidebarStoreViewProps {
  onOpenOrders?: () => void;
  onOpenWallet?: () => void;
  onOpenMarkets?: () => void;
  onSwitchModeAndClose: () => void;
  onClose: () => void;
}

export function SidebarStoreView({
  onOpenOrders,
  onOpenWallet,
  onOpenMarkets,
  onSwitchModeAndClose,
  onClose,
}: SidebarStoreViewProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Accesos Principales
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Mis Pedidos */}
          <button
            type="button"
            onClick={() => {
              onClose();
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
              onClose();
              if (onOpenWallet) onOpenWallet();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200">Billetera</span>
          </button>

          {/* Mercados */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenMarkets) onOpenMarkets();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-amber-400 flex items-center justify-center mb-1">
              <Store className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200">Mercados</span>
          </button>

          {/* Ofertas */}
          <button
            type="button"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-all text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-purple-400 flex items-center justify-center mb-1">
              <Tag className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-200">Ofertas</span>
          </button>

          {/* Ayuda */}
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

          {/* CobroFácil */}
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

      {/* Otras Funciones de Comprador */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Otras Funciones
        </span>

        {/* Alternar a Repartidor */}
        <button
          type="button"
          onClick={onSwitchModeAndClose}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between text-left hover:border-emerald-500/60 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Conectarse como Repartidor</div>
              <div className="text-[10px] text-slate-400">Ver radar de pedidos y ganar dinero</div>
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

        {/* Cobro Fácil Cloud */}
        <a
          href="https://cobrofacil.157.151.3.66.sslip.io"
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
  );
}
