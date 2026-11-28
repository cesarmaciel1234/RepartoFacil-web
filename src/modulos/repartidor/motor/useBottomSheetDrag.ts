import { useState, useRef, useEffect } from "react";

export function useBottomSheetDrag() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const didDrag = useRef(false);

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startY.current = clientY;
    didDrag.current = false;
  };

  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (!isDragging) return;
      const delta = clientY - startY.current;
      if (Math.abs(delta) > 10) didDrag.current = true;
      setDragY(delta);
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (dragY < -60) setIsExpanded(true);
      else if (dragY > 60) setIsExpanded(false);
      setDragY(0);
    };

    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);

    if (isDragging) {
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", handleEnd);
    }
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleEnd);
    };
  }, [isDragging, dragY]);

  const sheetY = isExpanded
    ? Math.max(0, dragY)
    : `calc(100% - 150px + ${Math.min(0, dragY)}px)`;

  return {
    isExpanded,
    setIsExpanded,
    isDragging,
    didDrag,
    handleDragStart,
    sheetY,
  };
}
