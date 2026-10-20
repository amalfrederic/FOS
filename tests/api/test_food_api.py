import pytest

def test_get_categories(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 6
    category_names = [c["name"] for c in categories]
    assert "Burgers" in category_names
    assert "Pizza" in category_names
    assert "Indian" in category_names
    assert "Desserts" in category_names

def test_get_foods_list(client):
    response = client.get("/api/foods")
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) >= 20

def test_search_food_by_name(client):
    response = client.get("/api/foods", params={"search": "Paneer"})
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) > 0
    assert any("Paneer" in f["name"] for f in foods)

def test_search_food_nonexistent(client):
    response = client.get("/api/foods", params={"search": "XYZ123NonExistentDish999"})
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) == 0

def test_filter_food_by_vegetarian(client):
    response = client.get("/api/foods", params={"is_vegetarian": True})
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) > 0
    assert all(f["is_vegetarian"] is True for f in foods)

def test_filter_food_by_non_vegetarian(client):
    response = client.get("/api/foods", params={"is_vegetarian": False})
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) > 0
    assert all(f["is_vegetarian"] is False for f in foods)

def test_sort_food_by_price_asc(client):
    response = client.get("/api/foods", params={"sort_by": "price", "sort_order": "asc"})
    assert response.status_code == 200
    foods = response.json()
    prices = [f["price"] for f in foods]
    assert prices == sorted(prices)

def test_sort_food_by_price_desc(client):
    response = client.get("/api/foods", params={"sort_by": "price", "sort_order": "desc"})
    assert response.status_code == 200
    foods = response.json()
    prices = [f["price"] for f in foods]
    assert prices == sorted(prices, reverse=True)

def test_get_food_by_id_success(client):
    # Fetch all foods first to get a valid ID
    foods_res = client.get("/api/foods")
    first_food = foods_res.json()[0]
    
    response = client.get(f"/api/foods/{first_food['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == first_food["id"]
    assert response.json()["name"] == first_food["name"]

def test_get_food_by_id_not_found(client):
    response = client.get("/api/foods/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
