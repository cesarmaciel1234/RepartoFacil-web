# Módulo de Reseñas API (`src/app/api/resenas/`)

## 1. Qué hace
Permite registrar y consultar valoraciones y comentarios de clientes hacia los comercios asociados, calculando los promedios de estrellas mostrados en el catálogo.

## 2. De dónde viene
- Invocado al finalizar una orden o desde la ficha de comercio en la tienda.
- Consultas agregadas de reputación desde `src/app/api/cobrofacil/[...path]/route.ts`.

## 3. Archivos y Rutas
- `publicas/route.ts`: Endpoint público para consultar calificaciones y comentarios aprobados de un comercio.
- `route.ts`: Endpoint protegido para que un comprador verificado envíe su puntuación.

## 4. Hacia dónde sale
- Hacia la tabla `public.repartofacil_resenas` en PostgreSQL 16 local.
