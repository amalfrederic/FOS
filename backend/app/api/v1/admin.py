from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from decimal import Decimal

from app.db.session import get_db
from app.models.user import User
from app.models.food import Food
from app.models.category import Category
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.food import FoodResponse
from app.schemas.order import OrderStatusUpdate
from app.schemas.admin import (
    FoodCreate,
    FoodUpdate,
    FoodAvailabilityUpdate,
    CategoryCreate,
    CategoryUpdate,
    CategoryAdminResponse,
    AdminOrderResponse,
    CustomerAdminResponse,
    PaymentAdminResponse,
    DashboardStatsResponse,
)
from app.api.deps import get_current_admin

router = APIRouter(dependencies=[Depends(get_current_admin)])

ALLOWED_STATUS_TRANSITIONS = {
    "PLACED": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["PREPARING", "CANCELLED"],
    "PREPARING": ["OUT_FOR_DELIVERY", "CANCELLED"],
    "OUT_FOR_DELIVERY": ["DELIVERED", "CANCELLED"],
    "DELIVERED": [],
    "CANCELLED": []
}

def format_admin_order(order: Order) -> AdminOrderResponse:
    customer_name = order.user.full_name if order.user else "Unknown Customer"
    customer_email = order.user.email if order.user else "unknown@foodiehub.com"
    return AdminOrderResponse(
        id=order.id,
        user_id=order.user_id,
        customer_name=customer_name,
        customer_email=customer_email,
        subtotal=float(order.subtotal),
        delivery_fee=float(order.delivery_fee),
        tax_amount=float(order.tax_amount),
        total_amount=float(order.total_amount),
        delivery_address=order.delivery_address,
        city=order.city,
        state=order.state,
        pin_code=order.pin_code,
        contact_number=order.contact_number,
        status=order.status,
        payment_status=order.payment_status,
        idempotency_key=order.idempotency_key,
        created_at=order.created_at,
        items=order.items
    )

# ----------------------------------------------------
# 1. Dashboard Metrics
# ----------------------------------------------------
@router.get("/dashboard", response_model=DashboardStatsResponse, tags=["Admin - Dashboard"])
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_customers = db.query(func.count(User.id)).filter(func.upper(User.role) == "CUSTOMER").scalar() or 0
    total_foods = db.query(func.count(Food.id)).scalar() or 0
    available_foods = db.query(func.count(Food.id)).filter(Food.is_available == True).scalar() or 0
    completed_orders = db.query(func.count(Order.id)).filter(Order.status == "DELIVERED").scalar() or 0
    
    pending_statuses = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"]
    pending_orders = db.query(func.count(Order.id)).filter(Order.status.in_(pending_statuses)).scalar() or 0

    # Total revenue strictly from successfully paid orders
    paid_revenue_sum = db.query(func.sum(Order.total_amount)).filter(Order.payment_status == "PAID").scalar()
    total_revenue = float(paid_revenue_sum) if paid_revenue_sum else 0.0

    recent_orders_db = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = [format_admin_order(o) for o in recent_orders_db]

    return DashboardStatsResponse(
        total_orders=total_orders,
        total_customers=total_customers,
        total_foods=total_foods,
        available_foods=available_foods,
        completed_orders=completed_orders,
        pending_orders=pending_orders,
        total_revenue=round(total_revenue, 2),
        recent_orders=recent_orders
    )

# ----------------------------------------------------
# 2. Orders Management
# ----------------------------------------------------
@router.get("/orders", response_model=List[AdminOrderResponse], tags=["Admin - Orders"])
def get_all_orders(
    search: Optional[str] = Query(None, description="Search by order ID or customer name/email"),
    status: Optional[str] = Query(None, description="Filter by status: PLACED, CONFIRMED, etc."),
    payment_status: Optional[str] = Query(None, description="Filter by payment status: PAID, PENDING, FAILED"),
    db: Session = Depends(get_db)
):
    query = db.query(Order).join(User, Order.user_id == User.id)

    if status and status.upper() != "ALL":
        query = query.filter(Order.status == status.upper().strip())

    if payment_status and payment_status.upper() != "ALL":
        query = query.filter(Order.payment_status == payment_status.upper().strip())

    if search:
        search_term = f"%{search.strip()}%"
        if search.strip().isdigit():
            query = query.filter((Order.id == int(search.strip())) | User.full_name.ilike(search_term) | User.email.ilike(search_term))
        else:
            query = query.filter(User.full_name.ilike(search_term) | User.email.ilike(search_term))

    orders = query.order_by(Order.created_at.desc()).all()
    return [format_admin_order(o) for o in orders]

