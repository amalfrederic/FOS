import os
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.getenv("E2E_BASE_URL", "http://localhost:5173")

@pytest.mark.e2e
def test_e2e_full_food_ordering_journey(chrome_driver):
    driver = chrome_driver
    wait = WebDriverWait(driver, 10)

    # 1. Visit Home Page
    driver.get(f"{BASE_URL}/")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='navbar']")))
    
    # Assert Hero headline
    headline = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='hero-headline']")))
    assert "Good Food" in headline.text

    # 2. Navigate to Sign In Page
    login_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='nav-login']")))
    login_btn.click()

    # Fill customer credentials
    email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='login-email']")))
    password_input = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-password']")
    submit_login = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-submit']")

    email_input.clear()
    email_input.send_keys("customer@foodiehub.com")
    password_input.clear()
    password_input.send_keys("Password123!")
    submit_login.click()

    # Verify authenticated customer appears on storefront
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='user-name']")))

    # 3. Navigate to Menu Page
    menu_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='nav-menu']")))
    menu_link.click()

    # Wait for food cards
    food_cards = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[data-testid='food-card']")))
    assert len(food_cards) > 0

    # Add first available food item to cart
    add_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='add-to-cart']")))
    add_btn.click()

    # Assert cart count badge updates
    cart_count_elem = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='cart-count']")))
    assert int(cart_count_elem.text) >= 1

    # 4. Open Cart Page
    cart_icon = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='cart-icon']")))
    cart_icon.click()

    # Verify Cart Page
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='cart-page']")))
    checkout_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='checkout-button']")))
    checkout_btn.click()

    # 5. Checkout Page
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='checkout-page']")))

    # Ensure address fields are populated
    address_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='input-address']")))
    if not address_input.get_attribute("value"):
        address_input.send_keys("101, Brigade Road, Ashok Nagar")

    # Click Place Order
    place_order_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='place-order']")))
    place_order_btn.click()

    # 6. Order Confirmation Page
    confirmation = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='order-confirmation']")))
    assert confirmation.is_displayed()

    order_id_elem = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='order-id']")))
    assert "#" in order_id_elem.text

@pytest.mark.e2e
def test_e2e_admin_login_and_dashboard_navigation(chrome_driver):
    driver = chrome_driver
    wait = WebDriverWait(driver, 10)

    # 1. Clear session and visit login
    driver.get(f"{BASE_URL}/login")
    driver.execute_script("localStorage.clear();")
    driver.refresh()

    # 2. Fill Admin Credentials
    email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='login-email']")))
    password_input = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-password']")
    submit_login = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-submit']")

    email_input.clear()
    email_input.send_keys("admin@foodiehub.com")
    password_input.clear()
    password_input.send_keys("Admin123!")
    submit_login.click()

    # 3. Assert role-aware redirect navigates directly to /admin/dashboard
    wait.until(EC.url_contains("/admin/dashboard"))
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-dashboard-page']")))

    # Verify admin dashboard title and stat cards
    title_elem = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-dashboard-title']")))
    assert "System Overview" in title_elem.text
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='stat-revenue']")))

    # 4. Navigate to Admin Orders via Sidebar
    nav_orders = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='admin-nav-orders']")))
    nav_orders.click()

    wait.until(EC.url_contains("/admin/orders"))
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-orders-page']")))
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-orders-title']")))

    # 5. Navigate to Admin Foods via Sidebar
    nav_foods = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='admin-nav-foods']")))
    nav_foods.click()

    wait.until(EC.url_contains("/admin/foods"))
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-foods-page']")))
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='admin-foods-title']")))

    # 6. Click View Storefront and verify navigation back to customer home
    storefront_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='link-view-storefront']")))
    storefront_link.click()

    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='navbar']")))
    # Assert Admin Panel button is present in the customer navbar
    admin_panel_btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='nav-admin-console']")))
    assert admin_panel_btn.is_displayed()
