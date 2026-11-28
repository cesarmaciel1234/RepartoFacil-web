import React from 'react';
import L from 'leaflet';
import { Truck, AlertTriangle } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cn } from '@/lib/utils';
import { formatShortOrderCode } from '@/modulos/repartidor/motor/tipos';

export const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

export const getVehicleEmoji = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('bici') || t.includes('bicycle')) return '🚲';
  if (t.includes('auto') || t.includes('car')) return '🚗';
  return '🛵';
};

export const createSelfDriverIcon = (vehicleType?: string, heading: number = 0) => {
  const emoji = getVehicleEmoji(vehicleType);
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div className="w-11 h-11 rounded-full bg-[#FFE600] border-[2.5px] border-[#2D3277] shadow-xl flex items-center justify-center text-xl transition-transform">
        <span style={{ display: 'inline-block', transform: heading ? `rotate(${heading}deg)` : undefined }}>
          {emoji}
        </span>
      </div>
      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
      <div className="absolute w-14 h-14 bg-yellow-400/20 rounded-full animate-ping pointer-events-none" />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'self-driver-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

export const createFleetDriverIcon = (vehicleType?: string, isBusy: boolean = false) => {
  const emoji = getVehicleEmoji(vehicleType);
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 shadow-md flex items-center justify-center text-base">
        {emoji}
      </div>
      <div
        className={cn(
          'absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
          isBusy ? 'bg-amber-500' : 'bg-emerald-500'
        )}
      />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'fleet-driver-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const createStoreBasketIcon = (count: number = 0, isParada1: boolean = false) => {
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex flex-col items-center">
      <div
        className={cn(
          'w-10 h-10 rounded-2xl border-2 shadow-xl flex items-center justify-center text-lg text-white',
          isParada1 ? 'bg-amber-500 border-amber-300' : 'bg-[#047857] border-white'
        )}
      >
        {isParada1 ? '🏪' : '🧺'}
      </div>
      {isParada1 ? (
        <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-[#2D3277] text-white border border-yellow-300 text-[8.5px] font-black uppercase shadow tracking-wider">
          Parada 1
        </span>
      ) : count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-slate-900 border border-white text-[9px] font-black flex items-center justify-center shadow">
          {count}
        </span>
      ) : null}
      <div
        className={cn(
          'w-2.5 h-2.5 rotate-45 border-r border-b -mt-1 shadow-xs',
          isParada1 ? 'bg-amber-500 border-amber-300' : 'bg-[#047857] border-white'
        )}
      />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'store-basket-icon',
    iconSize: [44, 46],
    iconAnchor: [22, 46],
  });
};

export const createOrderPinIcon = (orderId: string, isMyRoute: boolean = false, isParada2: boolean = false) => {
  const shortFormatted = formatShortOrderCode(orderId);
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex flex-col items-center">
      <div
        className={cn(
          'px-2 py-0.5 rounded-xl border-2 shadow-lg flex items-center gap-1 text-[10px] font-black tracking-tight',
          isMyRoute
            ? 'bg-[#FFE600] border-[#2D3277] text-[#2D3277] ring-2 ring-yellow-400/40'
            : 'bg-blue-600 border-white text-white'
        )}
      >
        <span>📦</span>
        <span>{shortFormatted}</span>
        {isParada2 && (
          <span className="ml-1 text-[8px] bg-[#2D3277] text-yellow-300 px-1 py-0.2 rounded font-black uppercase">
            Parada 2
          </span>
        )}
      </div>
      <div
        className={cn(
          'w-2 h-2 rotate-45 -mt-1 border-r border-b',
          isMyRoute ? 'bg-[#FFE600] border-[#2D3277]' : 'bg-blue-600 border-white'
        )}
      />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'order-pin-icon',
    iconSize: [isParada2 ? 94 : 70, 30],
    iconAnchor: [isParada2 ? 47 : 35, 30],
  });
};

export const createDriverIcon = (color: string, isBusy: boolean = false, isSOS: boolean = false) => {
  const iconHtml = renderToStaticMarkup(
    <div className="relative">
      {isSOS && <div className="absolute -inset-6 bg-red-500/30 rounded-full animate-ping" />}
      <div
        className={cn(
          'w-11 h-11 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center transition-all duration-500',
          isSOS ? 'bg-red-600 animate-pulse scale-110' : isBusy ? 'bg-orange-500' : 'bg-slate-900'
        )}
      >
        {isSOS ? (
          <AlertTriangle className="w-6 h-6 text-white fill-current animate-bounce" />
        ) : (
          <Truck className="w-5 h-5 text-white" />
        )}
      </div>
      {(isBusy || isSOS) && (
        <div
          className={cn(
            'absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md',
            isSOS ? 'bg-red-500' : 'bg-orange-400'
          )}
        >
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        </div>
      )}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-200" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-driver-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
};

export const getAlertColor = (type: string) => {
  switch (type) {
    case 'policia':
      return '#2563eb';
    case 'accidente':
      return '#dc2626';
    case 'trafico':
      return '#d97706';
    case 'obras':
      return '#059669';
    case 'sos':
      return '#ef4444';
    default:
      return '#64748b';
  }
};
