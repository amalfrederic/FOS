import pytest

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_register_new_user_success(client):
    payload = {
        "full_name": "Pooja Hegde",
        "email": "pooja.new@example.com",
        "password": "SecretPassword123!",
        "confirm_password": "SecretPassword123!"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "pooja.new@example.com"
    assert data["user"]["full_name"] == "Pooja Hegde"

def test_register_duplicate_email_fails(client):
    payload = {
        "full_name": "Duplicate Tester",
        "email": "customer@foodiehub.com",  # Already seeded
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_register_mismatched_password_fails(client):
    payload = {
        "full_name": "Mismatched Tester",
        "email": "mismatch@example.com",
        "password": "Password123!",
        "confirm_password": "DifferentPassword456!"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422
    assert "passwords do not match" in response.text.lower()

def test_register_invalid_email_format(client):
    payload = {
        "full_name": "Invalid Email",
        "email": "not-an-email",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422

def test_login_success(client):
    payload = {
        "email": "customer@foodiehub.com",
        "password": "Password123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "customer@foodiehub.com"

def test_login_incorrect_password_fails(client):
    payload = {
        "email": "customer@foodiehub.com",
        "password": "WrongPassword999!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()

def test_login_nonexistent_user_fails(client):
    payload = {
        "email": "ghost_user_9999@example.com",
        "password": "Password123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

def test_get_current_user_profile(client, customer_token_headers):
    response = client.get("/api/auth/me", headers=customer_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "customer@foodiehub.com"
    assert data["role"].lower() == "customer"

def test_get_current_user_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
