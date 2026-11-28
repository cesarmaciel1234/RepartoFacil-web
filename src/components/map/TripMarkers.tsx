import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { cn } from '@/lib/utils';
import { formatShortOrderCode } from '@/modulos/repartidor/motor/tipos';
import { createStoreBasketIcon, createOrderPinIcon } from './mapIcons';

export interface TripMarkersProps {
  currentActiveOrder: any;
  tripStoreCoords: [number, number];
  tripStoreName: string;
  tripStoreAddress: string;
  isOrderPickedUp: boolean;
  tripDestCoords: [number, number] | null;
  formatMoney: (val: number) => string;
  onSelectOrder?: (order: any) => void;
}

export function TripMarkers({
  currentActiveOrder,
  tripStoreCoords,
  tripStoreName,
  tripStoreAddress,
  isOrderPickedUp,
  tripDestCoords,
  formatMoney,
  onSelectOrder,
}: TripMarkersProps) {
  if (!currentActiveOrder) return null;

  return (
    <>
      {/* Parada 1: Retiro en Comercio */}
      <Marker
        position={tripStoreCoords}
        icon={createStoreBasketIcon(1, true)}
        zIndexOffset={2600}
      >
        <Popup>
          <div className="p-1 min-w-[170px] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🏪</span>
              <span className="font-black text-[10px] text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Parada 1: Retiro
              </span>
            </div>
            <p className="font-extrabold text-xs text-slate-900">{tripStoreName}</p>
            <p className="text-[10px] text-slate-500">{tripStoreAddress}</p>
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-500">Estado:</span>
              <span
                className={cn(
                  'font-black px-1.5 py-0.2 rounded',
                  isOrderPickedUp ? 'text-emerald-700 bg-emerald-50' : 'text-amber-800 bg-amber-50'
                )}
              >
                {isOrderPickedUp ? '✅ Ya retirado' : '⏳ Retirar en mostrador'}
              </span>
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Parada 2: Entrega en domicilio del cliente */}
      {tripDestCoords && (
        <Marker
          position={tripDestCoords}
          icon={createOrderPinIcon(currentActiveOrder.id, true, true)}
          zIndexOffset={2800}
        >
          <Popup>
            <div className="p-1 min-w-[170px] space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-900 border border-yellow-300">
                  Parada 2: Entrega
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-500">
                  {formatShortOrderCode(currentActiveOrder.id)}
                </span>
              </div>
              <p className="font-black text-xs text-slate-900">
                {currentActiveOrder.customerName || currentActiveOrder.clientName || 'Cliente'}
              </p>
              <p className="text-[10px] text-slate-600 line-clamp-2">
                📍 {currentActiveOrder.deliveryAddress}
              </p>
              <div className="flex items-center justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 font-semibold">Ganancia:</span>
                <span className="text-emerald-600 font-black">
                  +{formatMoney(currentActiveOrder.driverEarnings || 1600)}
                </span>
              </div>
              {onSelectOrder && (
                <button
                  type="button"
                  onClick={() => onSelectOrder(currentActiveOrder)}
                  className="w-full mt-1.5 py-1 px-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-[#2D3277] font-black text-[10px] shadow-xs active:scale-95 transition-all"
                >
                  Ver detalles / Chat
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}
