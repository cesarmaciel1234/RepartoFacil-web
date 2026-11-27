# Página de Perfil de Usuario (`src/app/profile/`)

## 1. Qué hace
Página dedicada para la visualización y edición de los datos de contacto del cliente (nombre, teléfono, dirección guardada y preferencias).

## 2. De dónde viene
- Navegación desde la barra inferior de la tienda o acceso directo `/profile`.

## 3. Archivos y Vistas
- `page.tsx`: Envuelve el componente `<PerfilCliente />` dentro del layout general.

## 4. Hacia dónde sale
- Hacia `src/modulos/tienda/pantallas/PerfilCliente.tsx` y persistencia en `localStorage` / backend.
