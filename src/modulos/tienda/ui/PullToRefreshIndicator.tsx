"use client";

import React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  isPulling,
  threshold = 50,
}: PullToRefreshIndicatorProps) {
  const isVisible = pullDistance > 0 || isRefreshing;
  const rotation = isRefreshing
    ? 0
    : Math.min(360, Math.round((pullDistance / threshold) * 360));
  const opacity = isRefreshing
    ? 1
    : Math.min(1, Math.max(0, (pullDistance - 8) / (threshold - 8)));

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center",
        !isPulling && "transition-all duration-300 ease-out"
      )}
      style={{
        top: 8,
        transform: `translate(-50%, ${pullDistance > 0 || isRefreshing ? pullDistance : -48}px)`,
        opacity: isVisible ? opacity : 0,
      }}
    >
      <div className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-md shadow-slate-900/10 flex items-center justify-center text-blue-600">
        {isRefreshing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <RefreshCw
            className="w-4 h-4 transition-transform duration-75"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>
    </div>
  );
}
