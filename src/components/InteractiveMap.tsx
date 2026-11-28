'use client';

import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Navigation as NavIcon } from 'lucide-react';
import { STORE_DEFAULT_DERQUI } from '@/modulos/repartidor/motor/tipos';
import {
  fixLeafletIcons,
  getVehicleEmoji,
  createSelfDriverIcon,
  getAlertColor,
} from './map/mapIcons';
import { useMapRoutes } from './map/useMapRoutes';
import { MapController } from './map/MapController';
import { TripMarkers } from './map/TripMarkers';
import { ExplorationMarkers } from './map/ExplorationMarkers';

export interface InteractiveMapProps {
  center: [number, number];
  destination?: [number, number] | null;
  alerts?: any[] | null;
  activeOrders?: any[] | null;
  availableOrders?: any[] | null;
  previewOrder?: any | null;
  onSelectPreviewOrder?: (order: any) => void;
  hasActiveOrder?: boolean;
  isOrderPickedUp?: boolean;
  fleet?: any[] | null;
  heading?: number;
  zoom?: number;
  isNavigating?: boolean;
  centerTrigger?: number;
  currentUserId?: string;
  driverVehicle?: string;
  onSelectOrder?: (order: any) => void;
  onTakeOrder?: (orderId: string) => void;
}

