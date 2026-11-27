# Plano General del Proyecto: Reparto Fácil Web

**Ubicación:** Raíz del proyecto (`C:\Users\cesar\OneDrive\Desktop\RepartoFacil-web`)  
**Rol del Proyecto:** Aplicación web Next.js 15 (App Router) para el marketplace multitienda de Reparto Fácil, el proceso de compra (checkout) de clientes y la experiencia táctil móvil de repartidores. Se integra con Cobro Fácil compartiendo la misma base de datos PostgreSQL 16 en Oracle Cloud Always Free (`157.151.3.66`).

---

## 1. De dónde viene cada flujo (Entradas y Disparadores)

```
┌──────────────────────────────────────┐     ┌────────────────────────────────────┐
│         COMPRADORES WEB / MÓVIL      │     │      REPARTIDORES / RIDERS         │
│  - Catálogo público: / (sin login)   │     │  - PWA móvil: /repartidor          │
│  - Carrito y Checkout: /checkout     │     │  - Radar, rutas y entregas         │
│  - Login / Registro: al abonar       │     │  - Billetera y telemetría          │
└──────────────────┬───────────────────┘     └─────────────────┬──────────────────┘
                   │                                           │
                   ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REPARTO FÁCIL WEB (Next.js 15)                        │
│              App Router (`src/app/`) + API Routes (`src/app/api/`)              │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
                   ▲                   │                   ▲
                   │                   │                   │
┌──────────────────┴───────────────────┴───────────────────┴──────────────────────┐
│  BACKEND AUXILIAR FASTAPI                 BACKEND UNIFICADO COBRO FÁCIL         │
│  (`backend/app/`)                         (https://cobrofacil.157.151.3.66.sslip.io)
│  - Endpoints de autenticación JWT         - Proxy de inventario y catálogo      │
│  - Tareas operativas de soporte           - PostgreSQL 16 local Oracle Cloud    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1. **Compradores en Marketplace (`src/modulos/tienda/`):**
   - Navegan comercios, seleccionan productos y arman su carrito sin requerir autenticación previa.
   - En el checkout, solicitan o validan sesión para confirmar la orden vía `POST /api/orders`.
2. **Repartidores (`src/modulos/repartidor/`):**
   - Acceden al módulo de radar, tracking de pedidos asignados, geolocalización y balance de cobranzas vía `/repartidor` o cambio de modo en `page.tsx`.
3. **APIs Operativas Internas (`src/app/api/`):**
   - `orders/`: Creación y consulta de pedidos en PostgreSQL con `src/lib/db.ts`.
   - `chat/`: Mensajería entre comprador, comercio y repartidor.
   - `orders/custodio/`: Verificación y validación de entregas mediante PIN o firma.
4. **Proxies a Cobro Fácil (`src/app/api/cobrofacil/` y `src/app/api/auth/`):**
   - Reenvío de solicitudes al backend central `https://cobrofacil.157.151.3.66.sslip.io` (Oracle Cloud Always Free). Ya no se usa Render ni NeonDB para producción.

---

## 2. Qué hace el sistema (Cerebro y Servicios Internos)

- **Capa de Frontend y Vistas (`src/app/`, `src/components/`, `src/modulos/*/ui/`):**
  - Pantallas React con Tailwind CSS y componentes Shadcn/Radix UI.
  - Vistas adaptadas a móvil y escritorio para catálogo, carrito, tracking y perfil.
- **Lógica de Negocio y Cliente (`src/lib/`, `src/modulos/*/motor/`):**
  - `validateOrder.ts`: Validación exhaustiva de pedidos, cálculo de costos de envío y aislamiento por tenant.
  - `orderAuth.ts` & `clientAuth.ts`: Manejo de tokens JWT y permisos de usuario.
  - `custodio.ts`: Seguridad y liberación de cobros contra entrega.
  - `db.ts`: Pool de conexión a PostgreSQL 16 local en el VPS de Oracle Cloud (`crm_libro_local`).
