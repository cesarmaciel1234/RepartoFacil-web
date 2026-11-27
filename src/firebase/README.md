# Integración con Firebase / Firestore (`src/firebase/`)

## 1. Qué hace
Configura la conexión opcional a Firebase para sincronización de telemetría en tiempo real y mensajería instantánea.

## 2. De dónde viene
- Invocado por los servicios de mensajería y seguimiento de choferes.

## 3. Archivos principales
- `config.ts`: Inicialización de la app Firebase con credenciales de entorno.
- `firestore/`: Helpers de suscripción a colecciones y listeners en vivo.

## 4. Hacia dónde sale
- Hacia Firebase Cloud Firestore y eventos de socket.
