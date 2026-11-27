# Endpoint de Despertar / Health-Check (`src/app/api/wake/`)

## 1. Qué hace
Provee un endpoint ligero para comprobaciones de estado de salud (health-check) de la aplicación y calentamiento de conexiones a PostgreSQL.

## 2. De dónde viene
- Uptime monitors, cron jobs del VPS o comprobación de red al iniciar la PWA.

## 3. Archivos y Rutas
- `route.ts`: Ejecuta una comprobación básica de conectividad y responde `200 OK` con `{ status: "awake" }`.

## 4. Hacia dónde sale
- Hacia monitores de uptime y clientes de verificación.
