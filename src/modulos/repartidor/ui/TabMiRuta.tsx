"use client";

import React, { useState, useEffect } from "react";
import { DriverOrder } from "../motor/tipos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MapPin,
  Navigation,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  Target,
  Banknote,
  Gauge,
  Sparkles,
} from "lucide-react";

interface TabMiRutaProps {
  activeOrders: DriverOrder[];
  onCompleteDelivery: (orderId: string) => void;
  onSimulateGpsCoord?: (lat: number, lng: number) => void;
}

export function TabMiRuta({
  activeOrders,
  onCompleteDelivery,
  onSimulateGpsCoord,
}: TabMiRutaProps) {
  const formatMoney = (val: number) => "$" + (val || 0).toLocaleString("es-AR");

  // Estados de navegación simulada por pedido
  const [navState, setNavState] = useState<{
    [orderId: string]: {
      distanceMeters: number;
      isSimulating: boolean;
      speedKmh: number;
    };
  }>({});

  // Inicializar distancias para pedidos nuevos en ruta
  useEffect(() => {
    setNavState((prev) => {
      const next = { ...prev };
      activeOrders.forEach((o) => {
        if (!next[o.id]) {
          // Distancia inicial en metros (~1.200 a 1.800m según la orden)
          const initialMeters = Math.round((o.distanceToDeliveryKm || o.distanceKm || 1.4) * 1000);
          next[o.id] = {
            distanceMeters: initialMeters,
            isSimulating: false,
            speedKmh: 0,
          };
        }
      });
      return next;
    });
  }, [activeOrders]);

  // Bucle de simulación en marcha
  useEffect(() => {
    const interval = setInterval(() => {
      setNavState((prev) => {
        let changed = false;
        const next = { ...prev };

        Object.keys(next).forEach((id) => {
          if (next[id].isSimulating && next[id].distanceMeters > 20) {
            changed = true;
            // Reduce entre 120m y 250m por segundo (simulando moto a 35-45 km/h)
            const step = Math.min(next[id].distanceMeters - 15, Math.floor(150 + Math.random() * 80));
            const newDist = Math.max(15, next[id].distanceMeters - step);
            const speed = newDist <= 50 ? 0 : Math.floor(32 + Math.random() * 12);

            next[id] = {
              ...next[id],
              distanceMeters: newDist,
              speedKmh: speed,
              isSimulating: newDist > 20,
            };
          }
        });

        return changed ? next : prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const toggleSimulation = (orderId: string) => {
    setNavState((prev) => {
      const cur = prev[orderId] || { distanceMeters: 1200, isSimulating: false, speedKmh: 0 };
      const nextSim = !cur.isSimulating;
      return {
        ...prev,
        [orderId]: {
          ...cur,
          isSimulating: nextSim,
          speedKmh: nextSim ? 36 : 0,
        },
      };
    });
  };

  const jumpToDoor = (orderId: string) => {
    setNavState((prev) => ({
      ...prev,
      [orderId]: {
        distanceMeters: 60, // 60 metros del domicilio (dentro de geocerca de 100m)
        isSimulating: false,
        speedKmh: 0,
      },
    }));
  };

  if (activeOrders.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <Navigation className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No tenés pedidos en tu ruta activa</h4>
        <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
          Pasá a la pestaña "Disponibles" para tomar un pedido y comenzar el reparto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {activeOrders.map((order) => {
        const client = order.clientName || order.customerName || "Cliente";
        const state = navState[order.id] || {
          distanceMeters: 1200,
          isSimulating: false,
          speedKmh: 0,
        };
        const isWithin100m = state.distanceMeters <= 100;
        const isCash =
          order.paymentMethod === "cash" ||
          order.paymentMethod === ("efectivo" as any) ||
          !order.paymentMethod;
        const earnings =
          order.driverEarnings || Math.max(1600, Math.round((order.deliveryFee || 2000) * 0.85));

        return (
          <div
            key={order.id}
            className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-4 space-y-3.5 shadow-2xl shadow-black/60"
          >
            {/* Header del Pedido Activo */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white">#{order.id}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5">
                    EN CURSO
                  </Badge>
                </div>
                <span className="text-xs font-bold text-slate-300 block mt-0.5">{client}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Tu ganancia
                </span>
                <span className="text-base font-black text-emerald-400">
                  +{formatMoney(earnings)}
                </span>
              </div>
            </div>

            {/* Dirección de Entrega */}
            <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
              <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 text-[10px] font-semibold block">
                  Destino de entrega:
                </span>
                <span className="font-bold text-white text-xs">{order.deliveryAddress}</span>
              </div>
            </div>

            {/* Panel de Navegación GPS en Marcha + Geocerca 100m */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">GPS en Vivo:</span>
                  <span className="text-emerald-400 font-mono">
                    {state.isSimulating ? `${state.speedKmh} km/h` : "Detenido"}
                  </span>
                </div>

                <div className="font-mono text-xs font-black">
                  {state.distanceMeters >= 1000 ? (
                    <span className="text-slate-200">
                      {(state.distanceMeters / 1000).toFixed(1)} km al cliente
                    </span>
                  ) : (
                    <span className={isWithin100m ? "text-emerald-400 animate-pulse" : "text-amber-300"}>
                      {state.distanceMeters} m al cliente
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de progreso de proximidad */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isWithin100m ? "bg-emerald-400" : "bg-emerald-500/60"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, ((1500 - state.distanceMeters) / 1500) * 100))}%`,
                  }}
                />
              </div>

              {/* Controles de Simulación GPS */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => toggleSimulation(order.id)}
                  className={`h-9 rounded-xl text-xs font-bold border transition-all ${
                    state.isSimulating
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-800 text-slate-200 border-slate-700 hover:text-white"
                  }`}
                >
                  {state.isSimulating ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1" /> Pausar Marcha
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Simular en Marcha
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => jumpToDoor(order.id)}
                  className="h-9 rounded-xl text-xs font-bold bg-slate-800 border-slate-700 text-slate-200 hover:text-emerald-300"
                >
                  <Target className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Llegar (60m)
                </Button>
              </div>
            </div>

            {/* Aviso de cobro en efectivo */}
            {isCash && (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Banknote className="w-4 h-4 shrink-0" />
                  <span>Cobrar en Efectivo al Entregar:</span>
                </div>
                <span className="text-sm font-black text-amber-400">
                  {formatMoney(order.total)}
                </span>
              </div>
            )}

            {/* Botón de Entrega: Condicionado a Geocerca <= 100 metros */}
            <div>
              {!isWithin100m ? (
                <div className="space-y-1">
                  <Button
                    disabled
                    className="w-full h-12 rounded-2xl bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700/60"
                  >
                    <Lock className="w-4 h-4" />
                    <span>ENTREGA BLOQUEADA (A {state.distanceMeters}m del domicilio)</span>
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 font-medium">
                    🛡️ Regla de seguridad: el botón se activará automáticamente a menos de 100 metros del cliente.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Button
                    onClick={() => onCompleteDelivery(order.id)}
                    className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 animate-pulse active:scale-98 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>CONFIRMAR ENTREGA (+$ {earnings.toLocaleString("es-AR")})</span>
                  </Button>
                  <p className="text-[10px] text-center text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ¡Llegaste a destino! Botón de entrega habilitado (a {state.distanceMeters}m).
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