- **Módulos de Dominio Piramidales (`src/modulos/`):**
  - `tienda/`: Ficha del comercio, catálogo, carrito reactivo, pasarela de checkout e historial de pedidos.
  - `repartidor/`: Radar de pedidos disponibles, mapa de ruta interactivo y liquidaciones.

---

## 3. Hacia dónde sale (Salidas e Impacto)

1. **Pantallas del Usuario:**
   - Interfaz fluida para compradores (catálogo y seguimiento) y repartidores (móvil).
2. **Persistencia Compartida:**
   - Tablas en PostgreSQL 16 Oracle Cloud (`public`): `repartofacil_pedidos`, `repartofacil_chat_mensajes`, `usuarios`, `local_users`, `clientes`, `sucursales`, `empresas`. Base de datos con backups automáticos diarios vía Cron.
3. **Sincronización con Tiendas Físicas:**
   - Los pedidos generados impactan en Cobro Fácil TPV para que la tienda prepare el pedido.
4. **Eventos y Notificaciones:**
   - Integración con Firebase / WebSockets para actualización de estado del pedido en tiempo real.

---

## 4. Estructura Piramidal Documentada por Carpeta

Cada carpeta del proyecto cuenta con su archivo `README.md` corto explicando qué hace, de dónde viene, qué contiene y hacia dónde sale:

- [`src/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/README.md): Núcleo de la aplicación.
- [`src/app/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/README.md): App Router y punto de entrada.
  - [`src/app/api/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/api/README.md): Capa de servicios API REST.
    - [`src/app/api/auth/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/api/auth/README.md): Login y tokens JWT.
    - [`src/app/api/orders/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/api/orders/README.md): Gestión de pedidos y custodia.
    - [`src/app/api/cobrofacil/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/api/cobrofacil/README.md): Proxy de catálogo y empresas.
    - [`src/app/api/db/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/api/db/README.md): Persistencia directa en PostgreSQL 16.
    - [`src/app/api/chat/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/api/chat/README.md): Mensajería en tiempo real.
    - [`src/app/api/resenas/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/app/api/resenas/README.md): Calificaciones de comercios.
- [`src/modulos/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/README.md): Módulos piramidales de negocio.
  - [`src/modulos/tienda/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/tienda/README.md): E-commerce de clientes.
    - [`src/modulos/tienda/motor/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/tienda/motor/README.md): Lógica de carrito y pedidos.
    - [`src/modulos/tienda/catalogo/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/tienda/catalogo/README.md): Catálogo y productos.
    - [`src/modulos/tienda/pantallas/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/tienda/pantallas/README.md): Pantallas completas de tienda.
    - [`src/modulos/tienda/pedidos/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/tienda/pedidos/README.md): Sincronización de pedidos.
    - [`src/modulos/tienda/ui/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/tienda/ui/README.md): Elementos visuales (modales, drawers).
  - [`src/modulos/repartidor/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/repartidor/README.md): PWA de choferes.
    - [`src/modulos/repartidor/motor/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/repartidor/motor/README.md): Lógica de rutas y cartera.
    - [`src/modulos/repartidor/ui/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/modulos/repartidor/ui/README.md): Cara visual del repartidor.
- [`src/components/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/components/README.md): Componentes UI reutilizables.
  - [`src/components/ui/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/components/ui/README.md): Primitivas base Shadcn.
- [`src/lib/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/lib/README.md): Conectividad, validación y auth.
- [`src/data/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/data/README.md): Catálogo de contingencia sin conexión.
- [`src/hooks/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/hooks/README.md): Hooks genéricos de interfaz.
- [`src/types/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/src/types/README.md): Tipos e interfaces TypeScript.
- [`backend/README.md`](file:///C:/Users/cesar/OneDrive/Desktop/RepartoFacil-web/backend/README.md): Microservicio auxiliar FastAPI.
