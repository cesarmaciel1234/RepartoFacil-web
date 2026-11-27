# Servicios de Backend (`backend/app/services/`)

## 1. Qué hace
Concentra la lógica de negocio pura (Cerebro) de backend: hashing de contraseñas, validación de reglas de negocio y transacciones de base de datos.

## 2. De dónde viene
- Invocado exclusivamente por los routers de API en `backend/app/api/`.

## 3. Archivos principales
- `auth_service.py`: Lógica de autenticación, verificación de contraseñas y creación de tokens JWT.

## 4. Hacia dónde sale
- Hacia los modelos ORM de base de datos y retorno de modelos Pydantic.
