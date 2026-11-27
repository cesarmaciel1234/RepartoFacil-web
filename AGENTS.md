# Leyes del Proyecto Reparto Fácil Web

> **OBLIGATORIO PARA TODO AGENTE / CHAT / DESARROLLADOR:**
> Estas reglas son permanentes y de cumplimiento automático en cada tarea. Antes de escribir o modificar código en este proyecto, respetar rigurosamente las 4 reglas de arquitectura y las leyes de dominio.

---

## 🏛️ REGLAS PERMANENTES DE ARQUITECTURA

### 1. Regla de Separación "Cerebro vs. Cara" (Backend / Lógica vs. Frontend / UI)
- **Separación Estricta:** Mantener estrictamente separado el **Cerebro** (lógica de negocio, reglas de checkout, cálculo de envíos, llamadas API, queries SQL y servicios) de la **Cara** (pantallas, JSX, CSS/Tailwind y componentes visuales).
- **En Backend, API y Servicios (`backend/`, `src/app/api/`, `src/lib/`):**
  - Prohibido mezclar HTML o estilos dentro de la lógica de negocio.
  - Los endpoints y servicios deben devolver siempre **datos puros** (modelos Pydantic, diccionarios o JSON).
- **En Frontend y Componentes (`src/components/`, `src/modulos/`):**
  - Separar la lógica y llamadas a la API (`core/`, `motor/`, o hooks en `src/hooks/`) de la vista que dibuja botones y tarjetas (`ui/` o `componentes/`).
  - Prohibido meter lógica pesada de validación o negocio adentro de los manejadores de eventos (`onClick`, `onSubmit`). Delegar a servicios o hooks dedicados.

### 2. Regla de Árbol Modular y Límite de Líneas
- **Límite de Archivos Nuevos:** Ningún archivo nuevo debe superar **~300-400 líneas**. Si un componente o módulo crece más allá de este límite, dividirlo en submódulos especializados.
- **Desguace Progresivo de Archivos Grandes Existentes:**
  - Archivos extensos no deben seguir acumulando responsabilidades.
  - Cada vez que se modifique una funcionalidad sobre un archivo existente grande, **extraer la parte tocada a su propia subcarpeta** separando su lógica (`motor/`, `hooks/` o `service/`) y su vista (`ui/` o `components/`).
  - Mantener total compatibilidad con las interfaces públicas y contratos existentes sin romper nada del flujo de compra o navegación.

### 3. Regla de Documentación Viva por Carpeta (`README.md` o `INDICE.md` corto)
- **En la Raíz del Proyecto:** Mantener siempre actualizado el plano general (`INDICE.md` o `README.md`) explicando *"de dónde viene cada flujo, qué hace el sistema y hacia dónde va"*.
- **En cada Carpeta y Subcarpeta (nueva o modificada):** Crear o actualizar un archivo `.md` breve (**máximo 30-40 líneas**) explicando:
  1. **Qué hace** esa carpeta.
  2. **De dónde viene** su entrada (triggers, llamadas de página, hooks o eventos).
  3. **Qué archivos contiene** y la función de cada uno.
  4. **Hacia dónde sale** (hacia qué API, componente visual o base de datos).

### 4. Regla de Ahorro de Contexto
- **Lectura Jerárquica Previa:** Antes de leer o volcar archivos largos de código al contexto, el agente debe leer obligatoriamente:
  1. El plano general de la raíz (`INDICE.md` o `README.md`).
  2. El `.md` breve (`INDICE.md` o `README.md`) de la carpeta o subcarpeta correspondiente a modificar.
- Solo tras comprender el mapa de flujos e invariantes se inspeccionan los componentes o funciones específicas a intervenir.

---

## ⚖️ LEYES SAGRADAS DE DOMINIO E INTEGRACIÓN

### 1. Relación con Cobro Fácil y Backend Centralizado
- `Reparto Fácil Web` se integra con el backend unificado de `Cobro Fácil` (`https://cobrofacil.onrender.com`).
- Ambas aplicaciones comparten la misma base de datos PostgreSQL en el esquema `public`.
- El secreto de conexión `DATABASE_URL` reside en Render y no debe exponerse nunca con prefijo `NEXT_PUBLIC_` ni en repositorios.

### 2. Flujo de Compra e Invariantes del Carrito
- **Exploración sin bloqueo:** Se puede explorar el catálogo y armar el carrito sin iniciar sesión previa; el acceso/registro se solicita exclusivamente al momento de abonar en el checkout.
- **Persistencia en fallo:** La confirmación del checkout depende de una respuesta exitosa de `POST /api/orders`. Si el servidor falla, el carrito debe conservarse intacto (nunca vaciarlo ante un error 500/timeout).
- **Tarifa consistente:** El carrito y el checkout deben mostrar la misma tarifa de envío para la misma dirección y modalidad seleccionada.
- **Aislamiento Multi-Tenant:** Los pedidos conservan el estricto aislamiento por cliente y comercio (`empresa_id`).

### 3. Calidad y Validación
- Toda modificación debe validar tipos ejecutando `npm run typecheck` y las suites de pruebas en `tests/`.
