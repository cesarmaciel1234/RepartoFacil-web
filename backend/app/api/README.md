# Routers de API FastAPI (`backend/app/api/`)

## 1. Qué hace
Endpoints REST de FastAPI para operaciones auxiliares de catálogo, base de datos y autenticación de usuarios.

## 2. De dónde viene
- Peticiones HTTP dirigidas a `/api/...` cuando se utiliza el backend Python.

## 3. Archivos principales
- `auth.py`: Autenticación, registro y generación de tokens JWT.
- `products.py`: Búsqueda y filtrado de productos.
- `cobrofacil.py`: Puente de sincronización con Cobro Fácil.
- `db.py`: Endpoints de salud y consulta de base de datos.

## 4. Hacia dónde sale
- Hacia los servicios en `backend/app/services/` y respuestas JSON Pydantic.
