import pytest

def test_edge_zero_quantity_rejected(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    payload = {
        "items": [{"food_id": foods[0]["id"], "quantity": 0}],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code in [400, 422]

def test_edge_negative_quantity_rejected(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    payload = {
        "items": [{"food_id": foods[0]["id"], "quantity": -5}],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code in [400, 422]

def test_edge_max_permitted_quantity_accepted(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    payload = {
        "items": [{"food_id": foods[0]["id"], "quantity": 50}],
        "delivery_address": "Party Banquet Hall, MG Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code == 201
    assert response.json()["items"][0]["quantity"] == 50

def test_edge_above_max_permitted_quantity_rejected(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    payload = {
        "items": [{"food_id": foods[0]["id"], "quantity": 51}],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code in [400, 422]

def test_edge_empty_cart_checkout_rejected(client, customer_token_headers):
    payload = {
        "items": [],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code in [400, 422]

def test_edge_order_unavailable_food_rejected(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    unavailable_food = next((f for f in foods if not f["is_available"]), None)
    assert unavailable_food is not None, "At least one unavailable food must be seeded"

    payload = {
        "items": [{"food_id": unavailable_food["id"], "quantity": 1}],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code == 400
    assert "currently unavailable" in response.json()["detail"].lower()

def test_edge_order_nonexistent_food_id_rejected(client, customer_token_headers):
    payload = {
        "items": [{"food_id": 999999, "quantity": 1}],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

@pytest.mark.parametrize("invalid_pin", ["012345", "12345", "1234567", "ABCDEF", "56003A"])
def test_edge_invalid_pin_codes_rejected(client, customer_token_headers, invalid_pin):
    foods = client.get("/api/foods").json()
    payload = {
        "items": [{"food_id": foods[0]["id"], "quantity": 1}],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": invalid_pin,
        "contact_number": "9876543210"
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code in [400, 422]

@pytest.mark.parametrize("invalid_phone", ["123456789", "5123456789", "98765432100", "abcdefghij"])
def test_edge_invalid_contact_numbers_rejected(client, customer_token_headers, invalid_phone):
    foods = client.get("/api/foods").json()
    payload = {
        "items": [{"food_id": foods[0]["id"], "quantity": 1}],
        "delivery_address": "Test Address",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": invalid_phone
    }
    response = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert response.status_code in [400, 422]

def test_edge_unauthorized_order_access_forbidden(client, customer_token_headers):
    # Customer 1 creates an order
    foods = client.get("/api/foods").json()
    res = client.post(
        "/api/orders",
        json={
            "items": [{"food_id": foods[0]["id"], "quantity": 1}],
            "delivery_address": "Customer 1 Address",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "contact_number": "9876543210"
        },
        headers=customer_token_headers
    )
    order_id = res.json()["id"]

    # Customer 2 logs in
    login_c2 = client.post("/api/auth/login", json={"email": "testuser@foodiehub.com", "password": "Password123!"})
    token_c2 = login_c2.json()["access_token"]
    headers_c2 = {"Authorization": f"Bearer {token_c2}"}

    # Customer 2 attempts to spy/access Customer 1's order
    spy_res = client.get(f"/api/orders/{order_id}", headers=headers_c2)
    assert spy_res.status_code == 403
    assert "access forbidden" in spy_res.json()["detail"].lower()

def test_edge_access_order_without_auth_rejected(client):
    response = client.get("/api/orders/1")
    assert response.status_code == 401

def test_edge_simulated_payment_failure(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    order_res = client.post(
        "/api/orders",
        json={
            "items": [{"food_id": foods[0]["id"], "quantity": 1}],
            "delivery_address": "Fail Sim Street",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "contact_number": "9876543210"
        },
        headers=customer_token_headers
    )
    order_id = order_res.json()["id"]

    # Process payment with simulate_failure=True
    pay_res = client.post(
        "/api/payments/mock",
        json={"order_id": order_id, "simulate_failure": True, "payment_method": "UPI"},
        headers=customer_token_headers
    )
    assert pay_res.status_code == 200
    pay_data = pay_res.json()
    assert pay_data["success"] is False
    assert pay_data["payment_status"] == "FAILED"

    # Confirm order state in DB
    detail = client.get(f"/api/orders/{order_id}", headers=customer_token_headers).json()
    assert detail["payment_status"] == "FAILED"

def test_edge_duplicate_order_submission_idempotency(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    payload = {
        "items": [{"food_id": foods[0]["id"], "quantity": 1}],
        "delivery_address": "Idempotent Lane",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9876543210",
        "idempotency_key": "UNIQUE_KEY_SUBMISSION_TEST_99"
    }

    res1 = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert res1.status_code == 201
    order1_id = res1.json()["id"]

    # Immediate second retry with exact same key
    res2 = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert res2.status_code in [200, 201]
    order2_id = res2.json()["id"]

    assert order1_id == order2_id, "Idempotent submission must return existing order ID rather than duplicating"
