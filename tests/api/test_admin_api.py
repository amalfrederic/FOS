import pytest

# ---------------------------------------------------------------------------
# 1. Authentication & Role-Based Authorization Tests
# ---------------------------------------------------------------------------
def test_unauthenticated_access_to_admin_apis_rejected(client):
    endpoints = [
        "/api/admin/dashboard",
        "/api/admin/orders",
        "/api/admin/foods",
        "/api/admin/categories",
        "/api/admin/customers",
        "/api/admin/payments",
    ]
    for endpoint in endpoints:
        res = client.get(endpoint)
        assert res.status_code == 401, f"Expected 401 on {endpoint}, got {res.status_code}"

def test_customer_access_to_admin_apis_rejected_with_403(client, customer_token_headers):
    endpoints = [
        "/api/admin/dashboard",
        "/api/admin/orders",
        "/api/admin/foods",
        "/api/admin/categories",
        "/api/admin/customers",
        "/api/admin/payments",
    ]
    for endpoint in endpoints:
        res = client.get(endpoint, headers=customer_token_headers)
        assert res.status_code == 403, f"Expected 403 for customer on {endpoint}, got {res.status_code}"
        assert "admin privileges required" in res.json()["detail"].lower()

def test_admin_access_to_admin_apis_succeeds(client, admin_token_headers):
    endpoints = [
        "/api/admin/dashboard",
        "/api/admin/orders",
        "/api/admin/foods",
        "/api/admin/categories",
        "/api/admin/customers",
        "/api/admin/payments",
    ]
    for endpoint in endpoints:
        res = client.get(endpoint, headers=admin_token_headers)
        assert res.status_code == 200, f"Expected 200 for admin on {endpoint}, got {res.status_code}"

