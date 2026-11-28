"use client";

import React from "react";
import { usePullToRefresh } from "../motor/usePullToRefresh";
import { PullToRefreshIndicator } from "./PullToRefreshIndicator";

interface TiendaPwaLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  floatingCart?: React.ReactNode;
  bottomNav: React.ReactNode;
  onRefresh: () => Promise<void> | void;
}

export function TiendaPwaLayout({
  header,
  children,
  floatingCart,
  bottomNav,
  onRefresh,
}: TiendaPwaLayoutProps) {
  const {
    containerRef,
    pullDistance,
    isPulling,
    isRefreshing,
    threshold,
  } = usePullToRefresh({
    onRefresh,
  });

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-white text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* ─── Encabezado Superior Fijo (flex-shrink-0) ─── */}
      <div className="flex-shrink-0 z-30">
        {header}
      </div>

      {/* ─── Contenedor Central con Scroll y Pull-to-Refresh Suave ─── */}
      <main
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain -webkit-overflow-scrolling-touch relative"
      >
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          isPulling={isPulling}
          threshold={threshold}
        />
        <div className="max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4 pb-28">
          {children}
        </div>
      </main>

      {/* ─── Barra Flotante del Carrito (si corresponde) ─── */}
      {floatingCart}

      {/* ─── Barra Inferior Fija (flex-shrink-0) ─── */}
      <div className="flex-shrink-0 z-30">
        {bottomNav}
      </div>
    </div>
  );
}
