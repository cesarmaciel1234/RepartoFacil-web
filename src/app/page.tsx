"use client";

import React, { useState, useEffect, Suspense } from "react";
import { TiendaPiramidal } from "@/modulos/tienda/TiendaPiramidal";
import { RepartidorPiramidal } from "@/modulos/repartidor/RepartidorPiramidal";
import { loadDriverProfile } from "@/modulos/repartidor/motor/driverService";
import { SearchParamsListener } from "@/modulos/tienda/motor/SearchParamsListener";

export default function MainPage() {
  const [viewMode, setViewMode] = useState<"store" | "driver">("store");

  // Regla de arranque (prioridad de vista):
  // 1. Verificar primero si existe una sesión de Repartidor activa y válida: entrar directo al modo Repartidor.
  // 2. Si no existe sesión de Repartidor activa, arrancar siempre en modo Tienda/Comprador (Inicio).
  // 3. Nunca mostrar el modal de repartidor automáticamente si la sesión está cerrada o vencida.
  useEffect(() => {
    const activeDriver = loadDriverProfile();
    if (activeDriver) {
      setViewMode("driver");
    } else {
      setViewMode("store");
    }
  }, []);

  const handleSwitchToStore = () => {
    setViewMode("store");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("mode");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const handleSwitchToDriver = () => {
    setViewMode("driver");
  };

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsListener onModeChange={setViewMode} />
      </Suspense>

      {viewMode === "driver" ? (
        <RepartidorPiramidal onSwitchToStore={handleSwitchToStore} />
      ) : (
        <TiendaPiramidal onSwitchToDriver={handleSwitchToDriver} />
      )}
    </>
  );
}
