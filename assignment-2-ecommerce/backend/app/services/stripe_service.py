"""Stripe is the payment authority; database transitions are transactional and replay safe."""
import datetime
import stripe
from fastapi import HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session
from app.config import settings
from app.models import Order, Product


def require_stripe():
    if not settings.STRIPE_SECRET_KEY.startswith('sk_test_') or 'mock' in settings.STRIPE_SECRET_KEY:
        raise HTTPException(503, 'Configure a Stripe test secret key to enable checkout')
    stripe.api_key = settings.STRIPE_SECRET_KEY
    stripe.max_network_retries = 2


def create_checkout_session(order, items):
    require_stripe()
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'], mode='payment',
            line_items=[{'price_data': {'currency': 'usd',
                'product_data': {'name': item['title']},
                'unit_amount': item['unit_price_cents']}, 'quantity': item['quantity']} for item in items],
            client_reference_id=str(order.id), customer_email=order.customer_email,
            metadata={'order_id': str(order.id)},
            payment_intent_data={'metadata': {'order_id': str(order.id)}},
            success_url=f'{settings.FRONTEND_URL}/checkout/success?order_id={order.id}&session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{settings.FRONTEND_URL}/checkout/cancel?order_id={order.id}',
            expires_at=int(datetime.datetime.now(datetime.timezone.utc).timestamp()) + settings.PAYMENT_SESSION_TTL_MINUTES * 60,
            idempotency_key=f'checkout-{order.id}-{order.created_at.isoformat()}',
        )
        return {'session_id': session.id, 'url': session.url}
    except stripe.StripeError:
        raise HTTPException(502, 'Stripe checkout is unavailable. Please try again.')


def retrieve_session(session_id):
    require_stripe()
    try:
        return stripe.checkout.Session.retrieve(session_id)
    except stripe.StripeError:
        raise HTTPException(502, 'Unable to verify payment with Stripe. Please retry.')


def locked_order(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).populate_existing().with_for_update().first()
    if not order:
        raise HTTPException(404, 'Order not found')
    return order


def validate_session(order, session):
    if (session.get('id') != order.stripe_session_id
            or str(session.get('client_reference_id')) != str(order.id)
            or session.get('amount_total') != order.total_amount_cents
            or session.get('currency') != 'usd'
            or session.get('livemode') is not False):
        raise HTTPException(400, 'Stripe session does not match the order')


def process_successful_payment(db: Session, order_id: int, session):
    order = locked_order(db, order_id)
    validate_session(order, session)
    if session.get('payment_status') != 'paid' or session.get('status') != 'complete':
        raise HTTPException(409, 'Payment has not been completed')
    if order.paid_at:
        return order
    if order.status != 'pending':
        raise HTTPException(409, 'Order is no longer awaiting payment')
    # Stock was reserved during checkout, so successful payment never subtracts it again.
    order.paid_at = datetime.datetime.now(datetime.timezone.utc)
    order.status = 'paid'
    order.payment_error = None
    order.stripe_payment_intent_id = session.get('payment_intent')
    db.commit()
    db.refresh(order)
    return order


def release_reservation(db: Session, order_id: int, status='cancelled'):
    order = locked_order(db, order_id)
    if order.paid_at or order.status != 'pending':
        return order
    for item in sorted(order.items, key=lambda item: item.product_id):
        db.execute(update(Product).where(Product.id == item.product_id).values(
            stock_quantity=Product.stock_quantity + item.quantity))
    order.status = status
    db.commit()
    db.refresh(order)
    return order


def cancel_checkout(db: Session, order_id: int):
    order = locked_order(db, order_id)
    if order.paid_at or order.status != 'pending':
        return order
    session = retrieve_session(order.stripe_session_id)
    validate_session(order, session)
    if session.get('payment_status') == 'paid':
        return process_successful_payment(db, order_id, session)
    if session.get('status') == 'open':
        try:
            session = stripe.checkout.Session.expire(order.stripe_session_id)
        except stripe.StripeError:
            # Completion may have won the race. Never release inventory without proof of expiry.
            session = retrieve_session(order.stripe_session_id)
    if session.get('status') != 'expired':
        raise HTTPException(409, 'Payment is still processing. Check your order history shortly.')
    return release_reservation(db, order_id)
