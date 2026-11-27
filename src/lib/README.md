# Carpeta: Librería y Servicios Compartidos (`src/lib`)

## 1. Qué hace
Provee utilidades de infraestructura, validación de esquemas, cabeceras de autorización y conectividad con PostgreSQL 16 local (`db.ts`), validación de pedidos (`validateOrder.ts`) y autenticación (`orderAuth.ts`, `clientAuth.ts`).

## 2. De dónde viene
- Peticiones API (`src/app/api/`) y hooks de cliente (`src/modulos/`).
- Disparadores de peticiones fetch y llamadas HTTP.

## 3. Archivos principales
- `clientAuth.ts`: Genera cabeceras `Authorization: Bearer <token>` para `Client` (`rf_customer_token`) y `Driver` (`rf_driver_token`).
- `orderAuth.ts`: Autentica tokens JWT contra `/api/auth/me` con verificación de roles para App Router.
- `validateOrder.ts`: Valida montos, stock, tarifas e integridad de órdenes con estricto aislamiento multi-tenant.
- `db.ts`: Pool de conexión a PostgreSQL 16 en el VPS de Oracle Cloud Always Free (`crm_libro_local`).
- `custodio.ts`: Lógica de custodia y pin de entrega.

## 4. Hacia dónde sale
- Hacia las API routes (`/api/orders`, `/api/chat`), backend Cobro Fácil y la base de datos PostgreSQL local.
