# Hooks de UI Compartidos (`src/hooks/`)

## 1. Qué hace
Contiene custom hooks de React para lógica de interfaz reutilizable como notificaciones, detección de dispositivos móviles y temporizadores.

## 2. De dónde viene
- Invocados por componentes visuales en `src/components/` y `src/modulos/`.

## 3. Archivos principales
- `use-toast.ts`: Maneja la cola de notificaciones tipo toast, su visibilidad y descarte automático.
- `use-mobile.tsx`: Hook reactivo que detecta el ancho de pantalla para adaptar la UI entre móvil y escritorio.

## 4. Hacia dónde sale
- Hacia el estado local de los componentes React visuales.
