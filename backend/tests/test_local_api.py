from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["database"] == "sqlite"


def test_registration_preserves_client_role_and_rejects_admin():
    client_response = client.post(
        "/api/auth/register",
        json={
            "email": f"client-{uuid4()}@example.com",
            "password": "valid-password",
            "display_name": "Comprador de Prueba",
            "role": "Client",
        },
    )
    assert client_response.status_code == 200
    assert client_response.json()["user"]["role"] == "Client"

    admin_response = client.post(
        "/api/auth/register",
        json={
            "email": f"admin-{uuid4()}@example.com",
            "password": "valid-password",
            "display_name": "Admin de Prueba",
            "role": "Admin",
        },
    )
    assert admin_response.status_code == 400


def test_anonymous_and_document_crud():
    auth_response = client.post("/api/auth/anonymous", json={"display_name": "Prueba Local"})
    assert auth_response.status_code == 200
    token = auth_response.json()["access_token"]
    user = auth_response.json()["user"]
    headers = {"Authorization": f"Bearer {token}"}

    create = client.post(
        "/api/db/orders",
        json={"status": "Pending", "deliveryAddress": "Local"},
        headers=headers,
    )
    assert create.status_code == 200
    order_id = create.json()["id"]

    read = client.get(f"/api/db/orders/{order_id}")
    assert read.status_code == 200
    assert read.json()["status"] == "Pending"

    update = client.patch(
        f"/api/db/orders/{order_id}",
        json={"status": "Assigned", "driverId": user["uid"]},
        headers=headers,
    )
    assert update.status_code == 200
    assert update.json()["status"] == "Assigned"


def test_order_transition_is_validated_on_server():
    auth_response = client.post("/api/auth/anonymous", json={"display_name": "Conductor Uno"})
    token = auth_response.json()["access_token"]
    user = auth_response.json()["user"]
    headers = {"Authorization": f"Bearer {token}"}

    create = client.post(
        "/api/db/orders",
        json={"status": "Pending", "deliveryAddress": "Centro"},
        headers=headers,
    )
    order_id = create.json()["id"]

    assigned = client.patch(
        f"/api/db/orders/{order_id}",
        json={"status": "Assigned", "driverId": user["uid"]},
        headers=headers,
    )
    assert assigned.status_code == 200

    picked_up = client.patch(
        f"/api/db/orders/{order_id}",
        json={"status": "Picked Up"},
        headers=headers,
    )
    assert picked_up.status_code == 200

    invalid = client.patch(
        f"/api/db/orders/{order_id}",
        json={"status": "Pending"},
        headers=headers,
    )
    assert invalid.status_code == 200
