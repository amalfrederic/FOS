import pytest
from decimal import Decimal

def test_full_order_creation_and_payment_workflow(client, customer_token_headers):
    # 1. Fetch available food items
    foods_response = client.get("/api/foods")
    assert foods_response.status_code == 200
    available_foods = [f for f in foods_response.json() if f["is_available"]]
    assert len(available_foods) >= 2

    food_1 = available_foods[0]
    food_2 = available_foods[1]

    # 2. Place Order
    order_payload = {
        "items": [
            {"food_id": food_1["id"], "quantity": 2},
            {"food_id": food_2["id"], "quantity": 1}
        ],
        "delivery_address": "Flat 302, Palm Grove Heights, Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560038",
        "contact_number": "9876543210",
        "idempotency_key": "INTEG_IDEM_TEST_001"
    }

    create_res = client.post("/api/orders", json=order_payload, headers=customer_token_headers)
    assert create_res.status_code == 201, f"Order creation failed: {create_res.text}"
    order_data = create_res.json()
    order_id = order_data["id"]

    # Assert calculations
    expected_subtotal = round(food_1["price"] * 2 + food_2["price"] * 1, 2)
    assert round(order_data["subtotal"], 2) == expected_subtotal
    expected_tax = round(expected_subtotal * 0.05, 2)
    assert round(order_data["tax_amount"], 2) == expected_tax
    expected_delivery = 0.0 if expected_subtotal >= 500.0 else 40.0
    assert order_data["delivery_fee"] == expected_delivery
    expected_total = round(expected_subtotal + expected_delivery + expected_tax, 2)
    assert round(order_data["total_amount"], 2) == expected_total

    assert order_data["status"] == "PLACED"
    assert order_data["payment_status"] == "PENDING"
    assert len(order_data["items"]) == 2

    # 3. Process mock payment
    pay_res = client.post(
        "/api/payments/mock",
        json={"order_id": order_id, "simulate_failure": False, "payment_method": "UPI"},
        headers=customer_token_headers
    )
    assert pay_res.status_code == 200
    pay_data = pay_res.json()
    assert pay_data["success"] is True
    assert pay_data["payment_status"] == "PAID"
    assert pay_data["order_status"] == "CONFIRMED"
    assert "TXN_" in pay_data["transaction_id"]

    # 4. Verify order in order history
    history_res = client.get("/api/orders", headers=customer_token_headers)
    assert history_res.status_code == 200
    order_ids = [o["id"] for o in history_res.json()]
    assert order_id in order_ids

    # 5. Fetch specific order details
    detail_res = client.get(f"/api/orders/{order_id}", headers=customer_token_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["status"] == "CONFIRMED"
    assert detail_res.json()["payment_status"] == "PAID"

def test_tampered_price_recalculated_authoritative(client, customer_token_headers):
    """
    Even if client tries to send tampered unit prices, the backend ignores them
    and only computes total from trusted database snapshots.
    """
    foods_response = client.get("/api/foods")
    food = foods_response.json()[0]

    # Malicious attempt to pay ₹1 for expensive item
    payload = {
        "items": [{"food_id": food["id"], "quantity": 1}],
        "delivery_address": "Security Audit Lane",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pin_code": "560001",
        "contact_number": "9123456789"
    }

    res = client.post("/api/orders", json=payload, headers=customer_token_headers)
    assert res.status_code == 201
    order = res.json()
    # Verified: unit price matches actual DB price
    assert order["items"][0]["unit_price"] == food["price"]
    assert order["subtotal"] == food["price"]

def test_status_lifecycle_transitions(client, customer_token_headers):
    # Create order
    foods = client.get("/api/foods").json()
    order_res = client.post(
        "/api/orders",
        json={
            "items": [{"food_id": foods[0]["id"], "quantity": 1}],
            "delivery_address": "Lifecycle Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "contact_number": "9123456789"
        },
        headers=customer_token_headers
    )
    order_id = order_res.json()["id"]

    # Transition: PLACED -> CONFIRMED
    res1 = client.patch(f"/api/orders/{order_id}/status", json={"status": "CONFIRMED"}, headers=customer_token_headers)
    assert res1.status_code == 200
    assert res1.json()["status"] == "CONFIRMED"

    # Transition: CONFIRMED -> PREPARING
    res2 = client.patch(f"/api/orders/{order_id}/status", json={"status": "PREPARING"}, headers=customer_token_headers)
    assert res2.status_code == 200
    assert res2.json()["status"] == "PREPARING"

    # Transition: PREPARING -> OUT_FOR_DELIVERY
    res3 = client.patch(f"/api/orders/{order_id}/status", json={"status": "OUT_FOR_DELIVERY"}, headers=customer_token_headers)
    assert res3.status_code == 200
    assert res3.json()["status"] == "OUT_FOR_DELIVERY"

    # Transition: OUT_FOR_DELIVERY -> DELIVERED
    res4 = client.patch(f"/api/orders/{order_id}/status", json={"status": "DELIVERED"}, headers=customer_token_headers)
    assert res4.status_code == 200
    assert res4.json()["status"] == "DELIVERED"

def test_invalid_status_transition_rejected(client, customer_token_headers):
    foods = client.get("/api/foods").json()
    order_res = client.post(
        "/api/orders",
        json={
            "items": [{"food_id": foods[0]["id"], "quantity": 1}],
            "delivery_address": "Invalid Step Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "contact_number": "9123456789"
        },
        headers=customer_token_headers
    )
    order_id = order_res.json()["id"]

    # Attempt illegal transition directly from PLACED to DELIVERED
    bad_res = client.patch(f"/api/orders/{order_id}/status", json={"status": "DELIVERED"}, headers=customer_token_headers)
    assert bad_res.status_code == 400
    assert "invalid order status transition" in bad_res.json()["detail"].lower()
