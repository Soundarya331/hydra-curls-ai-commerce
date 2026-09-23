from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import CheckoutSessionRequest, OrderResponse
from app.auth import get_current_user
from app.services.stripe_service import (
    create_checkout_session, process_successful_payment, retrieve_session,
    cancel_checkout, require_stripe,
)

router = APIRouter(prefix='/checkout', tags=['Checkout & Payments'])


@router.post('/create-session')
def create_order_and_checkout_session(
    checkout_in: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_stripe()
    quantities = Counter()
    for item in checkout_in.items:
        quantities[item.product_id] += item.quantity
    try:
        # Temporary valid minimum satisfies the database constraint inside this
        # uncommitted transaction; replace with the computed cart total below.
        order = Order(user_id=current_user.id, total_amount_cents=50, status='pending',
                      customer_email=current_user.email, customer_name=current_user.full_name)
        db.add(order)
        db.flush()
        stripe_items = []
        total_amount_cents = 0
        for product_id, quantity in sorted(quantities.items()):
            if quantity > 100:
                raise HTTPException(400, 'Maximum quantity per product is 100')
            # Conditional UPDATE takes a database row lock and prevents overselling.
            result = db.execute(update(Product).where(
                Product.id == product_id, Product.is_active.is_(True),
                Product.stock_quantity >= quantity,
            ).values(stock_quantity=Product.stock_quantity - quantity))
            if result.rowcount != 1:
                raise HTTPException(409, 'A product is unavailable or has insufficient stock')
            product = db.query(Product).filter(Product.id == product_id).one()
            db.add(OrderItem(order_id=order.id, product_id=product.id,
                            product_title=product.title, unit_price_cents=product.price_cents,
                            quantity=quantity))
            total_amount_cents += product.price_cents * quantity
            stripe_items.append({'title': product.title, 'unit_price_cents': product.price_cents,
                                 'quantity': quantity})
        order.total_amount_cents = total_amount_cents
        session = create_checkout_session(order, stripe_items)
        order.stripe_session_id = session['session_id']
        db.commit()
        return {'order_id': order.id, 'session_id': session['session_id'],
                'checkout_url': session['url'], 'total_amount_cents': order.total_amount_cents}
    except Exception:
        db.rollback()
        raise


def owned_order(db, order_id, user):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    return order


@router.post('/confirm-payment/{order_id}', response_model=OrderResponse)
def confirm_payment(order_id: int, session_id: str,
                    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = owned_order(db, order_id, current_user)
    if session_id != order.stripe_session_id:
        raise HTTPException(400, 'Incorrect checkout session')
    session = retrieve_session(session_id)
    return process_successful_payment(db, order_id, session)


@router.post('/cancel/{order_id}', response_model=OrderResponse)
def cancel_payment(order_id: int, current_user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    owned_order(db, order_id, current_user)
    return cancel_checkout(db, order_id)
