"use client";

import React, { useState, useEffect, Suspense } from "react";
import { TiendaPiramidal } from "@/modulos/tienda/TiendaPiramidal";
import { RepartidorPiramidal } from "@/modulos/repartidor/RepartidorPiramidal";
import { loadDriverProfile } from "@/modulos/repartidor/motor/driverService";
import { SearchParamsListener } from "@/modulos/tienda/motor/SearchParamsListener";

export default function MainPage() {
  const [isDriver, setIsDriver] = useState<boolean | null>(null);

  // Aislamiento estricto de arranque:
  // 1. Verificar si existe sesión válida de Repartidor.
  // 2. Si existe sesión de Repartidor activa: montar ÚNICAMENTE Repartidor.
  // 3. Si no existe sesión de Repartidor: montar ÚNICAMENTE Tienda.
  useEffect(() => {
    const checkDriver = () => {
      const activeDriver = loadDriverProfile();
      setIsDriver(Boolean(activeDriver));
    };
    checkDriver();

    const handleAuthChange = () => {
      checkDriver();
    };
    window.addEventListener("repartofacil-driver-auth", handleAuthChange);
    window.addEventListener("repartofacil-auth", handleAuthChange);
    return () => {
      window.removeEventListener("repartofacil-driver-auth", handleAuthChange);
      window.removeEventListener("repartofacil-auth", handleAuthChange);
    };
  }, []);

  // Bloqueo estricto de navegación atrás en modo Repartidor:
  // Previene que el swipe horizontal o botón volver de iOS Safari salga de Repartidor salvo tocando Cerrar sesión.
  useEffect(() => {
    if (!isDriver) return;

    if (typeof document !== "undefined") {
      document.documentElement.style.overscrollBehaviorX = "none";
      document.body.style.overscrollBehaviorX = "none";
    }

    // Registrar trampa en el historial
    window.history.pushState({ driverLocked: true }, "", window.location.pathname);

    const handlePopState = () => {
      // Re-bloquear el estado en el historial ante cualquier intento de retroceso
      window.history.pushState({ driverLocked: true }, "", window.location.pathname);
    };

    // Prevenir el gesto nativo interactivo de swipe-back en los bordes en iOS
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const x = e.touches[0].clientX;
        if (x < 24 || x > window.innerWidth - 24) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("touchstart", handleTouchStart);
      if (typeof document !== "undefined") {
        document.documentElement.style.overscrollBehaviorX = "";
        document.body.style.overscrollBehaviorX = "";
      }
    };
  }, [isDriver]);

  const handleSwitchToStore = () => {
    // Solo puede volver a la tienda si el chofer cerró sesión explícitamente
    const activeDriver = loadDriverProfile();
    if (!activeDriver) {
      setIsDriver(false);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("mode");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  };

  const handleSwitchToDriver = () => {
    const activeDriver = loadDriverProfile();
    if (activeDriver) {
      setIsDriver(true);
    }
  };

  if (isDriver === null) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Cargando Reparto Fácil...
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsListener
          onModeChange={(mode) => {
            if (mode === "driver" && loadDriverProfile()) {
              setIsDriver(true);
            } else if (mode === "store" && !loadDriverProfile()) {
              setIsDriver(false);
            }
          }}
        />
      </Suspense>

      {isDriver ? (
        <RepartidorPiramidal onSwitchToStore={handleSwitchToStore} />
      ) : (
        <TiendaPiramidal onSwitchToDriver={handleSwitchToDriver} />
      )}
    </>
  );
}
