# Backend Auxiliar FastAPI (`backend/`)

## 1. Qué hace
Servicio auxiliar en Python (FastAPI) para microservicios de soporte, autenticación alternativa, generación de reportes e integraciones de catálogo.

## 2. De dónde viene
- Llamadas HTTP desde servicios batch, tareas programadas o el frontend cuando se activa el modo FastAPI.

## 3. Subdirectorios
- `app/`: Código fuente de la aplicación FastAPI (`main.py`, rutas, modelos, esquemas y servicios).
- `tests/`: Suite de pruebas automatizadas con pytest (`test_local_api.py`).

## 4. Hacia dónde sale
- Hacia la base de datos PostgreSQL local (`crm_libro_local`) o SQLite de desarrollo local.