export default function InteractiveMap({
  center,
  destination,
  alerts,
  activeOrders,
  availableOrders,
  previewOrder,
  onSelectPreviewOrder,
  hasActiveOrder = false,
  isOrderPickedUp = false,
  fleet,
  heading = 0,
  zoom = 14,
  isNavigating = false,
  centerTrigger = 0,
  currentUserId,
  driverVehicle = 'Motorcycle',
  onSelectOrder,
  onTakeOrder,
}: InteractiveMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const routes = useMapRoutes(center, destination);
  const formatMoney = (val: number) => '$' + (Number(val) || 0).toLocaleString('es-AR');

  useEffect(() => {
    setIsMounted(true);
    fixLeafletIcons();
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-200 animate-pulse flex items-center justify-center">
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
          Cargando Monitor de Flota Biz...
        </p>
      </div>
    );
  }

  // Detectar Modo en Viaje: repartidor tiene un pedido activo asignado
  const isInTripMode = Boolean(hasActiveOrder || (activeOrders && activeOrders.length > 0));
  const currentActiveOrder = activeOrders && activeOrders.length > 0 ? activeOrders[0] : null;

  // En Modo En Viaje: Coordenadas de la Parada 1 (Tienda) y Parada 2 (Cliente)
  const tripStoreCoords: [number, number] =
    currentActiveOrder?.storeCoords?.lat && currentActiveOrder?.storeCoords?.lng
      ? [currentActiveOrder.storeCoords.lat, currentActiveOrder.storeCoords.lng]
      : [STORE_DEFAULT_DERQUI.coords.lat, STORE_DEFAULT_DERQUI.coords.lng];
  const tripStoreName = currentActiveOrder?.branch || STORE_DEFAULT_DERQUI.name;
  const tripStoreAddress = STORE_DEFAULT_DERQUI.address;

  const tripDestCoords: [number, number] | null =
    currentActiveOrder?.destinationCoords?.lat && currentActiveOrder?.destinationCoords?.lng
      ? [currentActiveOrder.destinationCoords.lat, currentActiveOrder.destinationCoords.lng]
      : null;

  // En Modo Exploración: Conexión entre Negocio de origen y entrega al tocar un paquete azul
  const previewStoreCoords: [number, number] =
    previewOrder?.storeCoords?.lat && previewOrder?.storeCoords?.lng
      ? [previewOrder.storeCoords.lat, previewOrder.storeCoords.lng]
      : [STORE_DEFAULT_DERQUI.coords.lat, STORE_DEFAULT_DERQUI.coords.lng];

  const previewDestCoords: [number, number] | null =
    previewOrder?.destinationCoords?.lat && previewOrder?.destinationCoords?.lng
      ? [previewOrder.destinationCoords.lat, previewOrder.destinationCoords.lng]
      : null;

  // Tiendas para Modo Exploración
  const storesMap = new Map<string, { name: string; address: string; coords: [number, number]; count: number }>();
  if (!isInTripMode) {
    storesMap.set('maciel-derqui', {
      name: STORE_DEFAULT_DERQUI.name,
      address: STORE_DEFAULT_DERQUI.address,
      coords: [STORE_DEFAULT_DERQUI.coords.lat, STORE_DEFAULT_DERQUI.coords.lng],
      count: availableOrders?.length || 0,
    });

    (availableOrders || []).forEach((o) => {
      if (o?.storeCoords?.lat && o?.storeCoords?.lng) {
        const key = `${o.storeCoords.lat},${o.storeCoords.lng}`;
        const existing = storesMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          storesMap.set(key, {
            name: o.branch || STORE_DEFAULT_DERQUI.name,
            address: o.branch || STORE_DEFAULT_DERQUI.address,
            coords: [o.storeCoords.lat, o.storeCoords.lng],
            count: 1,
          });
        }
      }
    });
  }

  // Flota simulada solo para Modo Exploración
  const effectiveFleet =
    !isInTripMode && fleet && fleet.length > 0
      ? fleet
      : !isInTripMode
      ? [
          {
            id: 'fleet-1',
            firstName: 'Lucas',
            lastName: 'M.',
            vehicleType: 'Motorcycle',
            currentLatitude: center[0] + 0.0035,
            currentLongitude: center[1] + 0.0028,
            isBusy: false,
          },
          {
            id: 'fleet-2',
            firstName: 'Marcos',
            lastName: 'B.',
            vehicleType: 'Bicycle',
            currentLatitude: center[0] - 0.0032,
            currentLongitude: center[1] + 0.0045,
            isBusy: true,
          },
        ]
      : [];

  return (
    <div className="h-full w-full relative overflow-hidden bg-slate-100">
      <div
        className={cn(
          'h-full w-full',
          isNavigating
            ? 'scale-[1.4] transition-transform duration-150 ease-out'
            : 'transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]'
        )}
        style={{
          transform: isNavigating ? `rotate(${-heading}deg)` : 'none',
          transformOrigin: 'center center',
        }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routes.alternatives.map((altPath, idx) => (
            <Polyline
              key={`alt-${idx}`}
              positions={altPath}
              color="#94a3b8"
              weight={5}
              opacity={0.3}
              lineCap="round"
            />
          ))}

          {routes.main.length > 0 && (
            <Polyline
              positions={routes.main}
              color="#2563eb"
              weight={9}
              opacity={0.9}
              lineCap="round"
            />
          )}

          {alerts?.map((alert) => {
            if (typeof alert.latitude !== 'number' || typeof alert.longitude !== 'number') return null;
            const baseColor = getAlertColor(alert.type);
            return (
              <div key={alert.id}>
                <Circle
                  center={[alert.latitude, alert.longitude]}
                  radius={200}
                  pathOptions={{ fillColor: baseColor, fillOpacity: 0.05, color: 'transparent', weight: 0 }}
                />
                <Circle
                  center={[alert.latitude, alert.longitude]}
                  radius={60}
                  pathOptions={{ fillColor: baseColor, fillOpacity: 0.3, color: baseColor, weight: 2, opacity: 0.4 }}
                >
                  <Popup className="alert-popup">
                    <div className="p-2 min-w-[140px]">
                      <p
                        className="font-black text-[10px] uppercase tracking-widest mb-1"
                        style={{ color: baseColor }}
                      >
                        {alert.label}
                      </p>
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {alert.description || 'Incidencia detectada'}
                      </p>
                    </div>
                  </Popup>
                </Circle>
              </div>
            );
          })}

          {/* MODO EN VIAJE: Repartidor, Parada 1 (Tienda) y Parada 2 (Cliente) */}
          {isInTripMode && (
            <TripMarkers
              currentActiveOrder={currentActiveOrder}
              tripStoreCoords={tripStoreCoords}
              tripStoreName={tripStoreName}
              tripStoreAddress={tripStoreAddress}
              isOrderPickedUp={isOrderPickedUp}
              tripDestCoords={tripDestCoords}
              formatMoney={formatMoney}
              onSelectOrder={onSelectOrder}
            />
          )}

          {/* MODO EXPLORACIÓN: Comercios, Paquetes Disponibles y Flota */}
          {!isInTripMode && (
            <ExplorationMarkers
              previewDestCoords={previewDestCoords}
              previewStoreCoords={previewStoreCoords}
              storesMap={storesMap}
              availableOrders={availableOrders}
              previewOrder={previewOrder}
              onSelectPreviewOrder={onSelectPreviewOrder}
              hasActiveOrder={hasActiveOrder}
              onTakeOrder={onTakeOrder}
              effectiveFleet={effectiveFleet}
              currentUserId={currentUserId}
              formatMoney={formatMoney}
            />
          )}

          {!isInTripMode && destination && typeof destination[0] === 'number' && typeof destination[1] === 'number' && (
            <Marker position={destination}>
              <Popup>
                <div className="p-1">
                  <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">DESTINO</p>
                  <p className="font-bold text-xs text-slate-900">Punto de Entrega</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcador del propio usuario/repartidor con su vehículo real */}
          {!isNavigating && center && (
            <Marker
              position={center}
              icon={createSelfDriverIcon(driverVehicle, heading)}
              zIndexOffset={3000}
            >
              <Popup>
                <div className="p-1 min-w-[130px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg">{getVehicleEmoji(driverVehicle)}</span>
                    <span className="font-black text-[9px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      Tu posición activa
                    </span>
                  </div>
                  <p className="font-black text-xs text-slate-900">
                    {driverVehicle === 'Bicycle' ? 'Bicicleta' : driverVehicle === 'Car' ? 'Automóvil' : 'Motocicleta'}
                  </p>
                  <p className="text-[10px] text-slate-500">Rumbo: {Math.round(heading)}°</p>
                </div>
              </Popup>
            </Marker>
          )}

          <MapController
            center={center}
            heading={heading}
            isNavigating={isNavigating}
            centerTrigger={centerTrigger}
          />
          {!isNavigating && <ZoomControl position="bottomright" />}
        </MapContainer>
      </div>

      {isNavigating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
          <div className="relative flex items-center justify-center scale-150">
            <div className="w-12 h-12 bg-blue-600 rounded-full shadow-[0_0_35px_rgba(37,99,235,0.7)] border-4 border-white flex items-center justify-center">
              <NavIcon className="w-7 h-7 text-white fill-current -rotate-45" />
            </div>
            <div className="absolute w-24 h-24 bg-blue-400/20 rounded-full animate-ping" />
          </div>
        </div>
      )}
    </div>
  );
}
