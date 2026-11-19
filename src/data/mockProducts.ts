export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  image: string;
  isPopular?: boolean;
  discountBadge?: string;
  stockKg?: number;
}

export const CATEGORIES = [
  { id: "todos", name: "Todos los cortes", icon: "🔥" },
  { id: "vacuno", name: "Cortes Vacunos", icon: "🥩" },
  { id: "pollo", name: "Pollo & Granja", icon: "🍗" },
  { id: "cerdo", name: "Cortes de Cerdo", icon: "🥓" },
  { id: "achuras", name: "Achuras & Embutidos", icon: "🌭" },
  { id: "combos", name: "Combos & Ofertas", icon: "📦" },
  { id: "almacen", name: "Carbón & Especias", icon: "🧂" },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Vacuno
  {
    id: "prod-1",
    name: "Asado de Tira Especial",
    category: "vacuno",
    price: 9800,
    unit: "kg",
    description: "Corte tradicional parrillero de novillo seleccionado, grasa justa y carne tierna.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    discountBadge: "15% OFF",
    stockKg: 150,
  },
  {
    id: "prod-2",
    name: "Vacío del Centro",
    category: "vacuno",
    price: 10400,
    unit: "kg",
    description: "Vacío fino de novillo con cuerito crocante, ideal para asar a fuego lento.",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    stockKg: 95,
  },
  {
    id: "prod-3",
    name: "Entraña Fina Seleccionada",
    category: "vacuno",
    price: 12500,
    unit: "kg",
    description: "La estrella de la parrilla, textura mantecosa y cocción rápida vuelta y vuelta.",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    discountBadge: "Top Ventas",
    stockKg: 40,
  },
  {
    id: "prod-4",
    name: "Matambre Vacuno Tierno",
    category: "vacuno",
    price: 9200,
    unit: "kg",
    description: "Desgrasado y listo para hacer a la pizza o arrollado al horno.",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&auto=format&fit=crop&q=80",
    stockKg: 60,
  },
  {
    id: "prod-5",
    name: "Bife de Chorizo Premium",
    category: "vacuno",
    price: 11900,
    unit: "kg",
    description: "Corte grueso, jugoso y con veteado perfecto para plancha o parrilla.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    stockKg: 55,
  },
  {
    id: "prod-6",
    name: "Bola de Lomo p/ Milanesas",
    category: "vacuno",
    price: 8900,
    unit: "kg",
    description: "Feteada fina sin nervios, súper tierna para milanesas doradas.",
    image: "https://images.unsplash.com/photo-1588347818036-558601350947?w=600&auto=format&fit=crop&q=80",
    stockKg: 120,
  },

  // Pollo
  {
    id: "prod-7",
    name: "Supremas de Pollo Frescas",
    category: "pollo",
    price: 6800,
    unit: "kg",
    description: "Pechugas desgrasadas y limpias, sin piel ni huesos.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    discountBadge: "Oferta",
    stockKg: 80,
  },
  {
    id: "prod-8",
    name: "Pollo Entero de Campo",
    category: "pollo",
    price: 3600,
    unit: "kg",
    description: "Pollo fresco de granja, peso promedio 2.4 kg, ideal al spiedo o al horno.",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80",
    stockKg: 110,
  },
  {
    id: "prod-9",
    name: "Pata Muslo Deshuesada",
    category: "pollo",
    price: 5900,
    unit: "kg",
    description: "Corte sabroso y jugoso para milanesas o arrollados a la parrilla.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    stockKg: 70,
  },

  // Cerdo
  {
    id: "prod-10",
    name: "Bondiola de Cerdo Fresca",
    category: "cerdo",
    price: 8200,
    unit: "kg",
    description: "Tiernísima y veteada, ideal para hacer braseada, bifecitos o al disco.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    discountBadge: "Recomendado",
    stockKg: 65,
  },
  {
    id: "prod-11",
    name: "Pechito de Cerdo c/ Manta",
    category: "cerdo",
    price: 7600,
    unit: "kg",
    description: "Costillitas de cerdo con manta jugosa para dorar a la parrilla.",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80",
    stockKg: 50,
  },
  {
    id: "prod-12",
    name: "Matambrito de Cerdo",
    category: "cerdo",
    price: 9900,
    unit: "kg",
    description: "Se hace en 15 minutos a las brasas con limón. Crocante y suave.",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&auto=format&fit=crop&q=80",
    stockKg: 35,
  },

  // Achuras & Embutidos
  {
    id: "prod-13",
    name: "Chorizo Puro Cerdo Casero",
    category: "achuras",
    price: 6200,
    unit: "kg",
    description: "Elaboración artesanal con especias naturales, sin conservantes excesivos.",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    stockKg: 90,
  },
  {
    id: "prod-14",
    name: "Morcilla Criolla Bombón",
    category: "achuras",
    price: 4900,
    unit: "kg",
    description: "Súper suave y cremosa, perfecta para picada parrillera caliente.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    stockKg: 60,
  },
  {
    id: "prod-15",
    name: "Mollejas de Corazón",
    category: "achuras",
    price: 13500,
    unit: "kg",
    description: "Calidad de exportación, crocantes por fuera y tiernas por dentro.",
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80",
    discountBadge: "Delicatesen",
    stockKg: 25,
  },

  // Combos & Ofertas
  {
    id: "combo-1",
    name: "Combo Parrillada Amigos (4-5 pers)",
    category: "combos",
    price: 26500,
    unit: "pack",
    description: "Incluye: 1.5kg Asado Especial + 1kg Vacío + 4 Chorizos Puro Cerdo + 2 Morcillas + 1 Carbón 4kg.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    discountBadge: "Ahorrá 20%",
    stockKg: 30,
  },
  {
    id: "combo-2",
    name: "Caja Semanal Familiar",
    category: "combos",
    price: 32000,
    unit: "pack",
    description: "Incluye: 2kg Milanesas Bola de Lomo + 2kg Supremas + 1 Pollo Entero + 1kg Picada Especial.",
    image: "https://images.unsplash.com/photo-1588347818036-558601350947?w=600&auto=format&fit=crop&q=80",
    isPopular: true,
    discountBadge: "Más Vendido",
    stockKg: 20,
  },

  // Almacen
  {
    id: "alm-1",
    name: "Bolsa de Carbón Quebracho Blanco (4kg)",
    category: "almacen",
    price: 3200,
    unit: "un",
    description: "Brasa duradera de alto poder calórico sin chispas molestas.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80",
    stockKg: 100,
  },
  {
    id: "alm-2",
    name: "Chimichurri Casero del Chef (350ml)",
    category: "almacen",
    price: 2400,
    unit: "un",
    description: "Receta tradicional con hierbas frescas maceradas en aceite y vinagre.",
    image: "https://images.unsplash.com/photo-1514944298350-0199d799052b?w=600&auto=format&fit=crop&q=80",
    stockKg: 50,
  },
];
