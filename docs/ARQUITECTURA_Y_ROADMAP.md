# 🚀 Arquitectura Integral y Roadmap: RepartoFácil + CobroFácil

> **Visión**: Crear una plataforma de logística y comercio de última milla hiperlocal, rápida y desacoplada, donde conviven tres actores esenciales: **Empresas/Comercios** (gestionados con CobroFácil), **Repartidores** (con telemetría sensorial y despacho inteligente) y **Clientes Finales** (experiencia de compra multitienda unificada).

---

## 🏗️ 1. Arquitectura del Sistema y Separación de Roles

La arquitectura sigue una separación estricta tanto en frontend como en base de datos (`backend/repartofacil.db` en SQLite / FastAPI con proxy inverso en Next.js):

```mermaid
flowchart TD
    subgraph Frontend["Frontend Next.js (PWA Mobile First)"]
        UI_Cliente["🛍️ Módulo Tienda (Cliente)\n- Búsqueda global multitienda ('coca', 'asado')\n- Carrito multitienda\n- Distancia y locales en tiempo real"]
        UI_Repartidor["🚚 Módulo Repartidor\n- Telemetría fusionada (GPS + Brújula + Giroscopio)\n- Seguimiento en vivo de pedido en curso\n- Píldora de estado activa y centrado de ruta"]
        UI_Chat["💬 Chat Tripartito (Campana)\n- Canal en vivo Cliente ⇄ Repartidor ⇄ Empresa\n- Persistente y preparado para CobroFácil"]
    end

    subgraph BackendProxy["Proxy Inverso Next.js"]
        ProxyAuth["/api/auth/*"]
        ProxyDB["/api/db/*"]
    end

    subgraph BackendAPI["Backend FastAPI (Puerto 8000)"]
        AuthEngine["Motor Auth & Roles"]
        DBEngine["Motor de Colecciones"]
    end

    subgraph BaseDeDatos["Base de Datos (repartofacil.db)"]
        Col_Clients[("clients\n- ID, Teléfono, Direcciones\n- Historial de Compras")]
        Col_Drivers[("driverProfiles\n- ID, Vehículo, Calificación\n- Lat/Lng, Billetera")]
        Col_Orders[("orders\n- Estados: Pending, In Transit...\n- Chat IDs, Ruta")]
        Col_Companies[("companies / CobroFácil\n- Sucursales, Catálogo, Stock")]
    end

    subgraph CloudExt["Ecosistema en la Nube"]
        CobroFacil["🏢 CobroFácil en Render\nhttps://cobrofacil.onrender.com\n- Facturación, AFIP, Inventario"]
    end

    UI_Cliente --> ProxyAuth
    UI_Repartidor --> ProxyAuth
    UI_Chat --> ProxyDB
    ProxyAuth --> AuthEngine
    ProxyDB --> DBEngine
    AuthEngine --> Col_Clients
    AuthEngine --> Col_Drivers
    DBEngine --> Col_Orders
    CobroFacil <--> BackendAPI
```

---

## 🎯 2. Los 3 Pilares del Flujo de Trabajo

### Pilar A: Ecosistema Multitienda y Búsqueda Federada ("Buscar Coca")
- **Problema resuelto**: Anteriormente, la tienda solo mostraba el catálogo del local seleccionado (ej. carnicería).
- **Solución implementada**:
  - Al escribir un término de búsqueda (ej. `"coca"`, `"fernet"`, `"asado"`), el motor busca a lo largo de **todas** las empresas activas del ecosistema.
  - Cada tarjeta de producto (`TarjetaProducto.tsx`) muestra la **Empresa Proveedora** (ej. `🏪 Kiosco Al Toque - 24hs` o `🏪 Frigorífico Maciel`) y la **Distancia real** calculada (ej. `0.8 km`, `1.2 km`).
  - El modal de comercios (`ModalMercados.tsx`) clasifica por categorías (Carnicerías, Kioscos 24hs, Almacén) y filtra en tiempo real qué comercio tiene disponibilidad de los productos consultados.

