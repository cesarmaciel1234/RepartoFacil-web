import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export interface MapControllerProps {
  center: [number, number];
  heading: number;
  isNavigating: boolean;
  centerTrigger: number;
}

export function MapController({
  center,
  heading: _heading,
  isNavigating,
  centerTrigger,
}: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating) {
      map.setView(center, 18, { animate: true });
    } else if (centerTrigger > 0) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, isNavigating, map, centerTrigger]);

  return null;
}
