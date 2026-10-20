from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.food import Food
from app.models.category import Category
from app.schemas.food import FoodResponse, CategoryResponse

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse], tags=["Foods"])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()

@router.get("/foods", response_model=List[FoodResponse], tags=["Foods"])
def get_foods(
    search: Optional[str] = Query(None, description="Search term in name or description"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    is_vegetarian: Optional[bool] = Query(None, description="Filter by dietary preference"),
    is_available: Optional[bool] = Query(None, description="Filter by availability"),
    sort_by: Optional[str] = Query("name", description="Sort by field: name, price"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc, desc"),
    db: Session = Depends(get_db)
):
    query = db.query(Food).join(Category, Food.category_id == Category.id)
    
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(Food.name.ilike(search_term) | Food.description.ilike(search_term))
    
    if category_id is not None:
        query = query.filter(Food.category_id == category_id)
        
    if is_vegetarian is not None:
        query = query.filter(Food.is_vegetarian == is_vegetarian)
        
    if is_available is not None:
        query = query.filter(Food.is_available == is_available)
        
    # Sorting
    if sort_by == "price":
        order_col = Food.price.desc() if sort_order == "desc" else Food.price.asc()
    else:
        order_col = Food.name.desc() if sort_order == "desc" else Food.name.asc()
        
    foods = query.order_by(order_col).all()
    
    # Format with category_name
    result = []
    for food in foods:
        f_dict = {
            "id": food.id,
            "name": food.name,
            "description": food.description,
            "price": float(food.price),
            "image_url": food.image_url,
            "category_id": food.category_id,
            "is_vegetarian": food.is_vegetarian,
            "is_available": food.is_available,
            "created_at": food.created_at,
            "category_name": food.category.name if food.category else None
        }
        result.append(FoodResponse(**f_dict))
    return result

@router.get("/foods/{food_id}", response_model=FoodResponse, tags=["Foods"])
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item with ID {food_id} not found"
        )
    return FoodResponse(
        id=food.id,
        name=food.name,
        description=food.description,
        price=float(food.price),
        image_url=food.image_url,
        category_id=food.category_id,
        is_vegetarian=food.is_vegetarian,
        is_available=food.is_available,
        created_at=food.created_at,
        category_name=food.category.name if food.category else None
    )
