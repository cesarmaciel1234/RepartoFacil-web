# Proxy de Base de Datos API (`src/app/api/db/`)

## 1. Qué hace
Provee una interfaz segura y controlada para consultas de persistencia directa y lecturas optimizadas sobre la base de datos PostgreSQL compartida, aislando los datos por `empresa_id`.

## 2. De dónde viene
- Invocado por componentes y servicios que requieren validaciones de esquema o consultas directas de bajo overhead (`src/lib/db.ts`).

## 3. Archivos y Rutas
- `[...path]/route.ts`: Atiende endpoints `/api/db/...` traduciendo operaciones contra PostgreSQL mediante el pool unificado de `src/lib/db.ts`.

## 4. Hacia dónde sale
- Hacia PostgreSQL 16 en el VPS de Oracle Cloud (`crm_libro_local`).
