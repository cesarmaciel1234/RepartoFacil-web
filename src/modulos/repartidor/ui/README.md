# Subcarpeta: Interfaz de Usuario Repartidor

**Ubicación:** `src/modulos/repartidor/ui/`  
**Rol:** Componentes de interfaz móvil e interacción táctil del conductor/repartidor.

---

## 1. Qué hace
- Provee la barra superior con estado GPS, botón de retorno a la tienda y panel de perfil.
- Muestra el listado de pedidos disponibles para tomar con distancia en km, sucursal, cortes y botón verde "Aceptar Pedido".
- Ofrece la vista de ruta activa ("Mi Ruta") con llamada directa al cliente, enlace a Google Maps / GPS y confirmación de entrega.
- Proporciona el diálogo de autenticación rápida (`ModalDriverAuth`) que solo se invoca cuando el conductor decide aceptar un pedido.
- Ofrece el asistente conversacional `DriverCopilotSheet` ("Copo") para optimización de recorrido y ayuda en calle.

---

## 2. Funciones y Componentes Principales
- `DriverTopBar`: Barra superior con indicador de satélite GPS, switch de regreso a tienda y botón de perfil/cierre de sesión.
- `TabPedidosDisponibles`: Listado de pedidos en espera con detalles de la orden y botón de aceptación.
- `TabMiRuta`: Tarjetas de pedidos en reparto activo con acciones de navegación GPS y completado.
- `ModalDriverAuth`: Diálogo de registro ágil que se levanta bajo demanda al presionar "Aceptar Pedido".
- `DriverCopilotSheet`: Sheet lateral interactivo con sugerencias inteligentes para el conductor.

---

## 3. Cómo funciona (Flujo interno)
1. El repartidor visualiza el mapa interactivo y el panel deslizable con las pestañas "Disponibles", "Mi Ruta" y "Alertas".
2. En `TabPedidosDisponibles`, examina las órdenes y pulsa "Aceptar Pedido".
3. Si el usuario no tiene perfil cargado en `localStorage`, se despliega `ModalDriverAuth`.
4. Al ingresar su nombre y vehículo, `ModalDriverAuth` emite `onSuccess(driverId)`, registrando la orden y pasándola a `TabMiRuta`.
5. Durante el viaje, el repartidor puede abrir `TabMiRuta` para ver la dirección, llamar al comprador o abrir la navegación externa con un toque.

---

## 4. De dónde viene y A dónde va (Conexiones)
- **Viene de:** `RepartidorPiramidal.tsx` (coordinador general de la rama).
- **Va a:** El motor del repartidor (`useDriverOrders`, `useDriverGps`, `driverService`).

---

## 5. Qué NO romper (Invariantes Sagrados)
- **Modo libre inicial:** El repartidor no debe toparse con un formulario de login obligatorio para ver los pedidos ni para usar el mapa.
- **Botón "Aceptar Pedido":** Debe permanecer siempre accesible y responder con el modal si el usuario es anónimo.
- **Acceso rápido a llamadas y GPS:** Los enlaces `tel:` y `google.com/maps` deben funcionar nativamente en cualquier teléfono.
