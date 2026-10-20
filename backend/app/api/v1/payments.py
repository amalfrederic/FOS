from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from app.db.session import get_db
from app.models.user import User
from app.models.order import Order
from app.schemas.payment import PaymentMockRequest, PaymentMockResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/mock", response_model=PaymentMockResponse, tags=["Payments"])
def process_mock_payment(
    payment_in: PaymentMockRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == payment_in.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order #{payment_in.order_id} not found."
        )

    # Ownership check
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot pay for another user's order."
        )

    if order.payment_status == "PAID":
        return PaymentMockResponse(
            success=True,
            message="Order is already paid.",
            transaction_id="ALREADY_PAID",
            order_id=order.id,
            payment_status=order.payment_status,
            order_status=order.status
        )

    if order.status == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot process payment for a cancelled order."
        )

    if payment_in.simulate_failure:
        order.payment_status = "FAILED"
        db.commit()
        db.refresh(order)
        return PaymentMockResponse(
            success=False,
            message="Payment simulation failed: Card/UPI transaction was declined.",
            transaction_id=None,
            order_id=order.id,
            payment_status=order.payment_status,
            order_status=order.status
        )

    # Successful payment simulation
    txn_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"
    order.payment_status = "PAID"
    if order.status == "PLACED":
        order.status = "CONFIRMED"
    
    db.commit()
    db.refresh(order)

    return PaymentMockResponse(
        success=True,
        message=f"Payment of ₹{float(order.total_amount):.2f} processed successfully via {payment_in.payment_method}.",
        transaction_id=txn_id,
        order_id=order.id,
        payment_status=order.payment_status,
        order_status=order.status
    )
