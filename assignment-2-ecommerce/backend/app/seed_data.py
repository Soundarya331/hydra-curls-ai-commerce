from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models import User, Product, Order, OrderItem
import datetime

SAMPLE_PRODUCTS = [
    {
        "title": "AeroPro Wireless Noise-Cancelling Headphones",
        "description": "High-fidelity wireless over-ear headphones with active noise cancellation, 40-hour battery life, and spatial audio.",
        "category": "Audio",
        "price_cents": 29999,  # $299.99
        "stock_quantity": 25,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "Quantum Mechanical Keyboard RGB",
        "description": "Customizable hot-swappable mechanical keyboard with lubricated linear switches, PBT keycaps, and RGB per-key lighting.",
        "category": "Accessories",
        "price_cents": 14900,  # $149.00
        "stock_quantity": 18,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "UltraVision 4K OLED Monitor 27-inch",
        "description": "True black OLED panel with 144Hz refresh rate, 0.03ms response time, 99% DCI-P3 color accuracy, and Thunderbolt 4 connectivity.",
        "category": "Displays",
        "price_cents": 79999,  # $799.99
        "stock_quantity": 8,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "Zenith Ergonomic Wireless Mouse",
        "description": "Vertical ergonomic mouse sculpted for all-day comfort, silent clicking, Bluetooth multi-device pairing, and USB-C fast charging.",
        "category": "Accessories",
        "price_cents": 7999,  # $79.99
        "stock_quantity": 40,
        "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "PulseSmart Fitness Watch Pro",
        "description": "Advanced health tracker with ECG, blood oxygen, sleep coaching, dual-frequency GPS, and 7-day battery life in a titanium case.",
        "category": "Wearables",
        "price_cents": 24999,  # $249.99
        "stock_quantity": 30,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "NovaPower 100W GaN Fast Charger",
        "description": "Compact 4-port Gallium Nitride wall charger with 3x USB-C and 1x USB-A ports capable of fast-charging laptops and phones simultaneously.",
        "category": "Accessories",
        "price_cents": 4999,  # $49.99
        "stock_quantity": 55,
        "image_url": "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80"
    }
]

def seed_database(db: Session):
    # Seed only the catalog. Identity and orders must come from real customer flows.
    if db.query(Product).count() == 0:
        db.add_all([Product(**data) for data in SAMPLE_PRODUCTS])
        db.commit()
