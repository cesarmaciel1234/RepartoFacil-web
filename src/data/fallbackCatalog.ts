// Catálogo de respaldo nativo de alta disponibilidad (offline / cold-start / incognito fallback)
// Generado a partir de los datos TPV certificados de Frigorífico Maciel (crm-libro-local)
import type { CompanyStore } from "./mockCompanies";
import type { Product } from "./mockProducts";

export type FallbackCatalogProduct = Product & {
  department?: string;
  categoryName?: string;
};

export const FALLBACK_COMPANIES: CompanyStore[] = [
  {
    id: "frigorifico-maciel-suc-1",
    name: "Maciel · Alfaro 1964",
    slug: "maciel",
    empresa_id: 1,
    category: "Carnes y Pescados",
    categorySlug: "carnes",
    rating: 5,
    ratingCount: 12,
    deliveryTimeMin: 20,
    deliveryTimeMax: 40,
    deliveryFee: 1500,
    badges: ["Carnes de Primera"],
    address: "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui",
    phone: "1135627803",
    isOpen: true,
    sucursal_id: 1,
    parentCompanyId: "frigorifico-maciel",
    parentSlug: "maciel",
    isMultiBranch: false,
    isSingleBranch: true,
  },
];

const RAW_PRODUCTS = [
  {
    "id": 760,
    "name": "Suprema",
    "dept": "AVES",
    "price": 13500,
    "unit": "KG",
    "image": "/productos/suprema.png"
  },
  {
    "id": 10,
    "name": "Asado",
    "dept": "CARNE",
    "price": 18900,
    "unit": "KG",
    "image": "/productos/asado.png"
  },
  {
    "id": 20,
    "name": "Vacio",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "image": "/productos/vacio.png"
  },
  {
    "id": 30,
    "name": "Oferta De Vacio",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "image": "/productos/oferta-de-vacio.png"
  },
  {
    "id": 40,
    "name": "Tapa De Nalga",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "image": "/productos/tapa-de-nalga.png"
  },
  {
    "id": 50,
    "name": "Matambre",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "image": "/productos/matambre.png"
  },
  {
    "id": 60,
    "name": "Asado Americano",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "image": "/productos/asado-americano.png"
  },
  {
    "id": 70,
    "name": "Entraña",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "image": "/productos/entrana.png"
  },
  {
    "id": 80,
    "name": "Falda",
    "dept": "CARNE",
    "price": 18800,
    "unit": "KG",
    "image": "/productos/falda.png"
  },
  {
    "id": 90,
    "name": "Paleta",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "image": "/productos/paleta.png"
  },
  {
    "id": 100,
    "name": "Roast Beef",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "image": "/productos/roast-beef.png"
  },
  {
    "id": 110,
    "name": "Palomita",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "image": "/productos/palomita.png"
  },
  {
    "id": 120,
    "name": "Tortuguita",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "image": "/productos/tortuguita.png"
  },
  {
    "id": 130,
    "name": "Lomo",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "image": "/productos/lomo.png"
  },
  {
    "id": 140,
    "name": "Osobuco",
    "dept": "CARNE",
    "price": 14000,
    "unit": "KG",
    "image": "/productos/osobuco.png"
  },
  {
    "id": 160,
    "name": "Espi­nazo",
    "dept": "CARNE",
    "price": 12500,
    "unit": "KG",
    "image": null
  },
  {
    "id": 170,
    "name": "Cuadril",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "image": "/productos/cuadril.png"
  },
  {
    "id": 180,
    "name": "Bife Ancho",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "image": "/productos/bife-ancho.png"
  },
  {
    "id": 200,
    "name": "Nalga",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "image": "/productos/nalga.png"
  },
  {
    "id": 210,
    "name": "Cuadrada",
    "dept": "CARNE",
    "price": 23000,
    "unit": "KG",
    "image": "/productos/cuadrada.png"
  },
  {
    "id": 220,
    "name": "Bola De Lomo",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "image": "/productos/bola-de-lomo.png"
  },
  {
    "id": 230,
    "name": "Peceto",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "image": "/productos/peceto.png"
  },
  {
    "id": 240,
    "name": "Oferta Tapa Asado",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "image": "/productos/oferta-tapa-asado.png"
  },
  {
    "id": 250,
    "name": "Bife De Chorizo",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "image": "/productos/bife-de-chorizo.png"
  },
  {
    "id": 300,
    "name": "Picada Comun",
    "dept": "CARNE",
    "price": 17000,
    "unit": "KG",
    "image": "/productos/picada-comun.png"
  },
  {
    "id": 310,
    "name": "Oferta Picada Comun",
    "dept": "CARNE",
    "price": 17000,
    "unit": "KG",
    "image": "/productos/oferta-picada-comun.png"
  },
  {
    "id": 400,
    "name": "Arrolldo",
    "dept": "CARNE",
    "price": 25000,
    "unit": "KG",
    "image": null
  },
  {
    "id": 510,
    "name": "Pechito De Cerdo",
    "dept": "CERDO",
    "price": 9000,
    "unit": "KG",
    "image": "/productos/pechito-de-cerdo.png"
  },
  {
    "id": 550,
    "name": "Matambre De Cerdo",
    "dept": "CERDO",
    "price": 13500,
    "unit": "KG",
    "image": null
  },
  {
    "id": 560,
    "name": "Boldiola De Cerdo",
    "dept": "CERDO",
    "price": 13500,
    "unit": "KG",
    "image": "/productos/boldiola-de-cerdo.png"
  },
  {
    "id": 710,
    "name": "Pollo Entero",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "image": "/productos/pollo-entero.png"
  },
  {
    "id": 720,
    "name": "Pollo Trozado",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "image": null
  },
  {
    "id": 740,
    "name": "Oferta Pata Y Muslo",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "image": "/productos/oferta-pata-y-muslo.png"
  },
  {
    "id": 750,
    "name": "Pechuga",
    "dept": "AVES",
    "price": 9500,
    "unit": "KG",
    "image": "/productos/pechuga.png"
  },
  {
    "id": 920,
    "name": "Milanesa De Pollo",
    "dept": "PREPARADOS",
    "price": 8500,
    "unit": "KG",
    "image": "/productos/milanesa-de-pollo.png"
  },
  {
    "id": 930,
    "name": "Oferta De Milanesa",
    "dept": "PREPARADOS",
    "price": 8500,
    "unit": "KG",
    "image": "/productos/oferta-de-milanesa.png"
  },
  {
    "id": 940,
    "name": "Oferta alita",
    "dept": "AVES",
    "price": 3500,
    "unit": "KG",
    "image": "/productos/oferta-alita.png"
  },
  {
    "id": 950,
    "name": "Hamburguesa",
    "dept": "CARNE",
    "price": 17000,
    "unit": "KG",
    "image": "/productos/hamburguesa.png"
  },
  {
    "id": 960,
    "name": "Oferta Suprema",
    "dept": "AVES",
    "price": 13500,
    "unit": "KG",
    "image": "/productos/oferta-suprema.png"
  },
  {
    "id": 1120,
    "name": "Chorizo",
    "dept": "EMBUTIDO",
    "price": 11000,
    "unit": "KG",
    "image": "/productos/chorizo.png"
  },
  {
    "id": 1140,
    "name": "Morcilla",
    "dept": "EMBUTIDO",
    "price": 7500,
    "unit": "KG",
    "image": "/productos/morcilla.png"
  },
  {
    "id": 1240,
    "name": "Higado",
    "dept": "ACHURAS",
    "price": 6800,
    "unit": "KG",
    "image": "/productos/higado.png"
  },
  {
    "id": 1708,
    "name": "huevo x 6 un",
    "dept": "HUEVO",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 1709,
    "name": "huevo x 10 un",
    "dept": "HUEVO",
    "price": 2500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 1710,
    "name": "huevo x 15 un",
    "dept": "HUEVO",
    "price": 3300,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798088142615,
    "name": "aceite de oliva",
    "dept": "ALMACEN",
    "price": 8000,
    "unit": "UN",
    "image": "/productos/aceite-de-oliva.png"
  },
  {
    "id": 7798342990173,
    "name": "huevo  maple",
    "dept": "HUEVO",
    "price": 6000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990175,
    "name": "papas MC.",
    "dept": "ACHURAS",
    "price": 4500,
    "unit": "UN",
    "image": "/productos/papas-mc.png"
  },
  {
    "id": 7798342990179,
    "name": "carbon",
    "dept": "ALMACEN",
    "price": 7000,
    "unit": "UN",
    "image": "/productos/carbon.png"
  },
  {
    "id": 7798342990181,
    "name": "Pata Muslo",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "image": "/productos/pata-muslo.png"
  },
  {
    "id": 7798342990184,
    "name": "provenzal alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": "/productos/provenzal-alicante.png"
  },
  {
    "id": 7798342990185,
    "name": "chimichurri alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990186,
    "name": "arroz alicante",
    "dept": "GENERAL",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990188,
    "name": "pizza alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990206,
    "name": "patitas congelados",
    "dept": "CONGELADOS",
    "price": 4500,
    "unit": "UN",
    "image": "/productos/patitas-congelados.png"
  },
  {
    "id": 7798342990207,
    "name": "Alitas",
    "dept": "AVES",
    "price": 3500,
    "unit": "UN",
    "image": "/productos/alitas.png"
  },
  {
    "id": 520,
    "name": "Carre De Cerdo",
    "dept": "CERDO",
    "price": 8500,
    "unit": "KG",
    "image": null
  },
  {
    "id": 730,
    "name": "Pata Y Muslo",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "image": "/productos/pata-y-muslo.png"
  },
  {
    "id": 780,
    "name": "Menudo",
    "dept": "AVES",
    "price": 500,
    "unit": "KG",
    "image": null
  },
  {
    "id": 790,
    "name": "Carcaza",
    "dept": "AVES",
    "price": 100,
    "unit": "KG",
    "image": null
  },
  {
    "id": 970,
    "name": "Oferta Trozado",
    "dept": "AVES",
    "price": 4500,
    "unit": "KG",
    "image": null
  },
  {
    "id": 1210,
    "name": "Chinchulin",
    "dept": "ACHURAS",
    "price": 6800,
    "unit": "KG",
    "image": null
  },
  {
    "id": 1250,
    "name": "Mondongo",
    "dept": "ACHURAS",
    "price": 10000,
    "unit": "KG",
    "image": null
  },
  {
    "id": 1711,
    "name": "pan rallado",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 2050,
    "name": "Salsa Tau",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 2060,
    "name": "Salsa AJ51",
    "dept": "ALMACEN",
    "price": 3500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 2070,
    "name": "Sal Y limon",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 5330,
    "name": "Grasa",
    "dept": "CERDO",
    "price": 2000,
    "unit": "KG",
    "image": null
  },
  {
    "id": 99991,
    "name": "Alfajor Triple",
    "dept": "GENERAL",
    "price": 1000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 76625249599,
    "name": "bolsa de horno",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 754697504357,
    "name": "sal c. carne",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7790127732672,
    "name": "aceituna",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "image": "/productos/aceituna.png"
  },
  {
    "id": 7798088140178,
    "name": "jugo de limon",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798146138185,
    "name": "mayonesa",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990167,
    "name": "pan r. rebosado",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990168,
    "name": "pan r. comun",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": "/productos/pan-r-comun.png"
  },
  {
    "id": 7798342990169,
    "name": "sal c. achuras",
    "dept": "GENERAL",
    "price": 3000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990170,
    "name": "sal c.cerdo",
    "dept": "GENERAL",
    "price": 3000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990176,
    "name": "condimentos",
    "dept": "ALMACEN",
    "price": 500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990177,
    "name": "grasa vacuna",
    "dept": "GRASA",
    "price": 2000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990178,
    "name": "grasa de cerdo",
    "dept": "GRASA",
    "price": 2000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990180,
    "name": "leña",
    "dept": "GENERAL",
    "price": 7000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990182,
    "name": "Menudos",
    "dept": "POLLO",
    "price": 500,
    "unit": "KG",
    "image": null
  },
  {
    "id": 7798342990183,
    "name": "Carcasa",
    "dept": "AVES",
    "price": 100,
    "unit": "KG",
    "image": null
  },
  {
    "id": 7798342990187,
    "name": "queso rallado",
    "dept": "ALMACEN",
    "price": 1000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990189,
    "name": "pan premiun",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990191,
    "name": "tau mayonesa ajo",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990193,
    "name": "tau guacamole",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990194,
    "name": "tau barbacoa",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990200,
    "name": "aji picante AJ51",
    "dept": "ALMACEN",
    "price": 4000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990201,
    "name": "aceitunas",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990202,
    "name": "pimenton alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990208,
    "name": "pure de tomate",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "image": null
  },
  {
    "id": 7798342990209,
    "name": "rebozador premium",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "image": null
  }
];

export function buildBranchProducts(sucursalId: number): FallbackCatalogProduct[] {
  const branchCompId = `frigorifico-maciel-suc-${sucursalId}`;
  const branchCompName = "Frigorífico Maciel";
  return RAW_PRODUCTS.map((item) => ({
    id: `fallback-suc-${sucursalId}-${item.id}`,
    name: item.name,
    category: item.dept.toLowerCase(),
    categoryName: item.dept,
    department: item.dept,
    price: item.price,
    stockKg: 999,
    unit: item.unit,
    description: `${item.dept} · Corte fresco de Frigorífico Maciel. Calidad garantizada.`,
    ...(item.image ? { image: item.image } : {}),
    priceSource: "tpv" as const,
    badge: item.dept,
    isOutOfStock: false,
    isLowStock: false,
    companyId: branchCompId,
    companyName: branchCompName,
    sucursal_id: sucursalId,
    catalogCached: false,
  }));
}

export const FALLBACK_PRODUCTS_SUC_1: FallbackCatalogProduct[] = buildBranchProducts(1);

export const FALLBACK_PRODUCTS: FallbackCatalogProduct[] = [
  ...FALLBACK_PRODUCTS_SUC_1,
];
