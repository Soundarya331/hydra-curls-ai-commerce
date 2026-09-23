from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, User
from app.schemas import OrderResponse, OrderStatusUpdate
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/my-orders", response_model=List[OrderResponse])
def get_customer_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer endpoint: View the authenticated user's own orders.
    Enforces strict tenant isolation: users can NEVER access orders of other users.
    """
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve single order. Verifies ownership: customer must own the order unless admin.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You are not authorized to view this order."
        )
    return order


# Admin routes
admin_orders_router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])

@admin_orders_router.get("", response_model=List[OrderResponse])
def get_all_platform_orders(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint: Retrieve all orders across all customers.
    """
    return db.query(Order).order_by(Order.created_at.desc()).all()


@admin_orders_router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint: Update order status (pending, paid, processing, shipped, cancelled).
    """
    order = db.query(Order).filter(Order.id == order_id).with_for_update().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    allowed = {'paid': {'processing', 'shipped'}, 'processing': {'shipped'}}
    if status_update.status != order.status and status_update.status not in allowed.get(order.status, set()):
        raise HTTPException(409, 'Only paid orders can advance to processing or shipped. Payment state is managed by Stripe.')
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
