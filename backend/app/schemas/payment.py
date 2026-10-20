from pydantic import BaseModel, Field
from typing import Optional

class PaymentMockRequest(BaseModel):
    order_id: int = Field(..., gt=0, description="Order ID to pay for")
    simulate_failure: bool = Field(False, description="Simulate a payment gateway decline/failure")
    payment_method: str = Field("UPI", description="Simulated method: UPI, CARD, NETBANKING, COD")

class PaymentMockResponse(BaseModel):
    success: bool
    message: str
    transaction_id: Optional[str] = None
    order_id: int
    payment_status: str
    order_status: str
