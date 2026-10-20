import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FoodieHub"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "foodiehub-super-secret-jwt-key-for-development-only-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    # Support PostgreSQL with fallback or test config
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg://amalfrederict@localhost:5432/foodiehub_dev"
    )
    TEST_DATABASE_URL: str = os.getenv(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://amalfrederict@localhost:5432/foodiehub_test"
    )
    
    # Business logic limits & fees
    DELIVERY_FEE: float = 40.0
    FREE_DELIVERY_THRESHOLD: float = 500.0
    TAX_RATE: float = 0.05  # 5% GST
    MAX_ITEM_QUANTITY: int = 50
    MIN_ITEM_QUANTITY: int = 1
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
