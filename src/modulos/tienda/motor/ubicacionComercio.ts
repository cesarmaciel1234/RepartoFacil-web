export interface CompanyCoordinates {
  lat: number;
  lng: number;
}

export const COMPANY_COORDINATES_CACHE_KEY = "rf_company_coordinates_v1";
export const COMPANY_COORDINATES_UPDATED_EVENT = "rf-company-coordinates-updated";

export function normalizeCompanyAddress(address: string) {
  return address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCompanyCoordinates(value: unknown): value is CompanyCoordinates {
  if (!value || typeof value !== "object") return false;
  const coordinates = value as { lat?: unknown; lng?: unknown };
  return (
    typeof coordinates.lat === "number" &&
    typeof coordinates.lng === "number" &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng) &&
    Math.abs(coordinates.lat) <= 90 &&
    Math.abs(coordinates.lng) <= 180
  );
}

export function readCompanyCoordinatesCache(): Record<string, CompanyCoordinates> {
  try {
    const raw = localStorage.getItem(COMPANY_COORDINATES_CACHE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, CompanyCoordinates] =>
        isCompanyCoordinates(entry[1])
      )
    );
  } catch (error) {
    console.warn("No se pudo leer la caché de ubicaciones comerciales:", error);
    return {};
  }
}

export function saveCompanyCoordinatesCache(cache: Record<string, CompanyCoordinates>) {
  try {
    localStorage.setItem(COMPANY_COORDINATES_CACHE_KEY, JSON.stringify(cache));
    window.dispatchEvent(new Event(COMPANY_COORDINATES_UPDATED_EVENT));
  } catch (error) {
    console.warn("No se pudo guardar la caché de ubicaciones comerciales:", error);
  }
}

export function getCompanyCoordinates(
  company?: { address?: string; name?: string; coordinates?: { lat: number; lng: number } } | null
): CompanyCoordinates | null {
  if (!company) return null;
  if (isCompanyCoordinates(company.coordinates)) {
    return company.coordinates;
  }
  const addressKey = normalizeCompanyAddress(company.address || "");
  const cache = readCompanyCoordinatesCache();
  if (addressKey && isCompanyCoordinates(cache[addressKey])) {
    return cache[addressKey];
  }
  const norm = `${addressKey} ${normalizeCompanyAddress(company.name || "")}`;
  if (norm.includes("alfaro") || norm.includes("derqui") || norm.includes("maciel")) {
    return { lat: -34.486522, lng: -58.833579 };
  }
  return null;
}
