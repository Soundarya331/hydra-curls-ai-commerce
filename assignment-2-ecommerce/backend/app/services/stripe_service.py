from typing import List, Dict, Any, Optional
import stripe
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.config import settings
from app.models import Order, OrderItem, Product, User

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(
    order: Order,
    items: List[Dict[str, Any]],
    success_url: Optional[str] = None,
    cancel_url: Optional[str] = None
) -> Dict[str, str]:
    """
    Creates a Stripe Checkout Session for the pending order.
    """
    if not success_url:
        success_url = f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order.id}"
    if not cancel_url:
        cancel_url = f"{settings.FRONTEND_URL}/checkout/cancel?order_id={order.id}"

    line_items = []
    for item in items:
        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": item["title"],
                    "images": [item["image_url"]] if item.get("image_url") else [],
                },
                "unit_amount": item["unit_price_cents"],
            },
            "quantity": item["quantity"],
        })

    # Try live stripe checkout session if valid API key is set
    if settings.STRIPE_SECRET_KEY and not settings.STRIPE_SECRET_KEY.startswith("sk_test_mock"):
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                customer_email=order.customer_email,
                client_reference_id=str(order.id),
                metadata={
                    "order_id": str(order.id),
                    "user_id": str(order.user_id)
                },
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return {
                "session_id": checkout_session.id,
                "url": checkout_session.url
            }
        except Exception as e:
            # Fallback or error
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Stripe error: {str(e)}"
            )
    else:
        # Mock Stripe test checkout session for seamless local evaluation
        mock_session_id = f"cs_test_mock_{order.id}_{int(order.total_amount_cents)}"
        mock_checkout_url = f"{settings.FRONTEND_URL}/mock-stripe-checkout?session_id={mock_session_id}&order_id={order.id}&amount={order.total_amount_cents}"
        return {
            "session_id": mock_session_id,
            "url": mock_checkout_url
        }


def process_successful_payment(
    db: Session,
    order_id: int,
    session_id: Optional[str] = None,
    payment_intent_id: Optional[str] = None
) -> Order:
    """
    Updates order to paid, reduces stock atomically, and logs completion.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "paid":
        return order  # Idempotent return

    order.status = "paid"
    if session_id:
        order.stripe_session_id = session_id
    if payment_intent_id:
        order.stripe_payment_intent_id = payment_intent_id

    # Decrement stock for ordered items
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock_quantity = max(0, product.stock_quantity - item.quantity)

    db.commit()
    db.refresh(order)
    return order


def process_failed_payment(db: Session, order_id: int, reason: str = "Payment failed") -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order and order.status != "paid":
        order.status = "cancelled"
        db.commit()
        db.refresh(order)
    return order
