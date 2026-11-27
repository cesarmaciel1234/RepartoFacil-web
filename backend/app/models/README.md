# Modelos SQLAlchemy (`backend/app/models/`)

## 1. Qué hace
Define las entidades de base de datos como clases ORM de SQLAlchemy para tablas de usuarios, órdenes, productos y locales.

## 2. De dónde viene
- Utilizado por los servicios en `backend/app/services/` y las migraciones de base de datos.

## 3. Archivos principales
- `user.py`: Modelo de usuario del sistema y credenciales.
- `order.py`: Modelo de pedidos y detalles de entrega.
- `product.py`: Modelo de artículos del catálogo.
- `local.py`: Modelo de sucursales y comercios.

## 4. Hacia dónde sale
- Hacia las tablas de la base de datos PostgreSQL.
