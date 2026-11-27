# Módulo: Repartidor (`src/modulos/repartidor`)

## 1. Qué hace
Interfaz operativa y móvil para repartidores: mapa Leaflet interactivo, radar de pedidos, gestión de rutas, telemetría y cartera virtual de cobranzas.

## 2. De dónde viene
- Montado por `src/app/page.tsx` a través de `<RepartidorPiramidal />`.

## 3. Archivos y subcarpetas principales
- `RepartidorPiramidal.tsx`: Orquestador de repartidor. Valida sesión activa; si no existe o expira, retorna inmediatamente a Tienda sin abrir modales automáticamente.
- `motor/`: Lógica de órdenes, persistencia (`driverService.ts`), sincronización (`driverPendingActions.ts`), telemetría y cartera.
- `ui/`: Barra superior, hojas táctiles (`TabMiRuta`, `TabPedidosDisponibles`), copilot y modales.

## 4. Hacia dónde sale
- Hacia PostgreSQL 16 en el VPS (`public.repartofacil_pedidos`), Firebase Firestore, y retorno a Tienda (`onSwitchToStore`).
