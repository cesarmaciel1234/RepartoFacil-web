import { useEffect, useRef, useState } from 'react';

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useMapRoutes(
  center: [number, number],
  destination?: [number, number] | null
) {
  const lastFetchedCoords = useRef<{ center: [number, number]; dest: [number, number] } | null>(null);
  const [routes, setRoutes] = useState<{
    main: [number, number][];
    alternatives: [number, number][][];
  }>({
    main: [],
    alternatives: [],
  });

  useEffect(() => {
    if (
      !center ||
      !destination ||
      typeof destination[0] !== 'number' ||
      typeof destination[1] !== 'number'
    ) {
      setRoutes({ main: [], alternatives: [] });
      lastFetchedCoords.current = null;
      return;
    }

    const shouldFetch =
      !lastFetchedCoords.current ||
      getDistance(
        destination[0],
        destination[1],
        lastFetchedCoords.current.dest[0],
        lastFetchedCoords.current.dest[1]
      ) > 5 ||
      getDistance(
        center[0],
        center[1],
        lastFetchedCoords.current.center[0],
        lastFetchedCoords.current.center[1]
      ) > 10;

    if (shouldFetch) {
      const url = `https://router.project-osrm.org/route/v1/driving/${center[1]},${center[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&alternatives=true`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const mainCoords = data.routes[0].geometry.coordinates.map(
              (c: any) => [c[1], c[0]] as [number, number]
            );
            const altCoords = data.routes.slice(1).map((route: any) =>
              route.geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number])
            );
            setRoutes({ main: mainCoords, alternatives: altCoords });
            lastFetchedCoords.current = { center, dest: destination };
          }
        })
        .catch((err) => console.error('OSRM Error:', err));
    }
  }, [center, destination]);

  return routes;
}
