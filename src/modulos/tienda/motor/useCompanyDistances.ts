import { useEffect, useState } from "react";
import type { CompanyStore } from "@/data/mockCompanies";
import { haversineKm } from "./tarifaUberService";
import {
  isCompanyCoordinates,
  normalizeCompanyAddress,
  readCompanyCoordinatesCache,
  saveCompanyCoordinatesCache,
  type CompanyCoordinates,
} from "./ubicacionComercio";

let lastCompanyGeocodeStartedAt = 0;

export function useCompanyDistances(
  companies: CompanyStore[],
  deliveryCoordinates?: { lat: number; lng: number } | null
) {
  const [companyDistances, setCompanyDistances] = useState<Record<string, number | null>>({});
  const [isResolvingCompanyLocations, setIsResolvingCompanyLocations] = useState(false);

  useEffect(() => {
    if (!deliveryCoordinates) {
      setCompanyDistances({});
      setIsResolvingCompanyLocations(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const resolveCompanyDistances = async () => {
      setIsResolvingCompanyLocations(true);
      const cache = readCompanyCoordinatesCache();
      const companyLocations = new Map<string, CompanyCoordinates>();
      const addresses = new Map<string, string>();

      for (const company of companies) {
        const addressKey = normalizeCompanyAddress(company.address || "");
        if (isCompanyCoordinates(company.coordinates)) {
          companyLocations.set(company.id, company.coordinates);
        } else if (addressKey && isCompanyCoordinates(cache[addressKey])) {
          companyLocations.set(company.id, cache[addressKey]);
        } else if (addressKey) {
          addresses.set(addressKey, company.address);
        }
      }

      const publishDistances = () => {
        const distances: Record<string, number | null> = {};
        for (const company of companies) {
          const location = companyLocations.get(company.id);
          distances[company.id] = location
            ? haversineKm(
                deliveryCoordinates.lat,
                deliveryCoordinates.lng,
                location.lat,
                location.lng
              )
            : null;
        }
        if (!cancelled) setCompanyDistances(distances);
      };

      publishDistances();
      for (const [addressKey, address] of addresses) {
        if (cancelled) return;

        const waitMs = Math.max(0, 1000 - (Date.now() - lastCompanyGeocodeStartedAt));
        if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
        if (cancelled) return;
        lastCompanyGeocodeStartedAt = Date.now();

        try {
          const params = new URLSearchParams({
            format: "jsonv2",
            q: `${address}, Argentina`,
            limit: "1",
          });
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            { signal: controller.signal, headers: { "Accept-Language": "es" } }
          );
          if (!response.ok) {
            throw new Error(`El servicio respondió ${response.status}`);
          }
          const results = await response.json();
          const latitude = Number(results?.[0]?.lat);
          const longitude = Number(results?.[0]?.lon);
          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180
          ) {
            continue;
          }

          const coordinates = { lat: latitude, lng: longitude };
          cache[addressKey] = coordinates;
          for (const company of companies) {
            if (normalizeCompanyAddress(company.address || "") === addressKey) {
              companyLocations.set(company.id, coordinates);
            }
          }
          saveCompanyCoordinatesCache(cache);
          publishDistances();
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error("No se pudo calcular la distancia de un comercio:", error);
          }
        }
      }

      if (!cancelled) setIsResolvingCompanyLocations(false);
    };

    void resolveCompanyDistances().catch((error) => {
      if (!controller.signal.aborted) {
        console.error("No se pudieron ordenar los comercios por cercanía:", error);
      }
      if (!cancelled) setIsResolvingCompanyLocations(false);
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [companies, deliveryCoordinates?.lat, deliveryCoordinates?.lng]);

  return { companyDistances, isResolvingCompanyLocations };
}
