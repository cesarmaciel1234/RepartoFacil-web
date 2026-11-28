# Acceso Directo de Repartidor (`src/app/repartidor/`)

## 1. Qué hace
Punto de entrada de enlace legacy para choferes y accesos directos guardados. Redirige inmediatamente con `replace` a la raíz `/` para evitar rutas paralelas en el historial de navegación que permitan el gesto de swipe-back en iOS.

## 2. De dónde viene
- Enlaces históricos, accesos directos o marcadores de choferes.

## 3. Archivos y Vistas
- `page.tsx`: Redirige de forma instantánea a `/` sin acumular historial en el navegador. El aislamiento condicional estricto se orquesta en `src/app/page.tsx`.

## 4. Hacia dónde sale
- Redirección con `router.replace("/")` hacia `src/app/page.tsx`.
