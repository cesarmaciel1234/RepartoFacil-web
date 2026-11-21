# Operación y protección de producción

Guía de referencia para cambiar, verificar y publicar Reparto Fácil sin
interrumpir los flujos existentes.

## 1. Servicios y datos

| Servicio | Función | Conexión relevante |
| --- | --- | --- |
| Render `repartofacil` | Aplicación Next.js y API propia de pedidos/chat | `DATABASE_URL` para `/api/orders`, `/api/chat` y custodio; `BACKEND_URL` para los proxies al backend |
| Render `repartofacil-backend` | API FastAPI para autenticación y otras rutas proxy | Configuración independiente; no hereda variables del servicio Next.js |
| Cobro Fácil CRM | Operación comercial y recepción de pedidos | Puede compartir la misma base PostgreSQL que la tienda |

Hay más de un manifiesto de Render (`render.yaml` y `backend/render.yaml`).
Antes de editar o volver a aplicar un Blueprint, verificar qué manifiesto está
asociado a cada servicio existente; no crear servicios duplicados ni renombrar
los servicios como parte de un cambio de tienda.

### PostgreSQL compartido

- La base puede ser una sola; las variables de entorno pertenecen a cada servicio.
- El servicio Next.js `repartofacil` necesita recibir `DATABASE_URL` para que
  `/api/orders` funcione.
- `sync: false` en `render.yaml` solo declara una variable administrada fuera del
  repositorio; no garantiza que el servicio ya tenga el valor configurado.
- Configurar la conexión existente en Render o mediante un Environment Group
  compartido. No crear otra base para resolver un error de configuración.
- No guardar credenciales en el código, documentación, logs, comandos versionados
  ni variables `NEXT_PUBLIC_*`.
- `src/lib/db.ts` debe seguir obteniendo la conexión desde el entorno. No añadir
  URLs de respaldo con credenciales dentro del código.

## 2. Contrato de creación de pedidos

Flujo esperado:

```text
Carrito -> ModalCheckout -> createOrder() -> POST /api/orders
         <- confirmación solo después de HTTP exitoso
```

Invariantes:

1. PostgreSQL es la persistencia central que consume la recepción de Cobro Fácil.
2. No mostrar un pedido como confirmado, vaciar el carrito ni dar por exitosa la
   compra si `POST /api/orders` falla.
3. El historial local y Firestore son complementarios; no reemplazan el
   registro central.
4. Mantener los filtros de aislamiento por cliente, empresa y repartidor en
   `src/app/api/orders/route.ts`.
5. Mantener los métodos de pago seleccionados (`cash`, `transfer`, `card`) desde
   checkout hasta la fila almacenada y la confirmación.
6. No cambiar estados, columnas o reglas de conflicto de pedidos sin comprobar
   compatibilidad con el CRM y la bandeja del repartidor.

## 3. Contrato de tienda y tarifa

- Mantener el acceso abierto al catálogo y al carrito; el login se solicita al
  pagar.
- El carrito se agrupa por `companyId`. Cada checkout y cada pedido incluyen
  únicamente los productos del comercio seleccionado; no mezclar tiendas en un
  mismo pedido.
- La dirección válida del perfil del cliente es la primera opción en checkout;
  la dirección seleccionada en la tienda se usa como respaldo.
- El selector de domicilio requiere GPS y limita el punto marcado a 1 km; este
  límite no se aplica al listado de comercios, que se ordena por cercanía.
- El envío gratuito usa el umbral configurado para el comercio y `$35.000` como
  valor predeterminado. `DrawerCarrito`, `ModalCheckout` y `createOrder` deben
  mostrar y guardar el mismo costo para el comercio seleccionado.
- El costo de envío no debe eliminar la ganancia calculada para el repartidor.
- El cálculo de distancia actual usa aproximaciones para algunas direcciones y
  una distancia predeterminada para el resto; no presentarlo como geocodificación
  GPS precisa.
- Mantener la moneda y el formato visible en `es-AR`.

## 4. Catálogo e inventario del TPV

- Los productos se leen de Cobro Fácil; no completar precios, stock o fotos con
  valores de ejemplo. El stock se conserva en la unidad y escala recibidas.
- Los registros de la sucursal MACIEL y de `empresa_2` (PRUEBA) se muestran en
  MACIEL por confirmación del comercio. Se mantienen como registros separados:
  no sumar stock ni fusionar productos solo porque compartan nombre.
