# Plano General del Proyecto: Reparto Fácil Web

**Ubicación:** Raíz del proyecto (`C:\Users\cesar\OneDrive\Desktop\RepartoFacil-web`)  
**Rol del Proyecto:** Aplicación web Next.js (App Router) para el marketplace multitienda de Reparto Fácil, el proceso de compra (checkout) de clientes y la experiencia móvil de repartidores. Se integra con Cobro Fácil compartiendo la misma base de datos PostgreSQL.

---

## 1. De dónde viene cada flujo (Entradas y Disparadores)

```
┌──────────────────────────────────────┐     ┌────────────────────────────────────┐
│         COMPRADORES WEB / MÓVIL      │     │      REPARTIDORES / RIDERS         │
│  - Catálogo público: / (sin login)   │     │  - PWA móvil: /repartidor          │
│  - Carrito y Checkout: /checkout     │     │  - Radar, rutas y entregas         │
│  - Login / Registro: al pagar        │     │  - Billetera y telemetría          │
└──────────────────┬───────────────────┘     └─────────────────┬──────────────────┘
                   │                                           │
                   ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REPARTO FÁCIL WEB (Next.js)                           │
│              App Router (`src/app/`) + API Routes (`src/app/api/`)              │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
                   ▲                   │                   ▲
                   │                   │                   │
┌──────────────────┴───────────────────┴───────────────────┴──────────────────────┐
│  BACKEND AUXILIAR FASTAPI                 BACKEND UNIFICADO COBRO FÁCIL         │
│  (`backend/app/`)                         (https://cobrofacil.onrender.com)     │
│  - Endpoints de autenticación JWT         - Proxy de inventario y catálogo      │
│  - Tareas operativas de soporte           - PostgreSQL compartido (esquema pub) │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1. **Compradores en Marketplace (`src/modulos/tienda/`):**
   - Navegan comercios, seleccionan productos y arman su carrito sin requerir autenticación previa.
   - En el checkout, solicitan o validan sesión para confirmar la orden vía `POST /api/orders`.
2. **Repartidores (`src/modulos/repartidor/`):**
   - Acceden al módulo de radar, tracking de pedidos asignados, geolocalización y balance de cobranzas.
3. **APIs Operativas Internas (`src/app/api/`):**
   - `orders/`: Creación y consulta de pedidos en PostgreSQL con `src/lib/db.ts`.
   - `chat/`: Mensajería entre comprador, comercio y repartidor.
   - `orders/custodio/`: Verificación y validación de entregas mediante PIN o firma.
4. **Proxies a Cobro Fácil (`src/app/api/cobrofacil/` y `src/app/api/auth/`):**
   - Reenvío de solicitudes al backend central `https://cobrofacil.onrender.com`.

---

## 2. Qué hace el sistema (Cerebro y Servicios Internos)

- **Capa de Frontend y Vistas (`src/app/`, `src/components/`):**
  - Páginas React con Tailwind CSS y componentes Shadcn/Radix UI.
  - Vistas adaptadas a móvil y escritorio para catálogo, carrito, tracking y perfil.
- **Lógica de Negocio y Cliente (`src/lib/`, `src/hooks/`):**
  - `validateOrder.ts`: Validación exhaustiva de pedidos, cálculo de costos de envío y aislamiento por tenant.
  - `orderAuth.ts` & `clientAuth.ts`: Manejo de tokens JWT y permisos de usuario.
  - `custodio.ts`: Seguridad y liberación de cobros contra entrega.
  - `db.ts`: Pool de conexión a PostgreSQL en Neon.
- **Módulos de Dominio (`src/modulos/`):**
  - `tienda/`: Ficha del comercio, carrito reactivo, pasarela de checkout e historial de pedidos.
  - `repartidor/`: Radar de pedidos disponibles, mapa de ruta y liquidaciones.

---

## 3. Hacia dónde va (Salidas e Impacto)

1. **Pantallas del Usuario:**
   - Interfaz fluida para compradores (catálogo y seguimiento) y repartidores (móvil).
2. **Persistencia Compartida:**
   - Tablas en PostgreSQL Neon (`public`): `orders`, `users`, `order_items`, `reseñas`.
3. **Sincronización con Tiendas Físicas:**
   - Los pedidos generados impactan en Cobro Fácil TPV para que la tienda prepare el pedido.
4. **Eventos y Notificaciones:**
   - Integración con Firebase / WebSockets para actualización de estado del pedido en tiempo real.

---

## 4. Directorios Clave y sus Índices

- [`AGENTS.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/AGENTS.md): Reglas permanentes y leyes de arquitectura obligatorias para IA y desarrolladores.
- [`src/modulos/tienda/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/tienda/README.md): Módulo de experiencia del comprador.
- [`src/modulos/repartidor/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/repartidor/README.md): Módulo de experiencia del repartidor.
- [`docs/PRODUCCION.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/docs/PRODUCCION.md): Guía de despliegue en Render y variables de entorno requeridas.