@router.patch("/orders/{order_id}/status", response_model=AdminOrderResponse, tags=["Admin - Orders"])
def admin_update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{order_id} not found."
        )

    target_status = status_update.status.upper().strip()
    current_status = order.status

    allowed_next = ALLOWED_STATUS_TRANSITIONS.get(current_status, [])
    if target_status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order status transition from '{current_status}' to '{target_status}'. Allowed transitions: {allowed_next}"
        )

    order.status = target_status
    if target_status == "CANCELLED" and order.payment_status == "PENDING":
        order.payment_status = "CANCELLED"

    db.commit()
    db.refresh(order)
    return format_admin_order(order)

# ----------------------------------------------------
# 3. Foods Management
# ----------------------------------------------------
@router.get("/foods", response_model=List[FoodResponse], tags=["Admin - Foods"])
def admin_get_foods(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Food).join(Category, Food.category_id == Category.id)
    if search:
        query = query.filter(Food.name.ilike(f"%{search.strip()}%"))
    if category_id:
        query = query.filter(Food.category_id == category_id)

    foods = query.order_by(Food.id.desc()).all()
    return [
        FoodResponse(
            id=f.id,
            name=f.name,
            description=f.description,
            price=float(f.price),
            image_url=f.image_url,
            category_id=f.category_id,
            is_vegetarian=f.is_vegetarian,
            is_available=f.is_available,
            created_at=f.created_at,
            category_name=f.category.name if f.category else None
        )
        for f in foods
    ]

@router.post("/foods", response_model=FoodResponse, status_code=status.HTTP_201_CREATED, tags=["Admin - Foods"])
def admin_create_food(
    food_in: FoodCreate,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == food_in.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {food_in.category_id} does not exist."
        )

    if food_in.price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Food price must be greater than zero."
        )

    new_food = Food(
        name=food_in.name.strip(),
        description=food_in.description.strip() if food_in.description else None,
        price=Decimal(str(food_in.price)),
        image_url=food_in.image_url.strip() if food_in.image_url else None,
        category_id=food_in.category_id,
        is_vegetarian=food_in.is_vegetarian,
        is_available=food_in.is_available
    )
    db.add(new_food)
    db.commit()
    db.refresh(new_food)

    return FoodResponse(
        id=new_food.id,
        name=new_food.name,
        description=new_food.description,
        price=float(new_food.price),
        image_url=new_food.image_url,
        category_id=new_food.category_id,
        is_vegetarian=new_food.is_vegetarian,
        is_available=new_food.is_available,
        created_at=new_food.created_at,
        category_name=category.name
    )

@router.put("/foods/{food_id}", response_model=FoodResponse, tags=["Admin - Foods"])
def admin_update_food(
    food_id: int,
    food_in: FoodUpdate,
    db: Session = Depends(get_db)
):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item #{food_id} not found."
        )

    if food_in.category_id is not None:
        cat = db.query(Category).filter(Category.id == food_in.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {food_in.category_id} does not exist."
            )
        food.category_id = food_in.category_id

    if food_in.name is not None:
        food.name = food_in.name.strip()
    if food_in.description is not None:
        food.description = food_in.description.strip() if food_in.description else None
    if food_in.price is not None:
        if food_in.price <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Food price must be greater than zero."
            )
        food.price = Decimal(str(food_in.price))
    if food_in.image_url is not None:
        food.image_url = food_in.image_url.strip() if food_in.image_url else None
    if food_in.is_vegetarian is not None:
        food.is_vegetarian = food_in.is_vegetarian
    if food_in.is_available is not None:
        food.is_available = food_in.is_available

    db.commit()
    db.refresh(food)

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

@router.patch("/foods/{food_id}/availability", response_model=FoodResponse, tags=["Admin - Foods"])
def admin_toggle_food_availability(
    food_id: int,
    payload: FoodAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item #{food_id} not found."
        )

    food.is_available = payload.is_available
    db.commit()
    db.refresh(food)

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

@router.delete("/foods/{food_id}", tags=["Admin - Foods"])
def admin_delete_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food item #{food_id} not found."
        )

    db.delete(food)
    db.commit()
    return {"message": "Food item successfully deleted", "food_id": food_id}

