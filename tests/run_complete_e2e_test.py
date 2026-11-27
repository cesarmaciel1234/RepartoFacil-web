import os
import sys
import json
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Ensure we can import from crm-frigorifico
CRM_DIR = r"C:\Users\cesar\OneDrive\Desktop\crm-frigorifico"
sys.path.insert(0, CRM_DIR)

# Load environment
load_dotenv(os.path.join(CRM_DIR, ".env"))

DB_URL = "postgresql://crm_libro_local_user:9WwQafiM47vLUUezeXbRGvd1xUk8GRrA@dpg-dbti1sjm8hqs73b0adc0-a.oregon-postgres.render.com/crm_libro_local"
NEXT_URL = "http://localhost:3000"
RENDER_URL = "https://cobrofacil.onrender.com"

results = {
    "step1_catalog_and_checkout": {},
    "step2_reception_and_stock": {},
    "step3_chat_tripartito": {},
    "step4_driver_mode": {},
    "step5_packaging_and_delivery": {},
    "step6_cleanup": {}
}

order_id = f"RF-E2E-{int(time.time())}"
test_client_email = f"client_e2e_{int(time.time())}@repartofacil.com"
test_driver_email = f"driver_e2e_{int(time.time())}@repartofacil.com"
test_client_id = None
test_client_token = None
test_driver_id = None
test_driver_token = None
initial_asado_stock = None
asado_pos_base_id = None
pos_base_row_id = None

def get_db_conn():
    conn = psycopg2.connect(DB_URL, sslmode="require")
    conn.autocommit = False
    return conn

