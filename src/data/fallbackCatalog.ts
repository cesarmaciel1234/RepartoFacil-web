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
    name: "maciel #1",
    slug: "maciel",
    empresa_id: 1,
    category: "Carnicería",
    categorySlug: "carnes",
    rating: 5,
    ratingCount: 12,
    deliveryTimeMin: 20,
    deliveryTimeMax: 40,
    deliveryFee: 2000,
    badges: ["Carnes de Primera"],
    address: "alfaro 1964",
    coordinates: { lat: -34.486522, lng: -58.833579 },
    phone: "+5491135627803",
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
    "stock": 999584.6299999985,
    "stockKg": 999584.6299999985,
    "image": "/productos/suprema.png"
  },
  {
    "id": 10,
    "name": "Asado",
    "dept": "CARNE",
    "price": 18900,
    "unit": "KG",
    "stock": 999804.1400000001,
    "stockKg": 999804.1400000001,
    "image": "/productos/asado.png"
  },
  {
    "id": 20,
    "name": "Vacio",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "stock": 999908.7999999998,
    "stockKg": 999908.7999999998,
    "image": "/productos/vacio.png"
  },
  {
    "id": 30,
    "name": "Oferta De Vacio",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "stock": 999999,
    "stockKg": 999999,
    "image": "/productos/oferta-de-vacio.png"
  },
  {
    "id": 40,
    "name": "Tapa De Nalga",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "stock": 999991.3999999998,
    "stockKg": 999991.3999999998,
    "image": "/productos/tapa-de-nalga.png"
  },
  {
    "id": 50,
    "name": "Matambre",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "stock": 1000001.4799999999,
    "stockKg": 1000001.4799999999,
    "image": "/productos/matambre.png"
  },
  {
    "id": 60,
    "name": "Asado Americano",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "stock": 1000014.04,
    "stockKg": 1000014.04,
    "image": "/productos/asado-americano.png"
  },
  {
    "id": 70,
    "name": "Entraña",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "stock": 1000014.88,
    "stockKg": 1000014.88,
    "image": "/productos/entrana.png"
  },
  {
    "id": 80,
    "name": "Falda",
    "dept": "CARNE",
    "price": 18800,
    "unit": "KG",
    "stock": 999995.5299999999,
    "stockKg": 999995.5299999999,
    "image": "/productos/falda.png"
  },
  {
    "id": 90,
    "name": "Paleta",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "stock": 999860.4899999987,
    "stockKg": 999860.4899999987,
    "image": "/productos/paleta.png"
  },
  {
    "id": 100,
    "name": "Roast Beef",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "stock": 999839.4999999978,
    "stockKg": 999839.4999999978,
    "image": "/productos/roast-beef.png"
  },
  {
    "id": 110,
    "name": "Palomita",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "stock": 1000011.3399999997,
    "stockKg": 1000011.3399999997,
    "image": "/productos/palomita.png"
  },
  {
    "id": 120,
    "name": "Tortuguita",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "stock": 999998.6899999996,
    "stockKg": 999998.6899999996,
    "image": "/productos/tortuguita.png"
  },
  {
    "id": 130,
    "name": "Lomo",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "stock": 999986.8300000001,
    "stockKg": 999986.8300000001,
    "image": "/productos/lomo.png"
  },
  {
    "id": 140,
    "name": "Osobuco",
    "dept": "CARNE",
    "price": 14000,
    "unit": "KG",
    "stock": 999772.8000000009,
    "stockKg": 999772.8000000009,
    "image": "/productos/osobuco.png"
  },
  {
    "id": 160,
    "name": "Espi­nazo",
    "dept": "CARNE",
    "price": 12500,
    "unit": "KG",
    "stock": 999876.3400000001,
    "stockKg": 999876.3400000001,
    "image": null
  },
  {
    "id": 170,
    "name": "Cuadril",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "stock": 999894.9300000005,
    "stockKg": 999894.9300000005,
    "image": "/productos/cuadril.png"
  },
  {
    "id": 180,
    "name": "Bife Ancho",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "stock": 999766.1000000009,
    "stockKg": 999766.1000000009,
    "image": "/productos/bife-ancho.png"
  },
  {
    "id": 200,
    "name": "Nalga",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "stock": 999865.7099999988,
    "stockKg": 999865.7099999988,
    "image": "/productos/nalga.png"
  },
  {
    "id": 210,
    "name": "Cuadrada",
    "dept": "CARNE",
    "price": 23000,
    "unit": "KG",
    "stock": 999907.7699999991,
    "stockKg": 999907.7699999991,
    "image": "/productos/cuadrada.png"
  },
  {
    "id": 220,
    "name": "Bola De Lomo",
    "dept": "CARNE",
    "price": 21000,
    "unit": "KG",
    "stock": 999904.5599999991,
    "stockKg": 999904.5599999991,
    "image": "/productos/bola-de-lomo.png"
  },
  {
    "id": 230,
    "name": "Peceto",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "stock": 999984.1699999993,
    "stockKg": 999984.1699999993,
    "image": "/productos/peceto.png"
  },
  {
    "id": 240,
    "name": "Oferta Tapa Asado",
    "dept": "CARNE",
    "price": 21900,
    "unit": "KG",
    "stock": 999999,
    "stockKg": 999999,
    "image": "/productos/oferta-tapa-asado.png"
  },
  {
    "id": 250,
    "name": "Bife De Chorizo",
    "dept": "CARNE",
    "price": 25900,
    "unit": "KG",
    "stock": 999990.2899999998,
    "stockKg": 999990.2899999998,
    "image": "/productos/bife-de-chorizo.png"
  },
  {
    "id": 300,
    "name": "Picada Comun",
    "dept": "CARNE",
    "price": 17000,
    "unit": "KG",
    "stock": 999783.389999998,
    "stockKg": 999783.389999998,
    "image": "/productos/picada-comun.png"
  },
  {
    "id": 310,
    "name": "Oferta Picada Comun",
    "dept": "CARNE",
    "price": 17000,
    "unit": "KG",
    "stock": 999915.4799999996,
    "stockKg": 999915.4799999996,
    "image": "/productos/oferta-picada-comun.png"
  },
  {
    "id": 400,
    "name": "matambre arrollado",
    "dept": "CARNE",
    "price": 25000,
    "unit": "KG",
    "stock": 1000018,
    "stockKg": 1000018,
    "image": null
  },
  {
    "id": 510,
    "name": "Pechito De Cerdo",
    "dept": "CERDO",
    "price": 9000,
    "unit": "KG",
    "stock": 999961.3200000002,
    "stockKg": 999961.3200000002,
    "image": "/productos/pechito-de-cerdo.png"
  },
  {
    "id": 550,
    "name": "Matambre De Cerdo",
    "dept": "CERDO",
    "price": 13500,
    "unit": "KG",
    "stock": 1000021.49,
    "stockKg": 1000021.49,
    "image": null
  },
  {
    "id": 560,
    "name": "Boldiola De Cerdo",
    "dept": "CERDO",
    "price": 13500,
    "unit": "KG",
    "stock": 999980.82,
    "stockKg": 999980.82,
    "image": "/productos/boldiola-de-cerdo.png"
  },
  {
    "id": 710,
    "name": "Pollo Entero",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "stock": 999790.64,
    "stockKg": 999790.64,
    "image": "/productos/pollo-entero.png"
  },
  {
    "id": 720,
    "name": "Pollo Trozado",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "stock": 999899.5599999997,
    "stockKg": 999899.5599999997,
    "image": null
  },
  {
    "id": 740,
    "name": "Oferta Pata Y Muslo",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "stock": 999468.6500000005,
    "stockKg": 999468.6500000005,
    "image": "/productos/oferta-pata-y-muslo.png"
  },
  {
    "id": 750,
    "name": "Pechuga",
    "dept": "AVES",
    "price": 9500,
    "unit": "KG",
    "stock": 1000006.14,
    "stockKg": 1000006.14,
    "image": "/productos/pechuga.png"
  },
  {
    "id": 920,
    "name": "Milanesa De Pollo",
    "dept": "PREPARADOS",
    "price": 8500,
    "unit": "KG",
    "stock": 999851.7699999993,
    "stockKg": 999851.7699999993,
    "image": "/productos/milanesa-de-pollo.png"
  },
  {
    "id": 930,
    "name": "Oferta De Milanesa",
    "dept": "PREPARADOS",
    "price": 8500,
    "unit": "KG",
    "stock": 999750.009999999,
    "stockKg": 999750.009999999,
    "image": "/productos/oferta-de-milanesa.png"
  },
  {
    "id": 940,
    "name": "Oferta alita",
    "dept": "AVES",
    "price": 3500,
    "unit": "KG",
    "stock": 999724.9599999998,
    "stockKg": 999724.9599999998,
    "image": "/productos/oferta-alita.png"
  },
  {
    "id": 950,
    "name": "Hamburguesa",
    "dept": "CARNE",
    "price": 17000,
    "unit": "KG",
    "stock": 999996.02,
    "stockKg": 999996.02,
    "image": "/productos/hamburguesa.png"
  },
  {
    "id": 960,
    "name": "Oferta Suprema",
    "dept": "AVES",
    "price": 13500,
    "unit": "KG",
    "stock": 999752.0199999986,
    "stockKg": 999752.0199999986,
    "image": "/productos/oferta-suprema.png"
  },
  {
    "id": 1120,
    "name": "Chorizo",
    "dept": "EMBUTIDO",
    "price": 11000,
    "unit": "KG",
    "stock": 999887.7800000005,
    "stockKg": 999887.7800000005,
    "image": "/productos/chorizo.png"
  },
  {
    "id": 1140,
    "name": "Morcilla",
    "dept": "EMBUTIDO",
    "price": 7500,
    "unit": "KG",
    "stock": 999976.4500000002,
    "stockKg": 999976.4500000002,
    "image": "/productos/morcilla.png"
  },
  {
    "id": 1240,
    "name": "Higado",
    "dept": "ACHURAS",
    "price": 6800,
    "unit": "KG",
    "stock": 999862.1099999987,
    "stockKg": 999862.1099999987,
    "image": "/productos/higado.png"
  },
  {
    "id": 1708,
    "name": "huevo x 6 un",
    "dept": "HUEVO",
    "price": 1500,
    "unit": "UN",
    "stock": 1000,
    "stockKg": 1000,
    "image": null
  },
  {
    "id": 1709,
    "name": "huevo x 10 un",
    "dept": "HUEVO",
    "price": 2500,
    "unit": "UN",
    "stock": 998,
    "stockKg": 998,
    "image": null
  },
  {
    "id": 1710,
    "name": "huevo x 15 un",
    "dept": "HUEVO",
    "price": 3300,
    "unit": "UN",
    "stock": 997,
    "stockKg": 997,
    "image": null
  },
  {
    "id": 7798088142615,
    "name": "aceite de oliva",
    "dept": "ALMACEN",
    "price": 8000,
    "unit": "UN",
    "stock": 6,
    "stockKg": 6,
    "image": "/productos/aceite-de-oliva.png"
  },
  {
    "id": 7798342990171,
    "name": "colita de cuadril",
    "dept": "GENERAL",
    "price": 1000,
    "unit": "UN",
    "stock": 10000,
    "stockKg": 10000,
    "image": "/productos/colita-de-cuadril.png"
  },
  {
    "id": 7798342990172,
    "name": "tapa de asado",
    "dept": "CARNE",
    "price": 19900,
    "unit": "KG",
    "stock": 1000,
    "stockKg": 1000,
    "image": "/productos/tapa-de-asado.png"
  },
  {
    "id": 7798342990173,
    "name": "huevo  maple",
    "dept": "HUEVO",
    "price": 6000,
    "unit": "UN",
    "stock": 9994,
    "stockKg": 9994,
    "image": null
  },
  {
    "id": 7798342990175,
    "name": "papas MC.",
    "dept": "ALMACEN",
    "price": 4500,
    "unit": "UN",
    "stock": 9955,
    "stockKg": 9955,
    "image": "/productos/papas-mc.png"
  },
  {
    "id": 7798342990179,
    "name": "carbon",
    "dept": "ALMACEN",
    "price": 7000,
    "unit": "UN",
    "stock": 10000000,
    "stockKg": 10000000,
    "image": "/productos/carbon.png"
  },
  {
    "id": 7798342990181,
    "name": "Pata Muslo",
    "dept": "POLLO",
    "price": 4900,
    "unit": "KG",
    "stock": 999,
    "stockKg": 999,
    "image": "/productos/pata-muslo.png"
  },
  {
    "id": 7798342990184,
    "name": "provenzal alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 7,
    "stockKg": 7,
    "image": "/productos/provenzal-alicante.png"
  },
  {
    "id": 7798342990185,
    "name": "chimichurri alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 12,
    "stockKg": 12,
    "image": null
  },
  {
    "id": 7798342990186,
    "name": "arroz alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 11,
    "stockKg": 11,
    "image": null
  },
  {
    "id": 7798342990188,
    "name": "pizza alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 23,
    "stockKg": 23,
    "image": null
  },
  {
    "id": 7798342990174,
    "name": "patitas congelados",
    "dept": "ALMACEN",
    "price": 4000,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": "/productos/patitas-congelados.png"
  },
  {
    "id": 770,
    "name": "Alitas",
    "dept": "AVES",
    "price": 3500,
    "unit": "KG",
    "stock": 999901.3799999995,
    "stockKg": 999901.3799999995,
    "image": "/productos/alitas.png"
  },
  {
    "id": 520,
    "name": "Carre De Cerdo",
    "dept": "CERDO",
    "price": 8500,
    "unit": "KG",
    "stock": 999953.0800000011,
    "stockKg": 999953.0800000011,
    "image": null
  },
  {
    "id": 730,
    "name": "Pata Y Muslo",
    "dept": "AVES",
    "price": 4900,
    "unit": "KG",
    "stock": 999598.8500000001,
    "stockKg": 999598.8500000001,
    "image": "/productos/pata-y-muslo.png"
  },
  {
    "id": 780,
    "name": "Menudo",
    "dept": "AVES",
    "price": 500,
    "unit": "KG",
    "stock": 999901.2999999998,
    "stockKg": 999901.2999999998,
    "image": null
  },
  {
    "id": 790,
    "name": "Carcaza",
    "dept": "AVES",
    "price": 100,
    "unit": "KG",
    "stock": 999847.0900000002,
    "stockKg": 999847.0900000002,
    "image": null
  },
  {
    "id": 970,
    "name": "Oferta Trozado",
    "dept": "AVES",
    "price": 4500,
    "unit": "KG",
    "stock": 999713.4499999995,
    "stockKg": 999713.4499999995,
    "image": null
  },
  {
    "id": 1210,
    "name": "Chinchulin",
    "dept": "ACHURAS",
    "price": 6800,
    "unit": "KG",
    "stock": 999971.5,
    "stockKg": 999971.5,
    "image": null
  },
  {
    "id": 1250,
    "name": "Mondongo",
    "dept": "ACHURAS",
    "price": 10000,
    "unit": "KG",
    "stock": 999994.1599999999,
    "stockKg": 999994.1599999999,
    "image": null
  },
  {
    "id": 1711,
    "name": "pan rallado",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 969,
    "stockKg": 969,
    "image": null
  },
  {
    "id": 2050,
    "name": "Salsa Tau",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "stock": 1000005,
    "stockKg": 1000005,
    "image": null
  },
  {
    "id": 2060,
    "name": "Salsa AJ51",
    "dept": "ALMACEN",
    "price": 3500,
    "unit": "UN",
    "stock": 1000004,
    "stockKg": 1000004,
    "image": null
  },
  {
    "id": 2070,
    "name": "Sal Y limon",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 1000003,
    "stockKg": 1000003,
    "image": null
  },
  {
    "id": 5330,
    "name": "Grasa",
    "dept": "CERDO",
    "price": 2000,
    "unit": "KG",
    "stock": 1000048,
    "stockKg": 1000048,
    "image": null
  },
  {
    "id": 99991,
    "name": "Alfajor Triple",
    "dept": "GENERAL",
    "price": 1000,
    "unit": "UN",
    "stock": 100,
    "stockKg": 100,
    "image": null
  },
  {
    "id": 76625249599,
    "name": "bolsa de horno",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 15,
    "stockKg": 15,
    "image": null
  },
  {
    "id": 754697504357,
    "name": "sal carne",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 9,
    "stockKg": 9,
    "image": null
  },
  {
    "id": 7790127732672,
    "name": "aceituna",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 7,
    "stockKg": 7,
    "image": "/productos/aceituna.png"
  },
  {
    "id": 7798088140178,
    "name": "jugo de limon",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 4,
    "stockKg": 4,
    "image": null
  },
  {
    "id": 7798146138185,
    "name": "mayonesa",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 6,
    "stockKg": 6,
    "image": null
  },
  {
    "id": 7798342990167,
    "name": "pan r. rebosado",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 1000,
    "stockKg": 1000,
    "image": null
  },
  {
    "id": 7798342990168,
    "name": "pan r. comun",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 1000,
    "stockKg": 1000,
    "image": "/productos/pan-r-comun.png"
  },
  {
    "id": 7798342990169,
    "name": "sal achuras",
    "dept": "GENERAL",
    "price": 3000,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990170,
    "name": "sal c.cerdo",
    "dept": "GENERAL",
    "price": 3000,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990176,
    "name": "condimentos",
    "dept": "ALMACEN",
    "price": 500,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990177,
    "name": "grasa vacuna",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990178,
    "name": "grasa de cerdo",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990180,
    "name": "leña",
    "dept": "ALMACEN",
    "price": 7000,
    "unit": "UN",
    "stock": 5,
    "stockKg": 5,
    "image": null
  },
  {
    "id": 7798342990182,
    "name": "Menudos",
    "dept": "POLLO",
    "price": 500,
    "unit": "KG",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990183,
    "name": "Carcasa",
    "dept": "POLLO",
    "price": 100,
    "unit": "KG",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990187,
    "name": "queso rallado",
    "dept": "ALMACEN",
    "price": 1000,
    "unit": "UN",
    "stock": 27,
    "stockKg": 27,
    "image": null
  },
  {
    "id": 7798342990189,
    "name": "pan premiun",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "stock": 11,
    "stockKg": 11,
    "image": null
  },
  {
    "id": 7798342990191,
    "name": "tau mayonesa ajo",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "stock": 4,
    "stockKg": 4,
    "image": null
  },
  {
    "id": 7798342990193,
    "name": "tau guacamole",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "stock": 2,
    "stockKg": 2,
    "image": null
  },
  {
    "id": 7798342990194,
    "name": "tau barbacoa",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "stock": 2,
    "stockKg": 2,
    "image": null
  },
  {
    "id": 7798342990200,
    "name": "aji picante AJ51",
    "dept": "ALMACEN",
    "price": 4000,
    "unit": "UN",
    "stock": 1,
    "stockKg": 1,
    "image": null
  },
  {
    "id": 7798342990201,
    "name": "aceitunas",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "stock": 10,
    "stockKg": 10,
    "image": null
  },
  {
    "id": 7798342990202,
    "name": "pimenton alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 9,
    "stockKg": 9,
    "image": null
  },
  {
    "id": 7798342990208,
    "name": "pure de tomate",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 12,
    "stockKg": 12,
    "image": null
  },
  {
    "id": 7798342990209,
    "name": "rebozador premium",
    "dept": "ALMACEN",
    "price": 2000,
    "unit": "UN",
    "stock": 11,
    "stockKg": 11,
    "image": null
  },
  {
    "id": 530,
    "name": "Oferta Carre",
    "dept": "CERDO",
    "price": 7500,
    "unit": "KG",
    "stock": 1000050,
    "stockKg": 1000050,
    "image": null
  },
  {
    "id": 1220,
    "name": "Riñon",
    "dept": "ACHURAS",
    "price": 5800,
    "unit": "KG",
    "stock": 1000000.58,
    "stockKg": 1000000.58,
    "image": null
  },
  {
    "id": 2147483647,
    "name": "Cadril",
    "dept": "CARNE",
    "price": 13500,
    "unit": "KG",
    "stock": 1000024,
    "stockKg": 1000024,
    "image": null
  },
  {
    "id": 7798342990190,
    "name": "bolsa carnes rojas",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 6,
    "stockKg": 6,
    "image": null
  },
  {
    "id": 7798342990192,
    "name": "tau cheddar",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990195,
    "name": "tau mayonesa picante",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "stock": 1,
    "stockKg": 1,
    "image": null
  },
  {
    "id": 7798342990196,
    "name": "sal pollo",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 6,
    "stockKg": 6,
    "image": null
  },
  {
    "id": 7798342990197,
    "name": "sal cerdo y cordero",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 4,
    "stockKg": 4,
    "image": null
  },
  {
    "id": 7798342990198,
    "name": "provenzal AJ51",
    "dept": "ALMACEN",
    "price": 4000,
    "unit": "UN",
    "stock": 4,
    "stockKg": 4,
    "image": null
  },
  {
    "id": 7798342990199,
    "name": "salsa de soja",
    "dept": "ALMACEN",
    "price": 4000,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990203,
    "name": "mayonesa hellmann´s",
    "dept": "ALMACEN",
    "price": 3000,
    "unit": "UN",
    "stock": 2,
    "stockKg": 2,
    "image": null
  },
  {
    "id": 7798342990211,
    "name": "comino alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 6,
    "stockKg": 6,
    "image": null
  },
  {
    "id": 7798342990212,
    "name": "bicarbonato alicante",
    "dept": "ALMACEN",
    "price": 1500,
    "unit": "UN",
    "stock": 10,
    "stockKg": 10,
    "image": null
  },
  {
    "id": 7798342990213,
    "name": "tau caesar",
    "dept": "ALMACEN",
    "price": 5500,
    "unit": "UN",
    "stock": 2,
    "stockKg": 2,
    "image": null
  },
  {
    "id": 7798342990214,
    "name": "tau teriyaki",
    "dept": "GENERAL",
    "price": 5500,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990215,
    "name": "tau mayo con chimi",
    "dept": "GENERAL",
    "price": 5500,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990216,
    "name": "tau big tau",
    "dept": "GENERAL",
    "price": 5500,
    "unit": "UN",
    "stock": 999,
    "stockKg": 999,
    "image": null
  },
  {
    "id": 7798342990217,
    "name": "milanesa alicante",
    "dept": "GENERAL",
    "price": 1500,
    "unit": "UN",
    "stock": 12,
    "stockKg": 12,
    "image": null
  }
];

export function buildBranchProducts(sucursalId: number): FallbackCatalogProduct[] {
  const branchCompId = `frigorifico-maciel-suc-${sucursalId}`;
  const branchCompName = "Frigorífico Maciel";
  return RAW_PRODUCTS.map((item) => {
    const rawStock = item.stockKg ?? item.stock ?? 999;
    const stockKg = typeof rawStock === "number" && rawStock > 0 ? rawStock : 999;
    return {
      id: `fallback-suc-${sucursalId}-${item.id}`,
      name: item.name,
      category: item.dept.toLowerCase(),
      categoryName: item.dept,
      department: item.dept,
      price: item.price,
      stock: stockKg,
      stockKg: stockKg,
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
    };
  });
}

export const FALLBACK_PRODUCTS_SUC_1: FallbackCatalogProduct[] = buildBranchProducts(1);

export const FALLBACK_PRODUCTS: FallbackCatalogProduct[] = [
  ...FALLBACK_PRODUCTS_SUC_1,
];
