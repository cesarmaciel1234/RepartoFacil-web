"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // En producción o pruebas locales seguras
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local");

      if (process.env.NODE_ENV === "production" || isLocalhost) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Chequear si hay actualización disponible
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("[PWA] Nueva versión disponible en segundo plano.");
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("[PWA] Error registrando Service Worker:", error);
          });
      }
    }
  }, []);

  return null;
}