### Pilar B: Telemetría y Seguimiento en Vivo del Repartidor
- **Fusión Sensorial**: Motor en segundo plano (`telemetryEngine.ts` y `useDriverGps.ts`) que combina:
  - **GPS de alta precisión** (latitud, longitud, altitud y cálculo de rumbo por azimut geodésico cuando la velocidad > 4 km/h).
  - **Magnetómetro / Brújula Digital** (`deviceorientationabsolute` o `webkitCompassHeading` con interpolación circular vectorial y filtro exponencial EMA cuando la velocidad ≤ 4 km/h o el repartidor está quieto).
- **Píldora de Pedido Activo en Curso (`DriverTopBar.tsx`)**:
  - Si el repartidor tiene un pedido asignado (`#RF-7420`), la barra superior muestra el estado con un punto verde pulsante en tiempo real: `[🚚 #RF-7420 · EN CURSO]`.
  - Al presionar esta píldora, la vista enfoca suavemente el mapa en el repartidor y el destino, abriendo el panel de navegación de la ruta.

### Pilar C: Comunicación Tripartita en Vivo (Campana de Notificaciones)
- **Componente**: `OrderChatSheet.tsx` acoplado al botón de la **Campana** en la barra superior.
- **Participantes**:
  1. **Repartidor**: Notifica demoras, salidas y llegada a puerta.
  2. **Cliente**: Aclara detalles de entrega (timbre, departamento, instrucciones de entrega sin contacto).
  3. **Empresa (CobroFácil)**: Avisa cuando el paquete está empacado, factura emitida o faltantes de stock.
- **Preparado para CobroFácil**: Expone endpoints de integración y webhook para que el backend de CobroFácil en Render (`https://cobrofacil.onrender.com`) pueda inyectar mensajes de sistema automáticos (ej. "Factura A #0001-00049281 generada", "Pedido embalado en mostrador").

---

## 🗺️ 3. Hoja de Ruta (Roadmap) - Hacia Dónde Vamos

### Fase 1: Consolidación Local y PWA 100% (Completada ✅)
- [x] Motor de telemetría y orientación con brújula física del móvil.
- [x] Service Worker, Web App Manifest y assets táctiles PWA.
- [x] Separación de tablas/colecciones entre Clientes y Repartidores con autenticación persistente.
- [x] Catálogo multi-empresa con búsqueda global cruzada y visualización de distancias.
- [x] Chat tripartito y píldora de pedido en curso en el mapa.

### Fase 2: Sincronización WebSockets / SSE en Vivo (Próximo Sprint 🚀)
- [ ] Implementar endpoint WebSocket bidireccional `/ws/orders/{order_id}` en FastAPI.
- [ ] Transmisión en tiempo real (cada 2 segundos) de la posición `(lat, lng, heading)` del repartidor hacia el visor del cliente.
- [ ] Notificaciones Push PWA (Web Push API) para avisos de entrega y mensajes nuevos de la campana.

### Fase 3: Integración Profunda con CobroFácil (Render)
- [ ] Webhook entrante desde `https://cobrofacil.onrender.com`:
  - `POST /api/webhooks/cobrofacil/order-ready` ➔ Dispara automáticamente la oferta de pedido a los repartidores cercanos.
  - Sincronización de stock en tiempo real: Si un comercio vende la última Coca-Cola en su caja registradora de CobroFácil, se oculta instantáneamente en la tienda web de RepartoFácil.

### Fase 4: Despacho Automatizado por Proximidad (Matching Inteligente)
- [ ] Algoritmo Voronoi / Haversine en backend para asignar pedidos al repartidor con menor tiempo estimado de llegada (ETA).
- [ ] Modo de navegación guiada paso a paso por voz en el PWA para el repartidor (MapLibre / OSRM routing).

---

## 🔒 4. Cuentas de Acceso de Prueba Rápidas

| Rol | Usuario / Email | Contraseña | Colección DB |
| :--- | :--- | :--- | :--- |
| **Repartidor** | `repartidor` / `repartidor@repartofacil.com` | `12345678` | `driverProfiles` |
| **Cliente** | `cliente` / `cliente@repartofacil.com` | `12345678` | `clients` |

Ambas cuentas están preconfiguradas en `backend/repartofacil.db` con persistencia en `localStorage` (`rf_token`, `rf_user_id`, `rf_driver_profile`, `rf_client_profile`).
