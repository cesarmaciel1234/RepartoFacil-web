"use client";

import React from "react";

interface RepartidorPwaLayoutProps {
  map: React.ReactNode;
  topBar: React.ReactNode;
  controls?: React.ReactNode;
  sheet: React.ReactNode;
  modals?: React.ReactNode;
}

export function RepartidorPwaLayout({
  map,
  topBar,
  controls,
  sheet,
  modals,
}: RepartidorPwaLayoutProps) {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      {/* ─── 1. Mapa Interactivo de Fondo (Full Screen - Sin Pull to Refresh) ─── */}
      <div className="absolute inset-0 z-0">
        {map}
      </div>

      {/* ─── 2. Barra Superior Fija Flotante ─── */}
      <div className="relative z-20 flex-shrink-0">
        {topBar}
      </div>

      {/* ─── 3. Controles Flotantes del Mapa ─── */}
      {controls}

      {/* ─── 4. Panel Deslizable Inferior (Sheet) ─── */}
      {sheet}

      {/* ─── 5. Modales y Diálogos ─── */}
      {modals}
    </div>
  );
}
