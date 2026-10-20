from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from app.schemas.order import OrderItemResponse

class FoodCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    price: float = Field(..., gt=0, description="Price must be positive")
    image_url: Optional[str] = Field(None, max_length=500)
    category_id: int = Field(..., gt=0)
    is_vegetarian: bool = True
    is_available: bool = True

class FoodUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, gt=0, description="Price must be positive")
    image_url: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = Field(None, gt=0)
    is_vegetarian: Optional[bool] = None
    is_available: Optional[bool] = None

class FoodAvailabilityUpdate(BaseModel):
    is_available: bool

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=255)

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=255)

class CategoryAdminResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    foods_count: int = 0

    class Config:
        from_attributes = True

class CustomerAdminResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime
    orders_count: int
    total_spent: float

    class Config:
        from_attributes = True

class AdminOrderResponse(BaseModel):
    id: int
    user_id: int
    customer_name: str
    customer_email: str
    subtotal: float
    delivery_fee: float
    tax_amount: float
    total_amount: float
    delivery_address: str
    city: str
    state: str
    pin_code: str
    contact_number: str
    status: str
    payment_status: str
    idempotency_key: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class PaymentAdminResponse(BaseModel):
    order_id: int
    customer_name: str
    customer_email: str
    amount: float
    payment_status: str
    payment_method: str
    transaction_id: Optional[str] = None
    created_at: datetime

class DashboardStatsResponse(BaseModel):
    total_orders: int
    total_customers: int
    total_foods: int
    available_foods: int
    completed_orders: int
    pending_orders: int
    total_revenue: float
    recent_orders: List[AdminOrderResponse]
