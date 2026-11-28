"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loadDriverProfile } from "@/modulos/repartidor/motor/driverService";

interface SearchParamsListenerProps {
  onModeChange: (mode: "store" | "driver") => void;
}

/**
 * Escucha silenciosa de parámetros de URL (?mode=driver / ?mode=store).
 * Aislado en su propio componente con Suspense mínimo para evitar
 * BAILOUT_TO_CLIENT_SIDE_RENDERING en el árbol principal de la app.
 */
export function SearchParamsListener({ onModeChange }: SearchParamsListenerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "driver") {
      const activeDriver = loadDriverProfile();
      if (activeDriver) {
        onModeChange("driver");
      } else {
        onModeChange("store");
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("mode");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        }
      }
    } else if (qMode === "store") {
      onModeChange("store");
    }
  }, [searchParams, onModeChange]);

  return null;
}
