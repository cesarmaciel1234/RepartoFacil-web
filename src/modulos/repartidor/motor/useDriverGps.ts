"use client";

import { useState, useEffect } from "react";
import { GPSCoords } from "./tipos";
import { doc, updateDoc } from "@/firebase/local-firestore";
import { useFirestore } from "@/firebase";

export function useDriverGps(driverId?: string | null) {
  const firestore = useFirestore();
  const [coords, setCoords] = useState<GPSCoords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocalización no soportada");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(newCoords);
        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setHeading(pos.coords.heading);
        }

        // Sincronizar posición del repartidor si está logueado
        if (driverId && firestore) {
          try {
            updateDoc(doc(firestore, "driverProfiles", driverId), {
              currentLatitude: newCoords.lat,
              currentLongitude: newCoords.lng,
              lastLocationUpdate: new Date().toISOString(),
            });
          } catch {}
        }
      },
      (err) => {
        console.warn("Aviso GPS:", err.message);
        setGpsError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId, firestore]);

  return {
    coords,
    heading,
    gpsError,
  };
}
