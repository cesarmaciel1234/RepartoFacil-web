import React from "react";
import { Layers, Truck, ShieldAlert, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RepartidorSheetTabsProps {
  activeTab: "pedidos" | "ruta" | "alerta" | "mensajes";
  onSelectTab: (tab: "pedidos" | "ruta" | "alerta" | "mensajes") => void;
  availableCount: number;
  activeOrdersCount: number;
  chatUnreadCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDragStart: (clientY: number) => void;
}

export function RepartidorSheetTabs({
  activeTab,
  onSelectTab,
  availableCount,
  activeOrdersCount,
  chatUnreadCount,
  isExpanded,
  onToggleExpand,
  onDragStart,
}: RepartidorSheetTabsProps) {
  return (
    <div className="w-full flex flex-col items-center pb-2 select-none">
      <button
        type="button"
        aria-label={isExpanded ? "Minimizar panel" : "Expandir panel"}
        className="w-full flex items-center justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={(e) => onDragStart(e.clientY)}
        onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
        onClick={onToggleExpand}
      >
        <span className="w-12 h-1.5 rounded-full bg-slate-300" />
      </button>
      <div className="w-full px-4">
        <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab("pedidos");
            }}
            className={cn(
              "min-w-0 flex-1 h-12 sm:h-10 rounded-xl px-1 transition-all flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1 text-[10px] sm:text-xs font-black relative",
              activeTab === "pedidos"
                ? "bg-[#FFE600] text-[#2D3277] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Disponibles</span>
            {availableCount > 0 && (
              <span className="absolute -top-1 -right-0.5 min-w-4 h-4 px-1 bg-white text-[#2D3277] border border-yellow-300 text-[9px] rounded-full font-bold">
                {availableCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab("ruta");
            }}
            className={cn(
              "min-w-0 flex-1 h-12 sm:h-10 rounded-xl px-1 transition-all flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1 text-[10px] sm:text-xs font-black relative",
              activeTab === "ruta"
                ? "bg-[#FFE600] text-[#2D3277] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Mi Ruta</span>
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-0.5 min-w-4 h-4 px-1 bg-yellow-100 text-yellow-900 border border-yellow-200 text-[9px] rounded-full font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab("alerta");
            }}
            className={cn(
              "min-w-0 flex-1 h-12 sm:h-10 rounded-xl px-1 transition-all flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1 text-[10px] sm:text-xs font-black relative",
              activeTab === "alerta"
                ? "bg-[#FFE600] text-[#2D3277] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Alertas</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab("mensajes");
            }}
            className={cn(
              "min-w-0 flex-1 h-12 sm:h-10 rounded-xl px-1 transition-all flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1 text-[10px] sm:text-xs font-black relative",
              activeTab === "mensajes"
                ? "bg-[#FFE600] text-[#2D3277] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            title="Mensajes de pedidos y Copo IA"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Mensajes</span>
            {chatUnreadCount > 0 && (
              <span className="absolute -top-1 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] rounded-full font-bold flex items-center justify-center shadow animate-pulse">
                {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
