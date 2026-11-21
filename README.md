
# # ruta-optima-idx

Este es un proyecto de gestión de logística optimizado con IA (Genkit) y Firebase.

## Configuración de Git y Subida al Repositorio

Para subir este proyecto a tu repositorio de GitHub, ejecuta los siguientes comandos en tu terminal:

1. **Configura tu identidad:**
   ```bash
   git config --global user.email "tu-email@ejemplo.com"
   git config --global user.name "Tu Nombre"
   ```

2. **Inicializa y vincula el repositorio:**
   ```bash
   git init
   git remote remove origin 2>/dev/null
   git remote add origin https://github.com/cesarmaciel1234/ruta-optima-idx.git
   ```

3. **Primer Commit y Push:**
   ```bash
   git add .
   git commit -m "🚀 Initial Commit: RutaRápida Pro"
   git branch -M RUTA-OPTIMA
   git push -u origin RUTA-OPTIMA
   ```

## Características Principales

- **Rastreo GPS en tiempo real** de la flota de conductores.
- **Optimización de Rutas con IA** mediante Google Genkit.
- **Copiloto IA (Copo)** para asistencia interactiva del conductor.
- **Comunidad Live** con sistema de "bumping" para incidencias críticas.
- **Interfaz Pro** enfocada exclusivamente en la experiencia del repartidor.

## Despliegue en Render

1. **Conecta el repositorio a Render:**
   - Ve a [render.com](https://render.com)
   - Crea una cuenta e inicia sesión con GitHub
   - Haz clic en "New +" y selecciona "Web Service"
   - Conecta el repositorio `cesarmaciel1234/RepartoFacil-web`

2. **Configura el servicio:**
   - Name: `repartofacil-web` (o el nombre que prefieras)
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Variables de entorno:**
   Agrega las siguientes variables de entorno en Render (sección Environment):
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Tu API key de Firebase
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Tu dominio de Firebase
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Tu ID de proyecto Firebase
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Tu bucket de storage
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Tu sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID`: Tu app ID de Firebase
   - `DATABASE_URL`: URL de conexión PostgreSQL (cargarla como variable secreta, no en el código)
   - `GOOGLE_GENAI_API_KEY`: Tu API key de Google GenAI

4. **Plan:**
   - Puedes usar el plan gratuito para desarrollo

5. **Despliega:**
   - Haz clic en "Create Web Service"
   - Render detectará automáticamente el archivo `render.yaml` y usará esa configuración

**Nota:** El archivo `render.yaml` ya está configurado en el repositorio. Solo necesitas agregar las variables de entorno en el panel de Render.
