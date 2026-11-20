import secrets
import hashlib
import sqlite3
import json
import os
import sys
from datetime import datetime

# Asegurar importación de app
sys.path.insert(0, os.path.dirname(__file__))
from app.database import engine, Base
from app.models.local import LocalUser, Document

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

db_path = os.path.join(os.path.dirname(__file__), "repartofacil.db")
con = sqlite3.connect(db_path)
cur = con.cursor()

def hash_pw(pw: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"

# 1. Eliminar anteriores
cur.execute("DELETE FROM local_users WHERE email IN ('repartidor@repartofacil.com', 'cliente@repartofacil.com', 'repartidor', 'cliente')")
cur.execute("DELETE FROM documents WHERE document_id IN ('repartidor-01', 'cliente-01')")

pw_hash = hash_pw("12345678")

# 2. Insertar Repartidor (con email completo y con alias simple)
rep_id = "repartidor-01"
cur.execute(
    "INSERT INTO local_users (id, email, password_hash, display_name, role, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    (rep_id, "repartidor@repartofacil.com", pw_hash, "Lucas Motomensajero", "Driver", "false", datetime.utcnow())
)
cur.execute(
    "INSERT INTO local_users (id, email, password_hash, display_name, role, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ("repartidor-alias", "repartidor", pw_hash, "Lucas Motomensajero", "Driver", "false", datetime.utcnow())
)

rep_data = json.dumps({
    "id": rep_id,
    "uid": rep_id,
    "firstName": "Lucas Motomensajero",
    "email": "repartidor@repartofacil.com",
    "role": "Driver",
    "vehicleType": "Motorcycle",
    "availabilityStatus": "Available",
    "currentLatitude": -32.9372,
    "currentLongitude": -60.6542,
    "rating": 4.95,
    "completedDeliveries": 142,
    "createdAt": datetime.utcnow().isoformat(),
    "updatedAt": datetime.utcnow().isoformat()
})
cur.execute(
    "INSERT OR REPLACE INTO documents (id, collection, document_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    (str(secrets.token_hex(16)), "driverProfiles", rep_id, rep_data, datetime.utcnow(), datetime.utcnow())
)

# 3. Insertar Cliente (con email completo y con alias simple)
cli_id = "cliente-01"
cur.execute(
    "INSERT INTO local_users (id, email, password_hash, display_name, role, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    (cli_id, "cliente@repartofacil.com", pw_hash, "Cliente Frecuente", "Client", "false", datetime.utcnow())
)
cur.execute(
    "INSERT INTO local_users (id, email, password_hash, display_name, role, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ("cliente-alias", "cliente", pw_hash, "Cliente Frecuente", "Client", "false", datetime.utcnow())
)

cli_data = json.dumps({
    "id": cli_id,
    "uid": cli_id,
    "displayName": "Cliente Frecuente",
    "email": "cliente@repartofacil.com",
    "role": "Client",
    "phone": "+54 9 341 555-1234",
    "address": "Bv. Oroño 1200, Rosario",
    "savedAddresses": ["Bv. Oroño 1200, Rosario", "San Lorenzo 2040, Rosario"],
    "ordersCount": 12,
    "createdAt": datetime.utcnow().isoformat(),
    "updatedAt": datetime.utcnow().isoformat()
})
cur.execute(
    "INSERT OR REPLACE INTO documents (id, collection, document_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    (str(secrets.token_hex(16)), "clients", cli_id, cli_data, datetime.utcnow(), datetime.utcnow())
)

con.commit()
con.close()
print("✅ Usuarios 'repartidor' y 'cliente' sembrados exitosamente (con y sin @repartofacil.com)")
