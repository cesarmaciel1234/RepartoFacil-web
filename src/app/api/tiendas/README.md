# Endpoint de Tiendas API (`src/app/api/tiendas/`)

## 1. Qué hace
Provee el listado en vivo de tiendas y sucursales comerciales conectadas en PostgreSQL (`crm_libro_local`).

## 2. De dónde viene
- Invocado por navegadores, clientes de Reparto Fácil o comprobaciones de infraestructura vía curl.

## 3. Archivos y Rutas
- `route.ts`: Atiende `GET /api/tiendas` devolviendo los comercios y sucursales con costo de envío y estado operativo.

## 4. Hacia dónde sale
- Hacia PostgreSQL 16 local en el VPS de Oracle Cloud (`crm_libro_local`) mediante el motor unificado de `src/app/api/cobrofacil/[...path]/route.ts`.