def test_public_registration_cannot_create_admin_account(client):
    # Even if payload tries to specify role="admin" or role="ADMIN"
    payload = {
        "full_name": "Infiltrator",
        "email": "hacker@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "ADMIN"  # Attempt to elevate privilege
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    user_data = res.json()["user"]
    # Verified: user role MUST be CUSTOMER
    assert user_data["role"] == "CUSTOMER", "Public registration must never create an ADMIN account"

    # Attempting to access admin API with newly registered token must fail with 403
    token = res.json()["access_token"]
    admin_try = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert admin_try.status_code == 403

# ---------------------------------------------------------------------------
# 2. Food Management Tests
# ---------------------------------------------------------------------------
def test_admin_can_create_food_item_and_customer_menu_reflects_it(client, admin_token_headers):
    # 1. Fetch categories
    cats = client.get("/api/categories").json()
    cat_id = cats[0]["id"]

    new_dish = {
        "name": "Admin Gourmet Special Pizza",
        "description": "Artisan pizza created by administrator with smoked provolone",
        "price": 549.00,
        "category_id": cat_id,
        "is_vegetarian": True,
        "is_available": True,
        "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591"
    }

    create_res = client.post("/api/admin/foods", json=new_dish, headers=admin_token_headers)
    assert create_res.status_code == 201, f"Failed to create food: {create_res.text}"
    created_food = create_res.json()
    food_id = created_food["id"]
    assert created_food["name"] == "Admin Gourmet Special Pizza"
    assert created_food["price"] == 549.00

    # 2. Verify customer menu reflects the new food item
    customer_menu = client.get("/api/foods").json()
    dish_names = [f["name"] for f in customer_menu]
    assert "Admin Gourmet Special Pizza" in dish_names

    # 3. Admin can toggle availability
    toggle_res = client.patch(
        f"/api/admin/foods/{food_id}/availability",
        json={"is_available": False},
        headers=admin_token_headers
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_available"] is False

    # 4. Toggle back to True so subsequent tests are not blocked
    toggle_back = client.patch(
        f"/api/admin/foods/{food_id}/availability",
        json={"is_available": True},
        headers=admin_token_headers
    )
    assert toggle_back.status_code == 200

def test_admin_create_food_invalid_price_rejected(client, admin_token_headers):
    cats = client.get("/api/categories").json()
    cat_id = cats[0]["id"]

    # Negative price
    bad_dish = {
        "name": "Invalid Negative Price Dish",
        "description": "Negative price should be rejected",
        "price": -10.0,
        "category_id": cat_id,
        "is_vegetarian": True,
        "is_available": True
    }
    res = client.post("/api/admin/foods", json=bad_dish, headers=admin_token_headers)
    assert res.status_code in [400, 422]

def test_unauthorized_customer_cannot_create_or_edit_food(client, customer_token_headers):
    dish_payload = {
        "name": "Customer Created Dish",
        "price": 100.0,
        "category_id": 1,
        "is_vegetarian": True,
        "is_available": True
    }
    res_create = client.post("/api/admin/foods", json=dish_payload, headers=customer_token_headers)
    assert res_create.status_code == 403

    res_edit = client.put("/api/admin/foods/1", json={"price": 1.0}, headers=customer_token_headers)
    assert res_edit.status_code == 403

# ---------------------------------------------------------------------------
# 3. Order Management Tests
# ---------------------------------------------------------------------------
def test_admin_can_view_orders_across_customers_and_update_status(client, admin_token_headers, customer_token_headers):
    # Customer places an order
    foods = client.get("/api/foods").json()
    avail_food = next(f for f in foods if f["is_available"])
    order_res = client.post(
        "/api/orders",
        json={
            "items": [{"food_id": avail_food["id"], "quantity": 1}],
            "delivery_address": "Customer House, MG Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "contact_number": "9876543210"
        },
        headers=customer_token_headers
    )
    assert order_res.status_code == 201
    order_id = order_res.json()["id"]

    # Admin views all orders across platform
    admin_orders_res = client.get("/api/admin/orders", headers=admin_token_headers)
    assert admin_orders_res.status_code == 200
    all_orders = admin_orders_res.json()
    assert any(o["id"] == order_id for o in all_orders)
    matched = next(o for o in all_orders if o["id"] == order_id)
    assert "customer_name" in matched
    assert "customer_email" in matched

    # Admin updates order status through valid transitions:
    # PLACED -> CONFIRMED
    update_res = client.patch(
        f"/api/admin/orders/{order_id}/status",
        json={"status": "CONFIRMED"},
        headers=admin_token_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "CONFIRMED"

    # Invalid jump (CONFIRMED -> DELIVERED skipping PREPARING and OUT_FOR_DELIVERY)
    bad_update = client.patch(
        f"/api/admin/orders/{order_id}/status",
        json={"status": "DELIVERED"},
        headers=admin_token_headers
    )
    assert bad_update.status_code == 400
    assert "invalid order status transition" in bad_update.json()["detail"].lower()

# ---------------------------------------------------------------------------
# 4. Dashboard Metrics & Revenue Verification Tests
# ---------------------------------------------------------------------------
def test_dashboard_statistics_and_revenue_exclude_unpaid_orders(client, admin_token_headers, customer_token_headers):
    # 1. Fetch baseline stats
    base_stats = client.get("/api/admin/dashboard", headers=admin_token_headers).json()
    initial_revenue = base_stats["total_revenue"]
    initial_orders = base_stats["total_orders"]

    # 2. Place an order but DO NOT pay for it (payment_status remains PENDING)
    foods = client.get("/api/foods").json()
    avail_food = next(f for f in foods if f["is_available"])
    unpaid_order = client.post(
        "/api/orders",
        json={
            "items": [{"food_id": avail_food["id"], "quantity": 1}],
            "delivery_address": "Unpaid House",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "contact_number": "9876543210"
        },
        headers=customer_token_headers
    ).json()

    # 3. Place another order and simulate payment FAILURE
    failed_order = client.post(
        "/api/orders",
        json={
            "items": [{"food_id": avail_food["id"], "quantity": 1}],
            "delivery_address": "Failed Pay House",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "contact_number": "9876543210"
        },
        headers=customer_token_headers
    ).json()

    client.post(
        "/api/payments/mock",
        json={"order_id": failed_order["id"], "simulate_failure": True, "payment_method": "UPI"},
        headers=customer_token_headers
    )

    # 4. Check dashboard revenue: MUST NOT INCLUDE unpaid or failed orders
    new_stats = client.get("/api/admin/dashboard", headers=admin_token_headers).json()
    assert new_stats["total_orders"] == initial_orders + 2
    # Revenue should remain strictly unchanged since neither order is PAID!
    assert new_stats["total_revenue"] == initial_revenue

    # 5. Now pay for the first order (marked PAID)
    pay_res = client.post(
        "/api/payments/mock",
        json={"order_id": unpaid_order["id"], "simulate_failure": False, "payment_method": "UPI"},
        headers=customer_token_headers
    )
    assert pay_res.status_code == 200

    # 6. Verify revenue increased by exact order amount
    paid_stats = client.get("/api/admin/dashboard", headers=admin_token_headers).json()
    expected_rev = round(initial_revenue + unpaid_order["total_amount"], 2)
    assert round(paid_stats["total_revenue"], 2) == expected_rev

# ---------------------------------------------------------------------------
# 5. Category Management Tests
# ---------------------------------------------------------------------------
def test_admin_category_management(client, admin_token_headers):
    # 1. Create unique category
    create_res = client.post(
        "/api/admin/categories",
        json={"name": "Artisan Beverages", "description": "Craft brewed mocktails"},
        headers=admin_token_headers
    )
    assert create_res.status_code == 201
    cat_id = create_res.json()["id"]

    # 2. Duplicate category name rejected
    dup_res = client.post(
        "/api/admin/categories",
        json={"name": "Artisan Beverages"},
        headers=admin_token_headers
    )
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"].lower()

    # 3. Update category
    edit_res = client.put(
        f"/api/admin/categories/{cat_id}",
        json={"name": "Artisan Craft Drinks"},
        headers=admin_token_headers
    )
    assert edit_res.status_code == 200
    assert edit_res.json()["name"] == "Artisan Craft Drinks"

    # 4. Delete category (since 0 dishes, should succeed)
    del_res = client.delete(f"/api/admin/categories/{cat_id}", headers=admin_token_headers)
    assert del_res.status_code == 200
