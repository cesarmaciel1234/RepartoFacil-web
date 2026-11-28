import React from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import { cn } from '@/lib/utils';
import { formatShortOrderCode } from '@/modulos/repartidor/motor/tipos';
import {
  createStoreBasketIcon,
  createOrderPinIcon,
  createFleetDriverIcon,
  getVehicleEmoji,
} from './mapIcons';

export interface ExplorationMarkersProps {
  previewDestCoords: [number, number] | null;
  previewStoreCoords: [number, number];
  storesMap: Map<string, { name: string; address: string; coords: [number, number]; count: number }>;
  availableOrders?: any[] | null;
  previewOrder?: any | null;
  onSelectPreviewOrder?: (order: any) => void;
  hasActiveOrder: boolean;
  onTakeOrder?: (orderId: string) => void;
  effectiveFleet: any[];
  currentUserId?: string;
  formatMoney: (val: number) => string;
}

export function ExplorationMarkers({
  previewDestCoords,
  previewStoreCoords,
  storesMap,
  availableOrders,
  previewOrder,
  onSelectPreviewOrder,
  hasActiveOrder,
  onTakeOrder,
  effectiveFleet,
  currentUserId,
  formatMoney,
}: ExplorationMarkersProps) {
  return (
    <>
      {/* Línea punteada celeste conectando Negocio con Destino del pedido seleccionado */}
      {previewDestCoords && (
        <Polyline
          positions={[previewStoreCoords, previewDestCoords]}
          pathOptions={{
            color: '#0284c7',
            dashArray: '8, 8',
            weight: 4,
            opacity: 0.9,
          }}
        />
      )}

      {/* 1. Tiendas / Comercios en Exploración */}
      {Array.from(storesMap.values()).map((store, idx) => (
        <Marker
          key={`store-${idx}`}
          position={store.coords}
          icon={createStoreBasketIcon(store.count, false)}
          zIndexOffset={1500}
        >
          <Popup>
            <div className="p-1 min-w-[150px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">🧺</span>
                <span className="font-black text-xs text-emerald-950 uppercase tracking-tight">
                  Comercio / Retiro
                </span>
              </div>
              <p className="font-extrabold text-xs text-slate-900">{store.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{store.address}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-black">
                <span>
                  📦 {store.count} pedido{store.count === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* 2. Paquetes Disponibles en Azul */}
      {(availableOrders || []).map((order) => {
        if (!order?.destinationCoords?.lat || !order?.destinationCoords?.lng) return null;
        const pos: [number, number] = [order.destinationCoords.lat, order.destinationCoords.lng];
        const shortTicket = formatShortOrderCode(order.id);
        const isSelectedPreview = previewOrder?.id === order.id;

        return (
          <Marker
            key={`order-pin-${order.id}`}
            position={pos}
            icon={createOrderPinIcon(order.id, false, false)}
            zIndexOffset={isSelectedPreview ? 2500 : 1800}
            eventHandlers={{
              click: () => onSelectPreviewOrder?.(order),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[170px] space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                    ✨ Disponible
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-500">{shortTicket}</span>
                </div>
                <p className="font-black text-xs text-slate-900">
                  {order.customerName || order.clientName || 'Cliente'}
                </p>
                <p className="text-[10px] text-slate-600 line-clamp-2">📍 {order.deliveryAddress}</p>
                <div className="flex items-center justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold">Ganancia:</span>
                  <span className="text-emerald-600 font-black">
                    +{formatMoney(order.driverEarnings || 1600)}
                  </span>
                </div>
                {hasActiveOrder ? (
                  <div className="w-full mt-1.5 py-1 px-2 rounded-lg bg-slate-100 text-slate-500 text-[9.5px] font-bold text-center border border-slate-200">
                    Completá tu entrega actual para tomar otro pedido
                  </div>
                ) : onTakeOrder ? (
                  <button
                    type="button"
                    onClick={() => onTakeOrder(order.id)}
                    className="w-full mt-1.5 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] shadow-xs active:scale-95 transition-all"
                  >
                    Aceptar y llevar 🛵
                  </button>
                ) : null}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* 3. Flota en Exploración */}
      {effectiveFleet.map((driver) => {
        if (typeof driver.currentLatitude !== 'number' || typeof driver.currentLongitude !== 'number')
          return null;
        if (driver.id === currentUserId) return null;
        const vehicle = driver.vehicleType || 'Motorcycle';
        return (
          <Marker
            key={`fleet-${driver.id}`}
            position={[driver.currentLatitude, driver.currentLongitude]}
            icon={createFleetDriverIcon(vehicle, Boolean(driver.isBusy))}
            zIndexOffset={800}
          >
            <Popup>
              <div className="p-1 min-w-[120px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{getVehicleEmoji(vehicle)}</span>
                  <span
                    className={cn(
                      'font-black text-[9px] uppercase px-1.5 py-0.5 rounded-full inline-block',
                      driver.isBusy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    )}
                  >
                    {driver.isBusy ? 'En viaje' : 'En línea'}
                  </span>
                </div>
                <p className="font-black text-xs text-slate-900">
                  {driver.firstName} {driver.lastName || ''}
                </p>
                <p className="text-[9.5px] text-slate-500">
                  {vehicle === 'Bicycle' ? 'Bicicleta' : vehicle === 'Car' ? 'Automóvil' : 'Motocicleta'}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
