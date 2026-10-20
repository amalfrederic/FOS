from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    food_id: int = Field(..., gt=0, description="Valid ID of food item")
    quantity: int = Field(..., ge=1, le=50, description="Quantity between 1 and 50")

class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of items to order")
    delivery_address: str = Field(..., min_length=5, max_length=255, description="Street address")
    city: str = Field(..., min_length=2, max_length=100, description="City")
    state: str = Field(..., min_length=2, max_length=100, description="State")
    pin_code: str = Field(..., description="6-digit Indian PIN code")
    contact_number: str = Field(..., description="10-digit mobile number")
    idempotency_key: Optional[str] = Field(None, max_length=100, description="Unique client key to prevent duplicate orders")

    @field_validator("pin_code")
    @classmethod
    def validate_pin_code(cls, v: str) -> str:
        clean_pin = v.strip()
        if not (len(clean_pin) == 6 and clean_pin.isdigit() and clean_pin[0] != '0'):
            raise ValueError("PIN code must be a valid 6-digit Indian postal code (cannot start with 0)")
        return clean_pin

    @field_validator("contact_number")
    @classmethod
    def validate_contact_number(cls, v: str) -> str:
        clean_num = v.strip().replace(" ", "").replace("-", "")
        if clean_num.startswith("+91"):
            clean_num = clean_num[3:]
        elif clean_num.startswith("0") and len(clean_num) == 11:
            clean_num = clean_num[1:]
        
        if not (len(clean_num) == 10 and clean_num.isdigit() and clean_num[0] in "6789"):
            raise ValueError("Contact number must be a valid 10-digit Indian mobile number starting with 6-9")
        return clean_num

class OrderItemResponse(BaseModel):
    id: int
    food_id: Optional[int]
    food_name_snapshot: str
    unit_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
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

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="Target order status")
