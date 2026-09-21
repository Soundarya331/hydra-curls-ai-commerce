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
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # 1. Seed Users if not present
    admin_user = db.query(User).filter(User.email == "admin@novastore.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@novastore.com",
            full_name="NovaStore Admin",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    demo_customer = db.query(User).filter(User.email == "customer@example.com").first()
    if not demo_customer:
        demo_customer = User(
            email="customer@example.com",
            full_name="Sarah Jenkins",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
            role="customer"
        )
        db.add(demo_customer)
        db.commit()
        db.refresh(demo_customer)

    # 2. Seed Products if empty
    if db.query(Product).count() == 0:
        for p_data in SAMPLE_PRODUCTS:
            product = Product(**p_data)
            db.add(product)
        db.commit()

    # 3. Seed Sample Order for customer if none exists
    if db.query(Order).count() == 0:
        headphones = db.query(Product).filter(Product.title.like("%Headphones%")).first()
        keyboard = db.query(Product).filter(Product.title.like("%Keyboard%")).first()

        sample_order = Order(
            user_id=demo_customer.id,
            total_amount_cents=(headphones.price_cents if headphones else 29999) + (keyboard.price_cents if keyboard else 14900),
            status="paid",
            stripe_session_id="cs_test_seed_order_1",
            stripe_payment_intent_id="pi_test_seed_order_1",
            customer_email=demo_customer.email,
            customer_name=demo_customer.full_name,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add(sample_order)
        db.commit()
        db.refresh(sample_order)

        if headphones:
            db.add(OrderItem(
                order_id=sample_order.id,
                product_id=headphones.id,
                product_title=headphones.title,
                unit_price_cents=headphones.price_cents,
                quantity=1
            ))
        if keyboard:
            db.add(OrderItem(
                order_id=sample_order.id,
                product_id=keyboard.id,
                product_title=keyboard.title,
                unit_price_cents=keyboard.price_cents,
                quantity=1
            ))
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    seed_database(db)
    print("Database seeding completed successfully!")
    db.close()
