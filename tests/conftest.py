import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import app.models  # load models first
from app.core.config import settings
from app.db.session import Base, get_db
from app.main import app as fastapi_app
from app.db.seed import seed_database

# Use PostgreSQL test database with fallback to sqlite for environments without postgres
TEST_DB_URL = os.getenv("TEST_DATABASE_URL", "postgresql+psycopg://amalfrederict@localhost:5432/foodiehub_test")

try:
    test_engine = create_engine(TEST_DB_URL, pool_pre_ping=True)
    with test_engine.connect() as conn:
        pass
except Exception:
    # Fallback to local SQLite file for testing if postgres test db is not reachable
    test_engine = create_engine("sqlite:///./foodiehub_test.db", connect_args={"check_same_thread": False})

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Create fresh schema and seed data once per test session
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Teardown if necessary
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()

@pytest.fixture
def customer_token_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "customer@foodiehub.com", "password": "Password123!"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_token_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@foodiehub.com", "password": "Admin123!"}
    )
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def chrome_driver():
    """Selenium WebDriver fixture for E2E browser automation."""
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    mac_chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if os.path.exists(mac_chrome_path):
        chrome_options.binary_location = mac_chrome_path

    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(5)
        yield driver
        driver.quit()
    except Exception as e:
        pytest.skip(f"Chrome WebDriver could not be initialized: {e}")
