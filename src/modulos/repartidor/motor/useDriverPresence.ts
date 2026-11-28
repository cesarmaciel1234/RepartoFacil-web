import { useEffect } from "react";
import { authHeaders } from "@/lib/clientAuth";
import { useScreenWakeLock, requestNotificationPermission } from "@/lib/browserIntegration";

export interface UseDriverPresenceParams {
  driverId?: string;
  hasActiveOrders: boolean;
  isNavigating: boolean;
  coords: { lat: number; lng: number } | null;
}

export function useDriverPresence({
  driverId,
  hasActiveOrders,
  isNavigating,
  coords,
}: UseDriverPresenceParams) {
  // Mantener la pantalla encendida durante navegación activa o entregas en curso (PWA WakeLock)
  useScreenWakeLock(hasActiveOrders || isNavigating);

  // Solicitar permiso de notificaciones nativas del navegador al iniciar actividad como repartidor
  useEffect(() => {
    if (driverId) {
      void requestNotificationPermission();
    }
  }, [driverId]);

  // Prueba de Vida del Repartidor: envía lat/lng y renueva driver_last_ping periódicamente
  useEffect(() => {
    if (!driverId) return;
    let active = true;

    const emitirPruebaDeVida = async () => {
      if (!active) return;
      try {
        const currentCoords =
          typeof navigator !== "undefined" && navigator.geolocation
            ? await new Promise<{ lat?: number; lng?: number }>((resolve) => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  () => resolve({}),
                  { timeout: 4000, maximumAge: 30000 }
                );
              })
            : {};

        await fetch("/api/orders/custodio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders("Driver"),
          },
          body: JSON.stringify({
            action: "ping",
            driverId,
            lat: currentCoords.lat,
            lng: currentCoords.lng,
          }),
        });
      } catch {
        // Silencioso ante pérdidas temporales de señal
      }
    };

    void emitirPruebaDeVida();
    const interval = setInterval(emitirPruebaDeVida, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [driverId]);

  // Heartbeat de telemetría y presencia para el Custodio del Sistema
  useEffect(() => {
    if (!driverId || !hasActiveOrders) return;
    const sendPing = async () => {
      try {
        await fetch("/api/orders/custodio", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders("Driver") },
          body: JSON.stringify({
            action: "ping",
            driverId,
            lat: coords?.lat || null,
            lng: coords?.lng || null,
          }),
        });
      } catch {
        // Red offline transitoria
      }
    };
    sendPing();
    const timer = setInterval(sendPing, 15000);
    return () => clearInterval(timer);
  }, [driverId, coords?.lat, coords?.lng, hasActiveOrders]);
}
