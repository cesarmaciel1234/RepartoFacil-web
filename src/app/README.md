# Carpeta: App Router de Next.js (`src/app`)

## 1. Qué hace
Define las rutas principales del frontend web y los endpoints de API (`/api`). `page.tsx` gobierna la vista raíz de la aplicación alternando entre el modo Tienda y Repartidor según la sesión activa.

## 2. De dónde viene
- Navegación inicial del usuario desde el navegador (`/`, `/?mode=driver`, `/?tienda=...`).
- Peticiones HTTP del cliente hacia las API routes internas.

## 3. Archivos principales
- `page.tsx`: Punto de entrada de la UI; aplica la regla de arranque dando prioridad a la sesión válida de Repartidor o iniciando en Tienda/Comprador sin modales intrusivos.
- `layout.tsx`: Layout raíz con fuentes, temas y proveedores.
- `api/`: Subdirectorio de endpoints (`auth/`, `orders/`, `chat/`, `cobrofacil/`, `db/`).

## 4. Hacia dónde sale
Hacia `<TiendaPiramidal />` o `<RepartidorPiramidal />`.
