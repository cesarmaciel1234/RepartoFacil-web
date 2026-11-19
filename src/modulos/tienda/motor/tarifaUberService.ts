/**
 * Motor de Tarifas y Geoposicionamiento Estándar Uber / PedidosYa
 * Reparto Fácil · Frigorífico Maciel
 */

export interface TarifaEstimada {
  baseFee: number;
  distanceKm: number;
  pricePerKm: number;
  distanceFee: number;
  isPeakHour: boolean;
  multiplier: number;
  totalDeliveryFee: number;
  driverEarnings: number;
  estimatedMinutes: number;
}

// Ubicación Central Frigorífico Maciel (Sucursal Tucumán 2130, Rosario)
export const MARKET_CENTRAL = {
  name: "Frigorífico Maciel - Central",
  address: "Tucumán 2130, Rosario",
  coords: { lat: -32.9372, lng: -60.6542 },
};

// Estimación de distancia haversine en KM
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Determinar si es horario pico (almuerzo 12-14:30 o cena 20-23:30)
export function isPeakHourNow(): boolean {
  if (typeof window === "undefined") return true;
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const isLunchPeak = hour >= 12.0 && hour <= 14.5;
  const isDinnerPeak = hour >= 20.0 && hour <= 23.5;
  return isLunchPeak || isDinnerPeak;
}

// Aproximación de geocodificación para direcciones comunes de prueba
export function estimateAddressCoords(address: string): {
  coords: { lat: number; lng: number };
  distanceKm: number;
} {
  const norm = address.toLowerCase();
  
  // Direcciones cercanas a Tucumán 2130
  if (norm.includes("san lorenzo 2040") || norm.includes("san lorenzo")) {
    const coords = { lat: -32.9395, lng: -60.6515 };
    return { coords, distanceKm: 0.9 };
  }
  if (norm.includes("santa fe 1900") || norm.includes("santa fe")) {
    const coords = { lat: -32.942, lng: -60.6502 };
    return { coords, distanceKm: 1.4 };
  }
  if (norm.includes("alvear") || norm.includes("alvear 850")) {
    const coords = { lat: -32.9348, lng: -60.6582 };
    return { coords, distanceKm: 1.2 };
  }
  if (norm.includes("pellegrini") || norm.includes("mitre")) {
    const coords = { lat: -32.9472, lng: -60.648 };
    return { coords, distanceKm: 2.3 };
  }
  if (norm.includes("belgrano")) {
    const coords = { lat: -32.9485, lng: -60.632 };
    return { coords, distanceKm: 2.7 };
  }

  // Fallback por defecto: domicilio cercano (~1.3 km de la central)
  const coords = { lat: -32.9435, lng: -60.653 };
  return { coords, distanceKm: 1.3 };
}

/**
 * Cálculo estándar estilo Uber Eats / PedidosYa
 * Base fija + Distancia por KM + Multiplicador dinámico por horario pico
 */
export function calcularTarifaEnvio(
  address: string,
  forcePeakHour?: boolean
): TarifaEstimada {
  const { distanceKm } = estimateAddressCoords(address);
  
  const baseFee = 1200; // Tarifa base de despacho
  const pricePerKm = 450; // $450 por km
  const distanceFee = Math.round(distanceKm * pricePerKm);
  
  const isPeak = forcePeakHour !== undefined ? forcePeakHour : isPeakHourNow();
  const multiplier = isPeak ? 1.35 : 1.0; // 35% de recargo dinámico en pico
  
  const totalDeliveryFee = Math.round((baseFee + distanceFee) * multiplier);
  
  // Ganancia neta para el repartidor (85% del delivery fee, mínimo $1.600)
  const driverEarnings = Math.max(1600, Math.round(totalDeliveryFee * 0.85));
  
  // Tiempo estimado: 15 min preparación + 5 min por cada km
  const estimatedMinutes = Math.round(15 + distanceKm * 5);

  return {
    baseFee,
    distanceKm,
    pricePerKm,
    distanceFee,
    isPeakHour: isPeak,
    multiplier,
    totalDeliveryFee,
    driverEarnings,
    estimatedMinutes,
  };
}
