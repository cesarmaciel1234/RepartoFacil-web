# Componentes de Autenticación (`src/components/auth/`)

## 1. Qué hace
Formularios y modales de autenticación de usuario reutilizables en los flujos donde se solicita credenciales o registro rápido.

## 2. De dónde viene
- Llamados desde menús de navegación o botones de "Iniciar Sesión".

## 3. Archivos principales
- `LoginForm.tsx`: Formulario de login con validación de inputs y manejo de errores.
- `RegisterForm.tsx`: Formulario de registro de nuevos clientes.

## 4. Hacia dónde sale
- Hacia `/api/auth/login` y el gestor de sesiones de `src/lib/clientAuth.ts`.
