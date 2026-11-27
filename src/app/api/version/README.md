# Verificación de Versión API (`src/app/api/version/`)

## 1. Qué hace
Informa la versión activa del frontend, el commit o build timestamp para detectar desincronizaciones entre la PWA del cliente y el servidor.

## 2. De dónde viene
- Consultas periódicas de polling o comprobación de actualización de Service Worker.

## 3. Archivos y Rutas
- `route.ts`: Responde `{ version: "...", env: "production", timestamp: ... }`.

## 4. Hacia dónde sale
- Hacia los mecanismos de actualización en caliente del cliente web.