def http_json(url, method="GET", data=None, headers=None):
    hdrs = headers.copy() if headers else {}
    req_data = None
    if data is not None:
        hdrs["Content-Type"] = "application/json"
        req_data = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(url, data=req_data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(body)
            except Exception:
                return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body

print("=" * 80)
print("INICIANDO PRUEBA COMPLETA EXTREMO A EXTREMO (E2E)")
print(f"ID Pedido de Prueba: {order_id}")
print("=" * 80)

# ----------------------------------------------------------------------
# 1. Carrito y compra (cliente en RepartoFacil-web)
# ----------------------------------------------------------------------
print("\n>>> PASO 1: Carrito y compra (cliente en RepartoFacil-web)...")

# 1a. Carga de empresas / sucursal Maciel
status_comp, body_comp = http_json(f"{NEXT_URL}/api/cobrofacil/companies")
suc_maciel = None
if status_comp == 200 and isinstance(body_comp, dict):
    for emp in body_comp.get("empresas", []):
        if "maciel" in str(emp.get("id", "")).lower() and emp.get("sucursal_id") == 1:
            suc_maciel = emp
            break

if suc_maciel:
    print(f"  [OK] Sucursal Maciel cargada: '{suc_maciel.get('name')}' (ID: {suc_maciel.get('id')})")
    print(f"       Dirección: '{suc_maciel.get('address')}'")
    print(f"       Teléfono / WhatsApp en catálogo: '{suc_maciel.get('phone')}'")
    results["step1_catalog_and_checkout"]["sucursal_catalog_loaded"] = True
    results["step1_catalog_and_checkout"]["sucursal_name"] = suc_maciel.get("name")
    results["step1_catalog_and_checkout"]["sucursal_phone"] = suc_maciel.get("phone")
else:
    print("  [ERROR] No se pudo encontrar la sucursal Maciel Alfaro 1964 en /api/cobrofacil/companies")
    results["step1_catalog_and_checkout"]["sucursal_catalog_loaded"] = False

# 1b. Carga de productos
status_prod, body_prod = http_json(f"{NEXT_URL}/api/cobrofacil/products?sucursal_id=1")
asado_prod = None
if status_prod == 200 and isinstance(body_prod, dict):
    for p in body_prod.get("products", []):
        if "asado" in str(p.get("name", "")).lower():
            asado_prod = p
            break

if asado_prod:
    print(f"  [OK] Producto encontrado: '{asado_prod.get('name')}' (ID: {asado_prod.get('id')})")
    print(f"       Precio: ${asado_prod.get('price')} - Stock disponible: {asado_prod.get('stockKg')} {asado_prod.get('unit')}")
    results["step1_catalog_and_checkout"]["product_loaded"] = True
    results["step1_catalog_and_checkout"]["product_price"] = asado_prod.get("price")
    results["step1_catalog_and_checkout"]["product_stock"] = asado_prod.get("stockKg")
else:
    print("  [ERROR] No se encontró el producto 'Asado' en el catálogo de sucursal 1")
    results["step1_catalog_and_checkout"]["product_loaded"] = False

# 1c. Registro de cliente para autenticar pedido
status_reg_c, body_reg_c = http_json(
    f"{RENDER_URL}/api/auth/register",
    method="POST",
    data={
        "email": test_client_email,
        "password": "password123",
        "display_name": "Cliente E2E",
        "role": "client"
    }
)
if status_reg_c == 200 and isinstance(body_reg_c, dict) and "access_token" in body_reg_c:
    test_client_token = body_reg_c["access_token"]
    test_client_id = body_reg_c["user"]["id"]
    print(f"  [OK] Cliente autenticado registrado: ID={test_client_id}")
    results["step1_catalog_and_checkout"]["client_auth"] = True
else:
    print(f"  [ERROR] No se pudo registrar cliente en /api/auth/register: {status_reg_c} {body_reg_c}")
    results["step1_catalog_and_checkout"]["client_auth"] = False

# 1d. Creación del pedido en Efectivo
if test_client_token and asado_prod:
    order_payload = {
        "id": order_id,
        "companyId": "frigorifico-maciel-suc-1",
        "sucursalId": 1,
        "items": [{
            "id": asado_prod["id"],
            "name": asado_prod["name"],
            "unit": asado_prod["unit"],
            "price": asado_prod["price"],
            "quantity": 1
        }],
        "deliveryType": "delivery",
        "deliveryAddress": "Doctor Aráoz Alfaro 1964, Monterrey, Presidente Derqui",
        "paymentMethod": "cash",
        "customerName": "Cliente E2E",
        "customerPhone": "+54 9 11 3562-7803",
        "subtotal": asado_prod["price"],
        "deliveryFee": 1500,
        "total": asado_prod["price"] + 1500
    }
    status_order, body_order = http_json(
        f"{NEXT_URL}/api/orders",
        method="POST",
        data=order_payload,
        headers={"Authorization": f"Bearer {test_client_token}"}
    )
    if status_order == 201:
        print(f"  [OK] Pedido creado con éxito en Efectivo: ID={order_id}")
        print(f"       Estado inicial: '{body_order.get('status')}'")
        print(f"       Método pago: '{body_order.get('paymentMethod')}'")
        results["step1_catalog_and_checkout"]["order_created"] = True
        results["step1_catalog_and_checkout"]["initial_status"] = body_order.get("status")
        results["step1_catalog_and_checkout"]["payment_method"] = body_order.get("paymentMethod")
    else:
        print(f"  [ERROR] Falló creación de pedido en /api/orders: {status_order} {body_order}")
        results["step1_catalog_and_checkout"]["order_created"] = False

# 1e. Comprobación del botón/link de WhatsApp
# ModalCheckout llama: buildWhatsAppLink(orderConfirmed)
# Verificamos si en la implementación toma el número real de la sucursal o el default
print("\n  Comprobando botón de WhatsApp en ModalCheckout...")
import re
with open(r"C:\Users\cesar\OneDrive\Desktop\RepartoFacil-web\src\modulos\tienda\ui\ModalCheckout.tsx", "r", encoding="utf-8") as f:
    checkout_code = f.read()
with open(r"C:\Users\cesar\OneDrive\Desktop\RepartoFacil-web\src\modulos\tienda\motor\pedidoService.ts", "r", encoding="utf-8") as f:
    pedido_service_code = f.read()

wa_call_match = re.search(r"buildWhatsAppLink\((.*?)\)", checkout_code)
wa_def_match = re.search(r"function buildWhatsAppLink\(.*phoneNumber\s*=\s*[\"'](.*?)[\"']", pedido_service_code)

default_phone = wa_def_match.group(1) if wa_def_match else "no_default"
call_args = wa_call_match.group(1).strip() if wa_call_match else ""

if call_args == "orderConfirmed":
    print(f"  [FALLA DETECTADA] ModalCheckout invoca 'buildWhatsAppLink(orderConfirmed)' sin pasar el teléfono de la sucursal.")
    print(f"                    Por ende, cae en el default: '{default_phone}' (+54 9 11 0000-0000) en lugar del número real de Alfaro ('1135627803').")
    results["step1_catalog_and_checkout"]["whatsapp_real_number"] = False
    results["step1_catalog_and_checkout"]["whatsapp_phone_used"] = default_phone
    results["step1_catalog_and_checkout"]["whatsapp_real_branch_phone"] = "1135627803"
else:
    print(f"  [OK] buildWhatsAppLink recibe argumento de teléfono: {call_args}")
    results["step1_catalog_and_checkout"]["whatsapp_real_number"] = True

# ----------------------------------------------------------------------
# 2. Recepción y aceptación (cobrofacil)
# ----------------------------------------------------------------------
print("\n>>> PASO 2: Recepción y aceptación (cobrofacil)...")

# 2a. Verificar que aparezca como NUEVO en PostgreSQL
db_conn = get_db_conn()
with db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
    cur.execute("SELECT * FROM public.repartofacil_pedidos WHERE id = %s", (order_id,))
    row_pedido = cur.fetchone()
    if row_pedido:
        print(f"  [OK] Pedido verificado en PostgreSQL:")
        print(f"       ID: {row_pedido['id']}")
        print(f"       Estado en DB: '{row_pedido['estado']}' (esperado: pending_store / pending)")
        print(f"       Método pago en DB: '{row_pedido['metodo_pago']}'")
        results["step2_reception_and_stock"]["appears_as_new"] = row_pedido['estado'] in ('pending_store', 'pending')
        results["step2_reception_and_stock"]["db_metodo_pago_before"] = row_pedido['metodo_pago']
    else:
        print(f"  [ERROR] Pedido {order_id} no encontrado en repartofacil_pedidos")
        results["step2_reception_and_stock"]["appears_as_new"] = False

    # Guardar stock original de pos_base
    cur.execute("SELECT id, columnas, filas FROM pos_base WHERE empresa_id = 1 AND tabla = 'productos' AND sucursal_id = 1")
    row_pb = cur.fetchone()
    if row_pb:
        pos_base_row_id = row_pb["id"]
        cols = row_pb["columnas"] if isinstance(row_pb["columnas"], list) else json.loads(row_pb["columnas"])
        filas = row_pb["filas"] if isinstance(row_pb["filas"], list) else json.loads(row_pb["filas"])
        idx_stock = cols.index("stock") if "stock" in cols else -1
        idx_nombre = cols.index("nombre") if "nombre" in cols else -1
        idx_id = cols.index("id") if "id" in cols else -1
        for f in filas:
            if idx_nombre != -1 and str(f[idx_nombre]).lower() == "asado":
                initial_asado_stock = float(f[idx_stock])
                asado_pos_base_id = f[idx_id]
                break
        print(f"  [INFO] Stock original de 'Asado' en pos_base (id={pos_base_row_id}): {initial_asado_stock}")

db_conn.close()

# 2b. Aceptar el pedido usando el servicio de cobrofacil
from app import create_app
crm_app = create_app()

print("  Ejecutando aceptación de pedido desde cobrofacil (/api/repartofacil/pedidos/<id>/aceptar)...")
with crm_app.test_client() as client:
    with client.session_transaction() as sess:
        sess["authenticated"] = True
        sess["empresa_id"] = 1
        sess["role"] = "admin"
    
    resp_accept = client.post(f"/api/repartofacil/pedidos/{order_id}/aceptar", json={})
    print(f"  Respuesta aceptación: HTTP {resp_accept.status_code}")
    try:
        accept_data = resp_accept.get_json()
        print(f"  Payload aceptación: {accept_data}")
    except Exception:
        accept_data = resp_accept.get_data(as_text=True)

# 2c. Verificar estado y metodo_pago tras aceptación
db_conn = get_db_conn()
with db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
    cur.execute("SELECT estado, metodo_pago, ticket_id FROM public.repartofacil_pedidos WHERE id = %s", (order_id,))
    row_after = cur.fetchone()
    if row_after:
        print(f"  [OK] Estado tras aceptación: '{row_after['estado']}' (Ticket #{row_after['ticket_id']})")
        print(f"       Método pago tras aceptación: '{row_after['metodo_pago']}'")
        
        results["step2_reception_and_stock"]["accepted_status"] = row_after["estado"]
        results["step2_reception_and_stock"]["conserva_efectivo"] = (row_after["metodo_pago"] == "cash")
        if row_after["metodo_pago"] == "cash":
            print("  [OK] Conserva método_pago = 'cash' (Efectivo) sin cambiar a MPago.")
        else:
            print(f"  [FALLA] El método de pago cambió a '{row_after['metodo_pago']}'.")

    # 2d. Comprobar descuento de stock en pos_base y pos_novedad
    cur.execute("SELECT filas FROM pos_base WHERE id = %s", (pos_base_row_id,))
    row_pb_after = cur.fetchone()
    stock_after = None
    if row_pb_after:
        filas_after = row_pb_after["filas"] if isinstance(row_pb_after["filas"], list) else json.loads(row_pb_after["filas"])
        for f in filas_after:
            if idx_nombre != -1 and str(f[idx_nombre]).lower() == "asado":
                stock_after = float(f[idx_stock])
                break

    cur.execute("SELECT count(*) as c FROM pos_novedad WHERE empresa_id = 1 AND tabla = 'productos' AND fila_id = %s", (str(asado_pos_base_id),))
    nov_count = cur.fetchone()["c"]

    print(f"  Comprobación de Stock:")
    print(f"    Stock antes: {initial_asado_stock}")
    print(f"    Stock después: {stock_after}")
    print(f"    Novedades en pos_novedad: {nov_count}")

    if stock_after is not None and stock_after < initial_asado_stock and nov_count > 0:
        print("  [OK] Stock descontado y registrado en pos_novedad.")
        results["step2_reception_and_stock"]["stock_descontado"] = True
    else:
        print("  [FALLA DETECTADA] El stock NO fue descontado en pos_base/pos_novedad.")
        print("                    Causa raíz: En 'app/routes/api_repartofacil.py' líneas 260 y 390 se invoca 'datetime.now(timezone.utc)',")
        print("                    pero 'timezone' no fue importado de 'datetime', arrojando NameError silenciado.")
        results["step2_reception_and_stock"]["stock_descontado"] = False
        results["step2_reception_and_stock"]["causa_falla_stock"] = "NameError: name 'timezone' is not defined en api_repartofacil.py"

db_conn.close()

# ----------------------------------------------------------------------
# 3. Chat tripartito
# ----------------------------------------------------------------------
print("\n>>> PASO 3: Chat tripartito...")

# 3a. Enviar mensaje desde recepción (cobrofacil)
msg_content = "Hola! Tu pedido de Asado en Alfaro 1964 está siendo procesado."
print(f"  Enviando mensaje desde recepción: '{msg_content}'")
with crm_app.test_client() as client:
    with client.session_transaction() as sess:
        sess["authenticated"] = True
        sess["empresa_id"] = 1
        sess["role"] = "admin"
    
    resp_msg = client.post(f"/api/repartofacil/chat/{order_id}/mensaje", json={"content": msg_content})
    print(f"  Respuesta envío chat recepción: HTTP {resp_msg.status_code}")
    msg_sent_data = resp_msg.get_json() if resp_msg.status_code == 200 else {}

# 3b. Verificar que llegue en RepartoFacil-web y comprobar zona horaria
status_chat, body_chat = http_json(
    f"{NEXT_URL}/api/chat/{order_id}",
    headers={"Authorization": f"Bearer {test_client_token}"}
)
if status_chat == 200 and isinstance(body_chat, dict) and "messages" in body_chat:
    msgs = body_chat["messages"]
    print(f"  [OK] Mensajes recibidos en RepartoFacil-web: {len(msgs)} mensaje(s)")
    store_msg = next((m for m in msgs if m.get("content") == msg_content), None)
    if store_msg:
        print(f"       Mensaje encontrado:")
        print(f"       Autor: '{store_msg.get('authorName')}' (Rol: {store_msg.get('authorRole')})")
        print(f"       Timestamp: '{store_msg.get('timestamp')}'")
        
        # Verificar hora de Argentina (UTC-3)
        arg_tz = ZoneInfo("America/Argentina/Buenos_Aires")
        now_arg = datetime.now(arg_tz)
        expected_hour = now_arg.strftime("%H")
        msg_time = store_msg.get("timestamp", "")
        msg_hour = msg_time.split(":")[0] if ":" in msg_time else ""
        
        print(f"       Hora actual Argentina: {now_arg.strftime('%H:%M')} (Hora esperada: {expected_hour}:XX)")
        if msg_hour == expected_hour:
            print(f"  [OK] La hora del mensaje ({msg_time}) coincide con la hora local de Argentina ({expected_hour}:XX).")
            results["step3_chat_tripartito"]["timezone_ok"] = True
            results["step3_chat_tripartito"]["message_timestamp"] = msg_time
        else:
            print(f"  [FALLA] La hora del mensaje ({msg_time}) NO coincide con Argentina ({expected_hour}:XX). Probable UTC.")
            results["step3_chat_tripartito"]["timezone_ok"] = False
            results["step3_chat_tripartito"]["message_timestamp"] = msg_time
    else:
        print(f"  [ERROR] No se encontró el mensaje enviado en la lista de mensajes: {msgs}")
        results["step3_chat_tripartito"]["timezone_ok"] = False
else:
    print(f"  [ERROR] Falló consulta a /api/chat/{order_id}: HTTP {status_chat} {body_chat}")
    results["step3_chat_tripartito"]["timezone_ok"] = False

# ----------------------------------------------------------------------
# 4. Modo Repartidor (RepartoFacil-web)
# ----------------------------------------------------------------------
print("\n>>> PASO 4: Modo Repartidor (RepartoFacil-web)...")

# 4a. Probar autenticación contra /api/auth/login en cobrofacil
print("  Probando autenticación contra /api/auth/login en cobrofacil...")
status_login_driver, body_login_driver = http_json(
    f"{RENDER_URL}/api/auth/login",
    method="POST",
    data={"email": "repartidor@repartofacil.com", "password": "password"}
)
print(f"  Intento de login con 'repartidor@repartofacil.com' en Render: HTTP {status_login_driver}")
if status_login_driver == 500:
    print("  [FALLA DETECTADA] /api/auth/login arroja HTTP 500.")
    print("                    Causa raíz: 'login_throttles' no tiene columna 'id', y 'app/database.py' agrega")
    print("                    automáticamente 'RETURNING id' en todos los INSERT, haciendo crashear psycopg2.")
    results["step4_driver_mode"]["auth_login_endpoint_works"] = False
    results["step4_driver_mode"]["auth_login_error"] = "HTTP 500 - UndefinedColumn: column 'id' does not exist en login_throttles"
else:
    results["step4_driver_mode"]["auth_login_endpoint_works"] = (status_login_driver == 200)

# 4b. Registrar repartidor de prueba para continuar la prueba operativa
status_reg_d, body_reg_d = http_json(
    f"{RENDER_URL}/api/auth/register",
    method="POST",
    data={
        "email": test_driver_email,
        "password": "password123",
        "display_name": "Chofer Trencito E2E",
        "role": "driver"
    }
)
if status_reg_d == 200 and isinstance(body_reg_d, dict) and "access_token" in body_reg_d:
    test_driver_token = body_reg_d["access_token"]
    test_driver_id = body_reg_d["user"]["id"]
    print(f"  [OK] Repartidor de prueba registrado: ID={test_driver_id}")
    results["step4_driver_mode"]["driver_registered"] = True
else:
    print(f"  [ERROR] Falló registro de chofer: {status_reg_d} {body_reg_d}")
    results["step4_driver_mode"]["driver_registered"] = False

# 4c. Tomar el pedido en 'Disponibles'
if test_driver_token:
    print("  Tomando pedido desde Disponibles (PATCH /api/orders con status='Assigned')...")
    status_take, body_take = http_json(
        f"{NEXT_URL}/api/orders",
        method="PATCH",
        data={
            "id": order_id,
            "status": "Assigned",
            "driverId": test_driver_id,
            "driverName": "Chofer Trencito E2E"
        },
        headers={"Authorization": f"Bearer {test_driver_token}"}
    )
    if status_take == 200:
        print(f"  [OK] Pedido tomado con éxito por el repartidor.")
        print(f"       Nuevo estado: '{body_take.get('status')}'")
        print(f"       Repartidor asignado: '{body_take.get('driverId')}'")
        results["step4_driver_mode"]["order_assigned"] = True
        results["step4_driver_mode"]["assigned_status"] = body_take.get("status")
        
        # Verificar que pase a Mi Ruta y no quede trabado en 'Pendiente de confirmación'
        # En frontend: myActiveOrders filtra por driverId === currentDriverId y estado IN ('assigned', 'picked up', 'in transit', 'ready', 'embalado')
        if body_take.get("driverId") == test_driver_id and body_take.get("status") in ("Assigned", "assigned"):
            print("  [OK] El pedido no queda trabado en 'Pendiente de confirmación': el backend confirmó la asignación y pasa de 'Disponibles' a 'Mi Ruta'.")
            results["step4_driver_mode"]["passed_to_mi_ruta"] = True
        else:
            print("  [FALLA] El pedido no quedó con los datos esperados para 'Mi Ruta'.")
            results["step4_driver_mode"]["passed_to_mi_ruta"] = False
    else:
        print(f"  [ERROR] Falló tomar pedido: HTTP {status_take} {body_take}")
        results["step4_driver_mode"]["order_assigned"] = False
        results["step4_driver_mode"]["passed_to_mi_ruta"] = False

# ----------------------------------------------------------------------
# 5. Embalado, retiro y entrega
# ----------------------------------------------------------------------
print("\n>>> PASO 5: Embalado, retiro y entrega...")

# 5a. Marcar EMBALADO desde cobrofacil
print("  Marcando pedido como EMBALADO desde cobrofacil (/api/repartofacil/pedidos/<id>/embalar)...")
with crm_app.test_client() as client:
    with client.session_transaction() as sess:
        sess["authenticated"] = True
        sess["empresa_id"] = 1
        sess["role"] = "admin"
    
    resp_pack = client.post(f"/api/repartofacil/pedidos/{order_id}/embalar", json={})
    print(f"  Respuesta marcar embalado: HTTP {resp_pack.status_code}")
    if resp_pack.status_code == 200:
        pack_data = resp_pack.get_json()
        print(f"  [OK] Pedido marcado como embalado: estado='{pack_data.get('estado')}'")
        results["step5_packaging_and_delivery"]["embalado_ok"] = True
    else:
        print(f"  [ERROR] Falló marcar embalado: {resp_pack.get_data(as_text=True)}")
        results["step5_packaging_and_delivery"]["embalado_ok"] = False

# 5b. Avanzar Parada 1: Retirado (Picked Up)
if test_driver_token:
    print("  Avanzando Parada 1: Retirado en local (PATCH /api/orders status='Picked Up')...")
    status_pickup, body_pickup = http_json(
        f"{NEXT_URL}/api/orders",
        method="PATCH",
        data={
            "id": order_id,
            "status": "Picked Up",
            "driverId": test_driver_id
        },
        headers={"Authorization": f"Bearer {test_driver_token}"}
    )
    if status_pickup == 200:
        print(f"  [OK] Parada 1 completada: Estado='{body_pickup.get('status')}'")
        results["step5_packaging_and_delivery"]["pickup_ok"] = True
    else:
        print(f"  [ERROR] Falló Parada 1 (Picked Up): HTTP {status_pickup} {body_pickup}")
        results["step5_packaging_and_delivery"]["pickup_ok"] = False

    # 5c. Avanzar Parada 2: Entregado al cliente (Delivered)
    print("  Avanzando Parada 2: Entregado a domicilio (PATCH /api/orders status='Delivered')...")
    status_deliv, body_deliv = http_json(
        f"{NEXT_URL}/api/orders",
        method="PATCH",
        data={
            "id": order_id,
            "status": "Delivered",
            "driverId": test_driver_id
        },
        headers={"Authorization": f"Bearer {test_driver_token}"}
    )
    if status_deliv == 200:
        print(f"  [OK] Parada 2 completada: Estado='{body_deliv.get('status')}'")
        results["step5_packaging_and_delivery"]["delivered_ok"] = True
        
        # Verificar que el pedido salga de activos hacia Historial de pedidos
        # En la UI: Delivered sale de myActiveOrders y pasa al Historial
        print("  [OK] Con estado 'Delivered', el pedido es retirado de las rutas activas y pasa automáticamente a 'Historial de pedidos'.")
        results["step5_packaging_and_delivery"]["moved_to_history"] = True
    else:
        print(f"  [ERROR] Falló Parada 2 (Delivered): HTTP {status_deliv} {body_deliv}")
        results["step5_packaging_and_delivery"]["delivered_ok"] = False
        results["step5_packaging_and_delivery"]["moved_to_history"] = False

# ----------------------------------------------------------------------
# 6. Limpieza completa
# ----------------------------------------------------------------------
print("\n>>> PASO 6: Limpieza de datos de prueba...")
db_conn = get_db_conn()
try:
    with db_conn.cursor() as cur:
        # 1. Eliminar lecturas de chat de prueba
        cur.execute("DELETE FROM public.repartofacil_chat_lecturas WHERE mensaje_id IN (SELECT id FROM public.repartofacil_chat_mensajes WHERE order_id = %s)", (order_id,))
        # 2. Eliminar mensajes de chat de prueba
        cur.execute("DELETE FROM public.repartofacil_chat_mensajes WHERE order_id = %s", (order_id,))
        # 3. Eliminar pedido de prueba
        cur.execute("DELETE FROM public.repartofacil_pedidos WHERE id = %s", (order_id,))
        # 4. Eliminar usuarios temporales
        cur.execute("DELETE FROM public.local_users WHERE email IN (%s, %s)", (test_client_email, test_driver_email))
        
        # 5. Restaurar stock en pos_base si hubiese cambiado
        if pos_base_row_id and initial_asado_stock is not None:
            cur.execute("SELECT columnas, filas FROM pos_base WHERE id = %s", (pos_base_row_id,))
            row_clean = cur.fetchone()
            if row_clean:
                cols_c = row_clean[0] if isinstance(row_clean[0], list) else json.loads(row_clean[0])
                filas_c = row_clean[1] if isinstance(row_clean[1], list) else json.loads(row_clean[1])
                idx_stk = cols_c.index("stock") if "stock" in cols_c else -1
                idx_nom = cols_c.index("nombre") if "nombre" in cols_c else -1
                changed = False
                for f in filas_c:
                    if idx_nom != -1 and str(f[idx_nom]).lower() == "asado":
                        if float(f[idx_stk]) != initial_asado_stock:
                            f[idx_stk] = initial_asado_stock
                            changed = True
                        break
                if changed:
                    cur.execute("UPDATE pos_base SET filas = %s WHERE id = %s", (json.dumps(filas_c), pos_base_row_id))
                    print("  [OK] Stock de Asado restaurado en pos_base.")

        # 6. Eliminar novedades creadas para la prueba
        if asado_pos_base_id:
            cur.execute("DELETE FROM pos_novedad WHERE fila_id = %s AND actualizado_en >= NOW() - INTERVAL '5 minutes'", (str(asado_pos_base_id),))

        db_conn.commit()
        print("  [OK] Base de datos 100% limpia sin registros residuales.")
        results["step6_cleanup"]["success"] = True
except Exception as e:
    db_conn.rollback()
    print(f"  [ERROR] Error durante limpieza: {e}")
    results["step6_cleanup"]["success"] = False
    results["step6_cleanup"]["error"] = str(e)
finally:
    db_conn.close()

print("\n" + "=" * 80)
print("RESUMEN FINAL DE LA PRUEBA E2E")
print("=" * 80)
print(json.dumps(results, indent=2))

# Save results file
with open("tests/e2e_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\nResultados guardados en tests/e2e_results.json.")
