from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from app.db.session import get_db
from app.models.user import User
from app.models.food import Food
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()

ALLOWED_STATUS_TRANSITIONS = {
    "PLACED": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["PREPARING", "CANCELLED"],
    "PREPARING": ["OUT_FOR_DELIVERY", "CANCELLED"],
    "OUT_FOR_DELIVERY": ["DELIVERED", "CANCELLED"],
    "DELIVERED": [],
    "CANCELLED": []
}

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, tags=["Orders"])
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Idempotency check: prevent duplicate submissions
    if order_in.idempotency_key:
        existing_order = db.query(Order).filter(
            Order.user_id == current_user.id,
            Order.idempotency_key == order_in.idempotency_key
        ).first()
        if existing_order:
            return existing_order

    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place order with an empty cart."
        )

    # Validate items and recalculate totals strictly from database
    subtotal = Decimal("0.00")
    order_items_to_create = []

    for item in order_in.items:
        if item.quantity < settings.MIN_ITEM_QUANTITY:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item quantity must be at least {settings.MIN_ITEM_QUANTITY}."
            )
        if item.quantity > settings.MAX_ITEM_QUANTITY:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item quantity cannot exceed {settings.MAX_ITEM_QUANTITY}."
            )

        food = db.query(Food).filter(Food.id == item.food_id).first()
        if not food:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Food item with ID {item.food_id} not found."
            )

        if not food.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Food item '{food.name}' is currently unavailable for ordering."
            )

        unit_price = Decimal(str(food.price))
        line_total = unit_price * Decimal(item.quantity)
        subtotal += line_total

        order_items_to_create.append({
            "food_id": food.id,
            "food_name_snapshot": food.name,
            "unit_price": unit_price,
            "quantity": item.quantity,
            "line_total": line_total
        })

    # Pricing calculation
    delivery_fee = Decimal("0.00") if subtotal >= Decimal(str(settings.FREE_DELIVERY_THRESHOLD)) else Decimal(str(settings.DELIVERY_FEE))
    tax_amount = (subtotal * Decimal(str(settings.TAX_RATE))).quantize(Decimal("0.01"))
    total_amount = subtotal + delivery_fee + tax_amount

    if total_amount <= Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order total must be greater than zero."
        )

    # Transactional order persistence
    try:
        new_order = Order(
            user_id=current_user.id,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            tax_amount=tax_amount,
            total_amount=total_amount,
            delivery_address=order_in.delivery_address.strip(),
            city=order_in.city.strip(),
            state=order_in.state.strip(),
            pin_code=order_in.pin_code.strip(),
            contact_number=order_in.contact_number.strip(),
            status="PLACED",
            payment_status="PENDING",
            idempotency_key=order_in.idempotency_key
        )
        db.add(new_order)
        db.flush()  # get new_order.id

        for item_data in order_items_to_create:
            order_item = OrderItem(
                order_id=new_order.id,
                food_id=item_data["food_id"],
                food_name_snapshot=item_data["food_name_snapshot"],
                unit_price=item_data["unit_price"],
                quantity=item_data["quantity"],
                line_total=item_data["line_total"]
            )
            db.add(order_item)

        db.commit()
        db.refresh(new_order)
        return new_order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to place order: {str(e)}"
        )

@router.get("", response_model=List[OrderResponse], tags=["Orders"])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse, tags=["Orders"])
def get_order_detail(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{order_id} not found."
        )

    # Ownership check
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view orders placed by other users."
        )

    return order

@router.patch("/{order_id}/status", response_model=OrderResponse, tags=["Orders"])
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{order_id} not found."
        )

    # Only owner or admin can update/cancel
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Cannot update this order."
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
    return order
