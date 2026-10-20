from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.api.v1 import health, auth, food, orders, payments, admin
from app.db.session import engine, Base
# Import all models to ensure metadata registration
import app.models

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="FoodieHub Full-Stack Food Ordering System REST API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev and automation testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.encoders import jsonable_encoder

# Custom validation exception handler for clean, accessible error messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"] if loc != "body"])
        error_messages.append(f"{field}: {err['msg']}" if field else err["msg"])
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "; ".join(error_messages),
            "errors": jsonable_encoder(exc.errors())
        }
    )

# Include API Routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")
app.include_router(food.router, prefix="/api")
app.include_router(orders.router, prefix="/api/orders")
app.include_router(payments.router, prefix="/api/payments")
app.include_router(admin.router, prefix="/api/admin")

@app.get("/")
def root():
    return {
        "message": "Welcome to FoodieHub API! Visit /docs for interactive OpenAPI documentation.",
        "version": "1.0.0"
    }
