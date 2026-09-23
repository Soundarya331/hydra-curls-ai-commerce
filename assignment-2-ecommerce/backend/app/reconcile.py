"""Recover reservations after missed expiry webhooks (safe to run repeatedly)."""
from app.database import SessionLocal
from app.models import Order
from app.services.stripe_service import retrieve_session, validate_session, process_successful_payment, release_reservation


def reconcile():
    with SessionLocal() as db:
        ids = [row.id for row in db.query(Order).filter(Order.status == 'pending').all()]
        for order_id in ids:
            try:
                order = db.get(Order, order_id)
                session = retrieve_session(order.stripe_session_id)
                validate_session(order, session)
                if session.get('payment_status') == 'paid':
                    process_successful_payment(db, order_id, session)
                elif session.get('status') == 'expired':
                    release_reservation(db, order_id)
            except Exception:
                db.rollback()
                raise


if __name__ == '__main__':
    reconcile()
