# Primitivas de UI (`src/components/ui/`)

## 1. Qué hace
Conjunto de componentes atómicos de diseño y accesibilidad construidos sobre Radix UI y Tailwind CSS siguiendo el patrón Shadcn UI.

## 2. De dónde viene
- Importados por cualquier vista o componente del proyecto que requiera botones, diálogos, cajones, tooltips o alertas.

## 3. Archivos principales
- `button.tsx`: Botón con variantes primarias, secundarias, destructive y tamaños.
- `dialog.tsx`: Modales emergentes accesibles con backdrop.
- `drawer.tsx` & `sheet.tsx`: Paneles deslizantes laterales o inferiores para carritos y chats.
- `toast.tsx` & `toaster.tsx`: Notificaciones flotantes temporales.
- `input.tsx`, `badge.tsx`, `card.tsx`: Elementos de formulario y presentación.

## 4. Hacia dónde sale
- Hacia la pantalla del usuario (interfaz visual táctil y accesible).