- Un producto solo se puede comprar si tiene precio positivo y stock numérico
  suficiente para una unidad. Los faltantes se muestran como pendientes; la
  falta de foto no bloquea la compra.
- Los carritos guardados se conservan y se actualizan con el catálogo vigente
  cuando está disponible. Si falta precio o stock, o la cantidad supera el
  stock actual, se bloquea el pago hasta corregir el artículo; no se borra el
  carrito ni se usa su precio antiguo.
- Las fotos exactas se sirven desde `public/productos/`. Para importar imágenes
  nuevas, ejecutar `node scripts/import-product-images.mjs
  "<carpeta-png_productos>"`. El importador copia coincidencias exactas por
  nombre, prefiere el archivo base ante variantes y deja pendientes los faltantes
  o nombres ambiguos. El manifiesto de rutas se genera en
  `src/data/productImageManifest.json`.
- No se escriben inventario ni imágenes de vuelta a Cobro Fácil desde esta ruta.
  Los POST no configurados responden error, nunca una confirmación simulada.

## 5. Límites de módulos

- `TiendaPiramidal.tsx` compone pantallas y conecta callbacks; catálogo, pedidos
  y reglas reutilizables se mantienen en sus dominios.
- `tienda/catalogo/`: carga y deriva datos de comercios/productos.
- `tienda/motor/`: tipos, carrito, tarifas y persistencia de pedidos.
- `tienda/pedidos/`: sincronización e historial del comprador.
- `tienda/ui/`: componentes visuales; no mover allí la lógica de persistencia.
- `repartidor/motor/`: asignaciones, estado, GPS y cartera.
- `repartidor/ui/`: presentación y acciones del repartidor.

Antes de mover una pieza, comprobar sus importadores, eventos (`rf-orders-updated`
y `rf-wallet-updated`), persistencia local y rutas API. Leer el README del
dominio afectado y modificar el menor número de niveles posible.

## 6. Puerta de publicación

No considerar producción lista solo porque abre la página principal. Verificar
en este orden:

1. `npm run build` finaliza correctamente.
2. `https://repartofacil.onrender.com/api/version` muestra la versión/release
   esperada para el despliegue.
3. `GET /api/orders` responde HTTP 200 con JSON. Un HTTP 500 o el error de
   `DATABASE_URL` bloquea la publicación funcional.
4. La tienda carga catálogo, abre el carrito y mantiene igual el costo de envío
   entre carrito y checkout.
5. El login no produce errores de consola y devuelve al checkout sin perder el
   carrito.
6. Solo con API disponible y autorización explícita, crear un único pedido de
   prueba. Confirmar que aparece en Cobro Fácil con cliente, dirección, tarifa,
   método de pago e ítems correctos. No repetir el envío si el resultado HTTP es
   incierto.
7. Verificar el pedido en la bandeja de repartidor y su transición de estados
   sin aceptar ni entregar pedidos reales.

No enviar pedidos de prueba mientras la API devuelve 500. No borrar pedidos,
vaciar carritos preexistentes ni alterar datos del CRM durante una prueba.

## 7. Diagnóstico y recuperación

- `GET /api/orders` con `DATABASE_URL debe configurarse`: revisar la variable en
  el servicio **Next.js `repartofacil`**, no asumir que por existir en Cobro Fácil
  se propaga automáticamente.
- Si el CRM funciona pero la tienda no, comprobar las variables de ambos
  servicios antes de cambiar código o esquema.
- Si la home funciona y la API falla, es una falla parcial: no publicar como
  tienda operativa.
- Si el despliegue causa una regresión, usar el rollback del servicio de Render
  a la última versión conocida como funcional. No revertir ni modificar la base
  como primera medida.
- Registrar en el PR o commit qué flujo se verificó, versión desplegada y
  resultado de `/api/orders`; nunca incluir el valor de las variables.

## 8. Estado de referencia

En la comprobación más reciente, Render desplegó la versión `v5.9` después de
configurar `DATABASE_URL` en el servicio Next.js. `GET /api/orders` respondió
HTTP 200 con 18 pedidos existentes. Esto confirma la lectura de la base, pero
no sustituye la prueba de checkout ni la confirmación visual en Cobro Fácil.
Repetir la verificación después de cada cambio de configuración o despliegue.
