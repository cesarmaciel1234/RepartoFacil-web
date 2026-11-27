# API Routes de Reparto Fácil (`src/app/api/`)

## 1. Qué hace
Provee todos los endpoints HTTP REST consumidos por el frontend de compradores y repartidores. Actúa como capa de backend (Cerebro) resolviendo persistencia directa en PostgreSQL o delegando en el backend de Cobro Fácil.

## 2. De dónde viene
- Peticiones fetch del frontend emitidas desde `src/modulos/tienda/` y `src/modulos/repartidor/`.
- Llamadas externas de webhook o sincronización.

## 3. Subdirectorios y Rutas
- `auth/`: Endpoints de autenticación JWT y perfiles (`/api/auth/login`, `/api/auth/me`).
- `orders/`: Creación, listado y cambio de estado de pedidos (`POST /api/orders`, `/api/orders/custodio`).
- `cobrofacil/`: Proxy hacia Cobro Fácil VPS para empresas, productos y sucursales.
- `db/`: Proxy de persistencia directa y consultas SQL multi-tenant sobre PostgreSQL 16.
- `chat/`: Mensajería de texto entre cliente, repartidor y comercio por pedido.
- `resenas/`: Registro y consulta pública de calificaciones por comercio.
- `version/`: Verificación de versión del despliegue y estado de la build.
- `wake/`: Health-check para verificar disponibilidad de los servicios.

## 4. Hacia dónde sale
- Hacia la base de datos PostgreSQL 16 local (`crm_libro_local` vía `src/lib/db.ts`).
- Hacia Cobro Fácil Cloud en el VPS (`https://cobrofacil.157.151.3.66.sslip.io` en puerto 5005).
