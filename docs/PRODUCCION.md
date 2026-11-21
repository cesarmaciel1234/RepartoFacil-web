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
3. El historial local es complementario; no reemplaza el registro central.
4. Mantener los filtros de aislamiento por cliente, empresa y repartidor en
   `src/app/api/orders/route.ts`.
5. Conservar el método de pago elegido (`cash`, `transfer`, `card`) y distinguirlo
   del origen de la venta y de la confirmación efectiva del cobro.
6. No cambiar estados, columnas o reglas de conflicto de pedidos sin comprobar
   compatibilidad con el CRM y la bandeja del repartidor.

Las acciones de repartidor sin conexión quedan pendientes en el almacenamiento
del dispositivo y se reintentan al reconectar mientras la aplicación esté
abierta y el mismo repartidor tenga sesión iniciada. No se asigna ni acredita
una acción hasta que el servidor la confirme. El protocolo nuevo protege la
asignación simultánea entre clientes actualizados. El navegador
debe admitir Web Locks; si no lo admite, se muestra un error de sincronización.
La cartera permanece local al dispositivo y no sustituye una liquidación central.

La API de pedidos y chat exige una cuenta registrada y verifica su token contra
`BACKEND_URL/api/auth/me`. El servidor determina el comprador o repartidor a partir
de esa sesión. Las cuentas anónimas no pueden operar pedidos; el registro de
repartidores sigue siendo libre. El catálogo permanece público. La API antigua
`/api/db/orders` ya no accede a los pedidos de PostgreSQL.
El inicio de sesión permite cinco intentos por cuenta en quince minutos; a partir
del sexto devuelve HTTP 429. El contador reside en la base del backend y requiere
la tabla `login_throttles`, creada al iniciar el servicio. Una instalación con
varias instancias debe compartir la misma base persistente.
En el backend, las colecciones heredadas de pedidos y alertas quedan
deshabilitadas; los documentos privados de clientes, repartidores y usuarios
requieren una cuenta registrada y solo se entregan a su titular. Las pantallas
antiguas que dependían de esas colecciones deben migrarse.

Esta versión no acepta clientes antiguos sin token, incluso si se configura
`RF_DRIVER_ACTIONS_LEGACY_COMPAT`. Antes de desplegarla hay que actualizar las
instalaciones y planificar el reinicio de sesión. El backend de autenticación
debe estar disponible y persistir las cuentas: su configuración actual con
SQLite efímero puede perderlas al reiniciar. No considerar completo el blindaje
sin revisar las demás rutas heredadas del backend y resolver la reserva de stock.
Los pedidos antiguos creados con identidades invitadas no pueden
asociarse automáticamente de forma segura a una cuenta.

El proxy de autenticación espera hasta 60 segundos para permitir el arranque en
frío del backend; no reintenta registros automáticamente. Esto no evita la pérdida
de cuentas en SQLite efímero. En el perfil del comprador y el menú del repartidor,
la versión instalada se compara con `/api/version`; si la consulta falla se
indica que no pudo comprobarse. Actualizar `src/lib/appVersion.ts` y el identificador
`RELEASE` del service worker en cada publicación de código cliente.

Al recibir un pedido, el servidor consulta el catálogo de PostgreSQL y verifica
comercio, artículos, cantidades, precios y tarifa antes de guardarlo. Si cambió
el importe o falta el catálogo, rechaza la compra sin confirmarla. El stock
refleja la última instantánea del TPV: esta verificación no reserva ni descuenta
inventario, por lo que ventas simultáneas pueden agotarlo antes de preparar el
pedido. La tarifa y la ganancia se recalculan en servidor.

### Cambios acordados de pedidos

El lápiz para proponer cambios todavía no está implementado. En el código local
de Cobro Fácil, la aceptación parcial puede procesar solo algunos artículos sin
actualizar los artículos ni el total del pedido; no usarla como sustituto de
la confirmación del comprador. Además, las rutas de Reparto Fácil del CRM están
excluidas de los controles generales de sesión y rol. Antes de habilitar edición
se deben proteger y aislar esas operaciones por comercio.

El flujo previsto es: propuesta del comercio con artículos y total validados;
confirmación o rechazo explícito del comprador; y, solo después de confirmar,
aceptación del comercio. Un rechazo conserva el pedido original y permite otra
propuesta. La confirmación bloquea nuevas ediciones; las transiciones deben ser
atómicas y evitar que una propuesta pendiente genere ticket o descuente stock.
Probar ambos sistemas con datos aislados antes de publicar.

### Ventas Web, cobros y cartera

En Cobro Fácil, `Web` identifica las ventas originadas en la tienda para
separarlas de las demás ventas del TPV. No significa por sí solo que el pedido
esté pagado ni indica si el cliente eligió efectivo, transferencia o tarjeta.
Por ahora se mantiene esa clasificación; no cambiar el reporte del TPV sin
acordar la integración con Cobro Fácil.