# ----------------------------------------------------
# 4. Categories Management
# ----------------------------------------------------
@router.get("/categories", response_model=List[CategoryAdminResponse], tags=["Admin - Categories"])
def admin_get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.name.asc()).all()
    result = []
    for cat in categories:
        count = db.query(func.count(Food.id)).filter(Food.category_id == cat.id).scalar() or 0
        result.append(CategoryAdminResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            foods_count=count
        ))
    return result

@router.post("/categories", response_model=CategoryAdminResponse, status_code=status.HTTP_201_CREATED, tags=["Admin - Categories"])
def admin_create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db)
):
    name_clean = cat_in.name.strip()
    existing = db.query(Category).filter(func.lower(Category.name) == name_clean.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{name_clean}' already exists."
        )

    category = Category(
        name=name_clean,
        description=cat_in.description.strip() if cat_in.description else None
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return CategoryAdminResponse(
        id=category.id,
        name=category.name,
        description=category.description,
        foods_count=0
    )

@router.put("/categories/{category_id}", response_model=CategoryAdminResponse, tags=["Admin - Categories"])
def admin_update_category(
    category_id: int,
    cat_in: CategoryUpdate,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category #{category_id} not found."
        )

    if cat_in.name is not None:
        name_clean = cat_in.name.strip()
        existing = db.query(Category).filter(
            func.lower(Category.name) == name_clean.lower(),
            Category.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Another category with name '{name_clean}' already exists."
            )
        category.name = name_clean

    if cat_in.description is not None:
        category.description = cat_in.description.strip() if cat_in.description else None

    db.commit()
    db.refresh(category)

    count = db.query(func.count(Food.id)).filter(Food.category_id == category.id).scalar() or 0
    return CategoryAdminResponse(
        id=category.id,
        name=category.name,
        description=category.description,
        foods_count=count
    )

@router.delete("/categories/{category_id}", tags=["Admin - Categories"])
def admin_delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category #{category_id} not found."
        )

    # Check if category has active foods to prevent accidental deletion
    foods_count = db.query(func.count(Food.id)).filter(Food.category_id == category_id).scalar() or 0
    if foods_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category '{category.name}' because it contains {foods_count} food item(s). Reassign or remove foods first."
        )

    db.delete(category)
    db.commit()
    return {"message": "Category successfully deleted", "category_id": category_id}

# ----------------------------------------------------
# 5. Customers Management
# ----------------------------------------------------
@router.get("/customers", response_model=List[CustomerAdminResponse], tags=["Admin - Customers"])
def admin_get_customers(db: Session = Depends(get_db)):
    customers = db.query(User).filter(func.upper(User.role) == "CUSTOMER").order_by(User.id.desc()).all()
    
    result = []
    for c in customers:
        orders_count = db.query(func.count(Order.id)).filter(Order.user_id == c.id).scalar() or 0
        spent_sum = db.query(func.sum(Order.total_amount)).filter(
            Order.user_id == c.id,
            Order.payment_status == "PAID"
        ).scalar()
        total_spent = float(spent_sum) if spent_sum else 0.0

        result.append(CustomerAdminResponse(
            id=c.id,
            full_name=c.full_name,
            email=c.email,
            role=c.role.upper(),
            created_at=c.created_at,
            orders_count=orders_count,
            total_spent=round(total_spent, 2)
        ))
    return result

# ----------------------------------------------------
# 6. Payments Overview
# ----------------------------------------------------
@router.get("/payments", response_model=List[PaymentAdminResponse], tags=["Admin - Payments"])
def admin_get_payments(db: Session = Depends(get_db)):
    orders = db.query(Order).join(User, Order.user_id == User.id).order_by(Order.created_at.desc()).all()
    
    payments = []
    for o in orders:
        method = "UPI / Card (Simulated)"
        txn_id = f"TXN_SIM_{o.id:06d}"
        if o.payment_status == "PAID":
            txn_id = f"TXN_CONF_{o.id:06d}"
        elif o.payment_status == "FAILED":
            txn_id = "FAILED_DECLINED"

        payments.append(PaymentAdminResponse(
            order_id=o.id,
            customer_name=o.user.full_name if o.user else "Customer",
            customer_email=o.user.email if o.user else "N/A",
            amount=float(o.total_amount),
            payment_status=o.payment_status,
            payment_method=method,
            transaction_id=txn_id,
            created_at=o.created_at
        ))
    return payments
