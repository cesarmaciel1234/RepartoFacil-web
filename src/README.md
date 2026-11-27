# Carpeta Raíz de Código Fuente (`src/`)

## 1. Qué hace
Es el núcleo del código de Reparto Fácil Web. Alberga la arquitectura piramidal completa dividida en App Router de Next.js (`app/`), módulos de dominio de negocio (`modulos/`), librerías de infraestructura (`lib/`), componentes visuales (`components/`), tipos (`types/`), datos (`data/`) y hooks (`hooks/`).

## 2. De dónde viene
- Puntos de entrada del framework Next.js 15 a través de `src/app/layout.tsx` y `src/app/page.tsx`.
- Peticiones HTTP del cliente hacia los endpoints de `src/app/api/`.

## 3. Carpetas principales
- `app/`: Enrutamiento de páginas (App Router) y endpoints API REST.
- `modulos/`: Módulos de dominio piramidales (`tienda/` para compradores y `repartidor/` para choferes).
- `components/`: Componentes visuales transversales (UI base shadcn, layouts, mapas interactivos).
- `lib/`: Lógica de negocio pura (Cerebro), cliente PostgreSQL local (`db.ts`), auth (`clientAuth.ts`) y validación de órdenes (`validateOrder.ts`).
- `data/`: Catálogo de respaldo sin conexión (`fallbackCatalog.ts`) y configuración estática.
- `types/`: Definiciones de interfaces TypeScript del e-commerce y pedidos.
- `hooks/`: Hooks de interfaz reutilizables (toast, mobile detection).
- `firebase/`: Cliente para sincronización de mensajería y eventos en tiempo real.
- `ai/`: Integraciones con flujos Genkit de inteligencia artificial.

## 4. Hacia dónde sale
- Hacia el navegador del usuario (HTML/React interactivo renderizado).
- Hacia la base de datos PostgreSQL 16 local (`crm_libro_local`) y el backend de Cobro Fácil en Oracle Cloud.
