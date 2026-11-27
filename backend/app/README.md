# Aplicación FastAPI (`backend/app/`)

## 1. Qué hace
Implementa la lógica del servidor FastAPI: configuración de CORS, conexión a base de datos y montaje de routers modulares.

## 2. De dónde viene
- Invocado por el servidor ASGI (Uvicorn) a través de `backend/app/main.py`.

## 3. Subdirectorios y Archivos
- `main.py`: Punto de entrada de FastAPI; declara la aplicación y monta los routers.
- `config.py` & `database.py`: Gestión de variables de entorno y sesión de SQLAlchemy.
- `api/`: Routers de endpoints (`auth`, `products`, `db`, `cobrofacil`).
- `models/`: Definiciones de tablas ORM SQLAlchemy (`user`, `order`, `product`, `local`).
- `schemas/`: Modelos Pydantic para validación de entrada/salida de datos puros.
- `services/`: Lógica de negocio (Cerebro) separada de los controladores.

## 4. Hacia dónde sale
- Hacia los clientes HTTP devolviendo JSON puros y hacia PostgreSQL.
