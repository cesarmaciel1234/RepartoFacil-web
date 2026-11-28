"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  maxPull?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 50,
  resistance = 0.45,
  maxPull = 75,
}: UsePullToRefreshOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);
  isRefreshingRef.current = isRefreshing;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPullDistance(44);
    const startTime = Date.now();
    try {
      await Promise.resolve(onRefresh());
    } catch (err) {
      console.warn("PullToRefresh failed:", err);
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 500 - elapsed);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }, remainingTime);
    }
  }, [onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      if (el.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        setIsPulling(true);
      } else {
        startYRef.current = null;
        setIsPulling(false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startYRef.current === null || isRefreshingRef.current) return;
      if (el.scrollTop > 0) {
        setPullDistance(0);
        startYRef.current = null;
        setIsPulling(false);
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      if (deltaY > 0) {
        const pull = Math.min(maxPull, deltaY * resistance);
        setPullDistance(pull);
        if (e.cancelable && pull > 5) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (startYRef.current === null) return;
      startYRef.current = null;
      setIsPulling(false);

      if (pullDistance >= threshold && !isRefreshingRef.current) {
        void handleRefresh();
      } else if (!isRefreshingRef.current) {
        setPullDistance(0);
      }
    };

    const onTouchCancel = () => {
      startYRef.current = null;
      setIsPulling(false);
      if (!isRefreshingRef.current) {
        setPullDistance(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [handleRefresh, maxPull, resistance, threshold, pullDistance]);

  return {
    containerRef,
    pullDistance,
    isPulling,
    isRefreshing,
    threshold,
  };
}
