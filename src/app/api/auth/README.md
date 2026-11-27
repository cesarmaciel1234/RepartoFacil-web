# Módulo de Autenticación API (`src/app/api/auth/`)

## 1. Qué hace
Gestiona el inicio de sesión unificado, registro de clientes y repartidores, emisión y validación de tokens JWT tanto para clientes como para el personal operativo.

## 2. De dónde viene
- Llamadas desde `src/modulos/tienda/ui/ModalClientAuth.tsx` (login de cliente).
- Llamadas desde `src/modulos/repartidor/ui/ModalDriverAuth.tsx` (login de repartidor).
- Verificaciones de token desde `src/lib/orderAuth.ts` al validar solicitudes protegidas.

## 3. Archivos y Rutas
- `[...path]/route.ts`: Manejador catch-all que rutea peticiones hacia el servicio de autenticación de Cobro Fácil (`POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/register-guest`) y devuelve tokens JWT con formato Bearer.

## 4. Hacia dónde sale
- Hacia el backend central de Cobro Fácil en `http://127.0.0.1:5005/api/auth` (o `https://cobrofacil.157.151.3.66.sslip.io`).
- Hacia las tablas `public.local_users` y `public.usuarios` en PostgreSQL 16.
