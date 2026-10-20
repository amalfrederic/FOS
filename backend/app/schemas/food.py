from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class FoodResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category_id: int
    is_vegetarian: bool
    is_available: bool
    created_at: datetime
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
