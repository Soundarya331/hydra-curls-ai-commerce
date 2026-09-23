import stripe
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import Order, StripeEvent
from app.services.stripe_service import (
    process_successful_payment, release_reservation, validate_session, locked_order,
)

router = APIRouter(prefix='/webhooks', tags=['Webhooks'])


@router.post('/stripe')
async def stripe_webhook_handler(request: Request,
    stripe_signature: str = Header(None, alias='Stripe-Signature'),
    db: Session = Depends(get_db)):
    if not settings.STRIPE_WEBHOOK_SECRET or 'mock' in settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(503, 'Stripe webhook is not configured')
    try:
        event = stripe.Webhook.construct_event(
            await request.body(), stripe_signature, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError):
        raise HTTPException(400, 'Invalid Stripe webhook signature or payload')
    if event.get('livemode') is not False:
        raise HTTPException(400, 'Only Stripe test events are supported')
    kind = event['type']
    data = event['data']['object']
    # Persist the provider ID in the same database transaction as the state transition.
    # A savepoint makes concurrent webhook deliveries safe under the unique constraint.
    try:
        with db.begin_nested():
            db.add(StripeEvent(event_id=event['id'], event_type=kind))
            db.flush()
    except IntegrityError:
        return {'status': 'success', 'duplicate': True}
    if kind.startswith('checkout.session.'):
        order = db.query(Order).filter(Order.stripe_session_id == data.get('id')).first()
        if not order:
            # Retry: the webhook can arrive before checkout transaction commits.
            raise HTTPException(503, 'Checkout order is not available yet')
        validate_session(order, data)
        if kind in ('checkout.session.completed', 'checkout.session.async_payment_succeeded'):
            if data.get('payment_status') == 'paid':
                process_successful_payment(db, order.id, data)
        elif kind == 'checkout.session.expired' and data.get('status') == 'expired':
            release_reservation(db, order.id)
        elif kind == 'checkout.session.async_payment_failed':
            release_reservation(db, order.id, 'failed')
    elif kind == 'payment_intent.payment_failed':
        order_id = data.get('metadata', {}).get('order_id', '')
        if str(order_id).isdigit():
            order = locked_order(db, int(order_id))
            if not order.paid_at and order.status == 'pending':
                # Card declines can be retried in the same Checkout Session.
                order.payment_error = 'Payment declined. Retry checkout or cancel the order.'
                db.commit()
    db.commit()
    return {'status': 'success'}
