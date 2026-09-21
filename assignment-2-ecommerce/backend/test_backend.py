from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    print("[OK] Health check passed:", res.json())

def test_auth_and_roles():
    # 1. Login as customer
    res = client.post("/api/auth/google", json={"mock_email": "customer@example.com", "mock_role": "customer"})
    assert res.status_code == 200
    customer_token = res.json()["access_token"]
    assert res.json()["user"]["role"] == "customer"
    print("[OK] Customer Auth passed")

    # 2. Login as admin
    res = client.post("/api/auth/google", json={"mock_email": "admin@novastore.com", "mock_role": "admin"})
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    assert res.json()["user"]["role"] == "admin"
    print("[OK] Admin Auth passed")

    # 3. RBAC check: Customer cannot create product
    res = client.post(
        "/api/products",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "title": "Unauthorized Product",
            "description": "Should fail",
            "category": "Test",
            "price_cents": 1000,
            "stock_quantity": 5
        }
    )
    assert res.status_code == 403
    print("[OK] RBAC enforcement passed (Customer blocked from admin product creation)")

    # 4. Admin can view all orders
    res = client.get("/api/admin/orders", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    print("[OK] Admin order access passed, order count:", len(res.json()))

def test_ai_support_agent():
    # Test price inquiry
    res = client.post("/api/ai/chat", json={"message": "What is the price of AeroPro Wireless headphones?"})
    assert res.status_code == 200
    data = res.json()
    assert "get_product_price" in data["tools_called"]
    assert "299.99" in data["response"]
    print("[OK] AI Agent price inquiry verified:", data["tools_called"])

    # Test availability inquiry
    res = client.post("/api/ai/chat", json={"message": "What products are available?"})
    assert res.status_code == 200
    data = res.json()
    assert "list_available_products" in data["tools_called"]
    print("[OK] AI Agent availability inquiry verified:", data["tools_called"])

    # Test order inquiry
    res = client.post("/api/ai/chat", json={"message": "What is the status of my order #1?"})
    assert res.status_code == 200
    data = res.json()
    assert "get_order_status" in data["tools_called"]
    print("[OK] AI Agent order status inquiry verified:", data["tools_called"])

def test_checkout_and_inventory():
    # Get products
    products = client.get("/api/products").json()
    target_product = products[0]
    initial_stock = target_product["stock_quantity"]

    # Customer login
    res = client.post("/api/auth/google", json={"mock_email": "customer@example.com"})
    token = res.json()["access_token"]

    # Create checkout session
    checkout_res = client.post(
        "/api/checkout/create-session",
        headers={"Authorization": f"Bearer {token}"},
        json={"items": [{"product_id": target_product["id"], "quantity": 2}]}
    )
    assert checkout_res.status_code == 200
    order_id = checkout_res.json()["order_id"]
    print("[OK] Checkout session created. Order ID:", order_id)

    # Confirm payment (simulating Stripe completion)
    confirm_res = client.post(
        f"/api/checkout/confirm-payment/{order_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "paid"
    print("[OK] Payment confirmation processed.")

    # Verify inventory was atomically decremented
    updated_product = client.get(f"/api/products/{target_product['id']}").json()
    assert updated_product["stock_quantity"] == initial_stock - 2
    print(f"[OK] Inventory stock decrement verified: {initial_stock} -> {updated_product['stock_quantity']}")

if __name__ == "__main__":
    test_health()
    test_auth_and_roles()
    test_ai_support_agent()
    test_checkout_and_inventory()
    print("\nALL BACKEND TESTS PASSED WITH 100% SUCCESS!")
