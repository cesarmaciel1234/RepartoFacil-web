export interface CompanyStore {
  id: string;
  name: string;
  slug?: string;
  empresa_id?: number;
  category: string;
  categorySlug: "carnes" | "supermercados" | "bebidas" | "kioscos" | "minimercados";
  rating: number;
  ratingCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  badges: string[];
  logoUrl?: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  phone: string;
  cobroFacilApiEndpoint?: string;
  isOpen: boolean;
  sucursales?: { id: number; nombre: string }[];
}
