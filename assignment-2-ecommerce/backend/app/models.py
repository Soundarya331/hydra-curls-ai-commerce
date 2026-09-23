import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    role = Column(String(50), default="customer", nullable=False)  # 'customer' or 'admin'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (CheckConstraint('stock_quantity >= 0'), CheckConstraint('price_cents >= 50'))

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    price_cents = Column(Integer, nullable=False)  # stored in cents (e.g. $49.99 -> 4999)
    stock_quantity = Column(Integer, default=0, nullable=False)
    image_url = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (CheckConstraint('total_amount_cents >= 50'),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    total_amount_cents = Column(Integer, nullable=False)
    status = Column(String(50), default="pending", nullable=False, index=True)  # pending, paid, failed, cancelled, shipped
    stripe_session_id = Column(String(255), unique=True, index=True, nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    payment_error = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (CheckConstraint('quantity > 0'),)

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    product_title = Column(String(255), nullable=False)
    unit_price_cents = Column(Integer, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class StripeEvent(Base):
    """Stripe event IDs are unique for provider replay protection."""
    __tablename__ = 'stripe_events'
    id = Column(Integer, primary_key=True)
    event_id = Column(String(255), unique=True, nullable=False, index=True)
    event_type = Column(String(120), nullable=False)
    received_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
