import json
import stripe
from fastapi import APIRouter, Request, Header, HTTPException, Depends, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.services.stripe_service import process_successful_payment, process_failed_payment

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/stripe")
async def stripe_webhook_handler(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db)
):
    """
    Stripe Webhook Receiver:
    1. Validates webhook signature using STRIPE_WEBHOOK_SECRET.
    2. Listens for `checkout.session.completed` and `payment_intent.payment_failed`.
    3. Triggers order status update & stock reduction.
    """
    payload = await request.body()

    # If secret is live, verify cryptographic signature
    if settings.STRIPE_WEBHOOK_SECRET and not settings.STRIPE_WEBHOOK_SECRET.startswith("whsec_mock"):
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        # Development / mock parser
        try:
            event = json.loads(payload.decode("utf-8"))
        except Exception:
            raise HTTPException(status_code=400, detail="Could not parse webhook JSON payload")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        session_id = data_object.get("id")
        order_id_str = data_object.get("client_reference_id") or data_object.get("metadata", {}).get("order_id")
        payment_intent_id = data_object.get("payment_intent")

        if order_id_str:
            order_id = int(order_id_str)
            process_successful_payment(
                db=db,
                order_id=order_id,
                session_id=session_id,
                payment_intent_id=payment_intent_id
            )

    elif event_type == "payment_intent.payment_failed":
        order_id_str = data_object.get("metadata", {}).get("order_id")
        if order_id_str:
            process_failed_payment(db=db, order_id=int(order_id_str))

    return {"status": "success", "event_type": event_type}
