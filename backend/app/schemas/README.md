# Esquemas Pydantic (`backend/app/schemas/`)

## 1. Qué hace
Define la validación y serialización de datos de entrada y salida mediante modelos Pydantic, garantizando la regla de "datos puros" sin HTML ni acoplamiento visual.

## 2. De dónde viene
- Parámetros de petición HTTP (body / query) recibidos por los endpoints en `backend/app/api/`.

## 3. Archivos principales
- `user.py`: Esquemas `UserCreate`, `UserLogin`, `UserResponse`.
- `product.py`: Esquemas de validación de productos y listas de catálogo.

## 4. Hacia dónde sale
- Hacia los controladores de API para devolver JSON tipados a los clientes.
