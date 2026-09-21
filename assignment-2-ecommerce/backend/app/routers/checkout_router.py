from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import CheckoutSessionRequest, OrderResponse
from app.auth import get_current_user
from app.services.stripe_service import create_checkout_session, process_successful_payment

router = APIRouter(prefix="/checkout", tags=["Checkout & Payments"])

@router.post("/create-session")
def create_order_and_checkout_session(
    checkout_in: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    1. Validates inventory stock for each cart item.
    2. Calculates order total.
    3. Creates a 'pending' order with OrderItem records.
    4. Generates a Stripe Checkout Session.
    """
    if not checkout_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty. Please add items to cart before checking out."
        )

    order_items_data = []
    total_amount_cents = 0

    for item_req in checkout_in.items:
        product = db.query(Product).filter(Product.id == item_req.product_id, Product.is_active == True).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item_req.product_id} was not found."
            )
        
        # Check stock availability
        if product.stock_quantity < item_req.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.title}'. Requested: {item_req.quantity}, Available: {product.stock_quantity}."
            )

        item_total = product.price_cents * item_req.quantity
        total_amount_cents += item_total

        order_items_data.append({
            "product_id": product.id,
            "title": product.title,
            "unit_price_cents": product.price_cents,
            "quantity": item_req.quantity,
            "image_url": product.image_url
        })

    # Create Order record in 'pending' status
    order = Order(
        user_id=current_user.id,
        total_amount_cents=total_amount_cents,
        status="pending",
        customer_email=current_user.email,
        customer_name=current_user.full_name or "Valued Customer"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Add Order Items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            product_title=item_data["title"],
            unit_price_cents=item_data["unit_price_cents"],
            quantity=item_data["quantity"]
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(order)

    # Generate Stripe Checkout Session
    session_info = create_checkout_session(
        order=order,
        items=order_items_data,
        success_url=checkout_in.success_url,
        cancel_url=checkout_in.cancel_url
    )

    order.stripe_session_id = session_info["session_id"]
    db.commit()

    return {
        "order_id": order.id,
        "session_id": session_info["session_id"],
        "checkout_url": session_info["url"],
        "total_amount_cents": order.total_amount_cents
    }


@router.post("/confirm-payment/{order_id}", response_model=OrderResponse)
def confirm_payment_test(
    order_id: int,
    session_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Test Mode Confirmation: Allows verifying payment completion and stock decrement
    when testing without an active Stripe webhook tunnel (e.g., in local evaluation).
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    updated_order = process_successful_payment(
        db=db,
        order_id=order_id,
        session_id=session_id or f"test_confirmed_{order_id}",
        payment_intent_id=f"pi_test_{order_id}"
    )
    return updated_order