En una prueba real controlada, la tienda envió efectivo y, al aceptar el pedido,
Cobro Fácil lo guardó como `Web`. El repartidor vio «Pagado Online» y la entrega
registró efectivo cobrado igual a cero, aunque no hubo pago real. Esta prueba
demuestra un riesgo de interpretación y liquidación, no un cobro confirmado.
La cartera mostrada en la prueba es local al dispositivo, no dinero transferido.
Hasta resolverlo, verificar el cobro y la liquidación con el comercio; no usar
la categoría `Web` como comprobante.

Mejora pendiente: conservar por separado el origen (`Web`), el medio elegido y
el estado de cobro confirmado. Diseñar y coordinar con Cobro Fácil categorías
como Web efectivo y Web tarjeta, sin mezclar ventas ni inferir pagos. Actualizar
checkout, recepción, bandeja, entrega, cartera y reportes juntos, con pruebas
para efectivo, transferencia, tarjeta, pago pendiente y pago confirmado.

La auditoría automática de Custodio y la liberación al desconectarse están
pausadas por defecto (`RF_CUSTODIO_AUTOMATIC_ENABLED` distinto de `1`). No se
generan advertencias ni vencimientos automáticos durante la pausa; la liberación
manual del comprador sigue disponible. Antes de reactivarla, corregir y probar
las carreras y la gestión de sesiones inactivas, y revisar las advertencias
antiguas para evitar liberaciones inmediatas.

La nueva auditoría advierte en el chat tras 10 minutos sin ping y solo libera
tras 30 minutos sin ping y 20 minutos desde el aviso. Una desconexión explícita
inicia el plazo, no libera inmediatamente. Los pedidos en estados `picked up`
o `in transit` no se liberan automáticamente. Solo se consideran pedidos con
un ping registrado; las advertencias del mecanismo anterior no habilitan una
liberación. Actualización y mensaje de chat se guardan en una misma consulta.
El proceso depende de consultas a la API, no de un trabajador permanente: los
avisos y liberaciones pueden llegar tarde si nadie consulta. Además, el ping
depende de la pantalla del repartidor, que el navegador puede suspender; no
demuestra por sí solo que el repartidor abandonó el pedido. La aplicación no
registra explícitamente el retiro físico en todas las rutas. Mantener la pausa
hasta resolver estas limitaciones y revisar las advertencias antes de activarla.

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
3. `GET /api/orders` con un token válido responde HTTP 200 con JSON y sin token
   responde HTTP 401. Un HTTP 500 o el error de `DATABASE_URL` bloquea la
   publicación funcional.
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

## Mejoras pendientes antes de operar a mayor escala

- **Cuentas y sesiones:** migrar la autenticación del backend a almacenamiento
  persistente y respaldado, coordinar la migración de cuentas existentes y
  configurar una clave JWT estable. En la configuración actual SQLite puede
  perder cuentas al reiniciar; una clave generada al arrancar también puede
  invalidar sesiones. No asumir que la base de pedidos persiste la autenticación.
  Revisar recuperación de cuenta, verificación de identidad y aprobación de
  repartidores; actualmente el registro de repartidores es libre.
- **Disponibilidad:** el plan gratuito puede suspender el backend y demorar su
  arranque. El proxy de autenticación y la verificación de sesión esperan hasta
  10 segundos; evaluar una solución que contemple arranques lentos sin presentar
  como exitosa una operación no confirmada.
- **Pagos y cartera:** separar origen, medio y confirmación de cobro; reemplazar
  el saldo solo local por una liquidación persistente, verificable e idempotente.
- **Inventario:** reservar o descontar stock de forma atómica en coordinación
  con el TPV y manejar productos agotados antes de confirmar la compra.
- **Custodio:** incorporar un trabajador y presencia confiables, confirmar
  explícitamente el retiro físico y resolver alertas antiguas antes de activar la
  liberación automática. Mantener la pausa hasta validar estos requisitos.
- **Modo sin conexión:** el catálogo guardado es informativo; la compra exige
  validación actual. Las acciones de reparto pendientes se sincronizan con la
  aplicación abierta y la misma sesión, sin acreditar hasta recibir confirmación.
  Los navegadores pueden suspender tareas en segundo plano.
- **Pruebas integrales:** comprobar con datos ficticios autorizados compra,
  recepción, embalado, asignación, mensajes, entrega y cartera; verificar tanto
  el resultado en Cobro Fácil como los efectos reales de stock y cobro.

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

La lectura histórica de pedidos en Render confirmó la conexión con PostgreSQL,
pero no sustituye la prueba autenticada de checkout ni la confirmación visual
en Cobro Fácil. Repetir la verificación después de cada despliegue.
