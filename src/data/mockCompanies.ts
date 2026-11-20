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
  phone: string;
  cobroFacilApiEndpoint?: string;
  isOpen: boolean;
  sucursales?: { id: number; nombre: string }[];
}

export const MOCK_COMPANIES: CompanyStore[] = [
  {
    id: "empresa-prueba",
    name: "Cobro Fácil - Empresa Prueba",
    category: "Comercio de Prueba & Sandbox",
    categorySlug: "carnes",
    rating: 5.0,
    ratingCount: 15,
    deliveryTimeMin: 10,
    deliveryTimeMax: 20,
    deliveryFee: 1500,
    freeDeliveryThreshold: 20000,
    badges: ["Sandbox Cobro Fácil", "Empresa Prueba", "Entorno Seguro"],
    address: "Tucumán 2130, Rosario",
    phone: "+54 9 341 555-9999",
    cobroFacilApiEndpoint: "https://cobrofacil-web.onrender.com",
    isOpen: true,
  },
  {
    id: "frigorifico-maciel",
    name: "Frigorífico Maciel - Central",
    category: "Carnes y Pescados",
    categorySlug: "carnes",
    rating: 4.8,
    ratingCount: 342,
    deliveryTimeMin: 15,
    deliveryTimeMax: 40,
    deliveryFee: 1605,
    freeDeliveryThreshold: 35000,
    badges: ["Sincronizado Cobro Fácil TPV", "MACIEL - DESKTOP-7Q2Q4VD", "Mismo precio que en local"],
    address: "Tucumán 2130, Rosario",
    phone: "+54 9 341 555-1234",
    cobroFacilApiEndpoint: "https://cobrofacil.onrender.com",
    isOpen: true,
  },
  {
    id: "kiosco-al-toque",
    name: "Kiosco Al Toque - 24hs",
    category: "Kioscos y Golosinas",
    categorySlug: "kioscos",
    rating: 4.6,
    ratingCount: 189,
    deliveryTimeMin: 15,
    deliveryTimeMax: 30,
    deliveryFee: 1359,
    freeDeliveryThreshold: 25000,
    badges: ["Abierto 24hs", "Bebidas frías"],
    address: "San Lorenzo 1920, Rosario",
    phone: "+54 9 341 444-5678",
    cobroFacilApiEndpoint: "https://cobrofacil.onrender.com/api/v1/kiosco",
    isOpen: true,
  },
  {
    id: "res-boutique",
    name: "Res - Carnes y Cortes Especiales",
    category: "Carnes y Pescados",
    categorySlug: "carnes",
    rating: 4.7,
    ratingCount: 215,
    deliveryTimeMin: 20,
    deliveryTimeMax: 45,
    deliveryFee: 2109,
    freeDeliveryThreshold: 40000,
    badges: ["Hasta 30% OFF", "Novillito de Campo"],
    address: "Santa Fe 1850, Rosario",
    phone: "+54 9 341 666-7890",
    cobroFacilApiEndpoint: "https://cobrofacil.onrender.com/api/v1/res",
    isOpen: true,
  },
  {
    id: "minimercado-pellegrini",
    name: "Minimercado & Fiambrería Pellegrini",
    category: "Minimercados y Almacén",
    categorySlug: "minimercados",
    rating: 4.5,
    ratingCount: 98,
    deliveryTimeMin: 20,
    deliveryTimeMax: 40,
    deliveryFee: 1500,
    freeDeliveryThreshold: 30000,
    badges: ["Quesos y Fiambres al corte"],
    address: "Av. Pellegrini 2210, Rosario",
    phone: "+54 9 341 777-4321",
    cobroFacilApiEndpoint: "https://cobrofacil.onrender.com/api/v1/pellegrini",
    isOpen: true,
  },
];
