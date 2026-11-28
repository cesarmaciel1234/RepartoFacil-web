# Carpeta: App Router de Next.js (`src/app`)

## 1. Qué hace
Define las rutas principales del frontend web y los endpoints de API (`/api`). `page.tsx` gobierna la vista raíz con aislamiento condicional estricto entre Tienda y Repartidor, impidiendo que convivan en el DOM o se superpongan en swipes de iOS.

## 2. De dónde viene
- Navegación inicial del usuario desde el navegador o PWA (`/`, `/?tienda=...`).
- Peticiones HTTP del cliente hacia las API routes internas.

## 3. Archivos principales
- `page.tsx`: Punto de entrada único con renderizado condicional estricto. Si hay sesión de repartidor activa monta exclusivamente `<RepartidorPiramidal />` con trampa de retroceso y bloqueo de swipe atrás (`overscroll-behavior-x: none`); si no hay sesión monta exclusivamente `<TiendaPiramidal />`.
- `layout.tsx`: Layout raíz con fuentes, temas, proveedores y bloqueo global de overscroll horizontal.
- `repartidor/`: Redirección inmediata por reemplazo hacia `/` para eliminar rutas separadas que habiliten swipes en iOS.
- `api/`: Subdirectorio de endpoints (`auth/`, `orders/`, `chat/`, `cobrofacil/`, `db/`).

## 4. Hacia dónde sale
Hacia `<TiendaPiramidal />` o `<RepartidorPiramidal />`.
