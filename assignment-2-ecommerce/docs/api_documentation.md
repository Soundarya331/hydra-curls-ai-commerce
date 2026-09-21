# API Documentation: Mini AI E-Commerce Platform

The API is built with **FastAPI**, featuring automatic OpenAPI 3.0 schema generation, Swagger UI interactive documentation, and Pydantic validation.

* **Base URL**: `http://localhost:8000/api`
* **Interactive Docs (Swagger)**: `http://localhost:8000/docs`
* **Alternative Docs (ReDoc)**: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints

### `POST /api/auth/google`
Authenticates a user via Google OAuth ID Token or demo test mode.

#### Request Body (JSON)
```json
{
  "id_token": "optional_google_jwt_id_token",
  "mock_email": "customer@example.com",
  "mock_name": "Sarah Jenkins",
  "mock_role": "customer"
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "email": "customer@example.com",
    "full_name": "Sarah Jenkins",
    "avatar_url": "https://api.dicebear.com/...",
    "role": "customer",
    "created_at": "2026-09-21T16:15:00Z"
  }
}
```

### `GET /api/auth/me`
Retrieves current authenticated profile. Requires `Authorization: Bearer <token>`.

---

## 2. Product Catalog Endpoints

### `GET /api/products`
Public endpoint to list products with optional filters.

#### Query Parameters
* `category` (string, optional): Filter by category (e.g. `Audio`, `Accessories`).
* `search` (string, optional): Text search matching title or description.
* `in_stock_only` (bool, optional): If `true`, returns items where `stock_quantity > 0`.

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "title": "AeroPro Wireless Noise-Cancelling Headphones",
    "description": "High-fidelity wireless over-ear headphones...",
    "category": "Audio",
    "price_cents": 29999,
    "stock_quantity": 25,
    "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "is_active": true,
    "created_at": "2026-09-21T16:00:00Z",
    "updated_at": "2026-09-21T16:00:00Z"
  }
]
```

### `POST /api/products` *(Admin Only)*
Creates a new product in the catalog. Requires Bearer token with `role: "admin"`. Returns 403 Forbidden for customers.

### `PUT /api/products/{id}` *(Admin Only)*
Updates product attributes or stock levels.

### `DELETE /api/products/{id}` *(Admin Only)*
Soft-deletes the product by setting `is_active = false`.

---

## 3. Orders & Checkout Endpoints

### `POST /api/checkout/create-session`
Validates stock for cart items, creates an order in `pending` state, and initializes a Stripe Checkout Session.

#### Request Body
```json
{
  "items": [
    { "product_id": 1, "quantity": 1 },
    { "product_id": 2, "quantity": 2 }
  ]
}
```

#### Response (200 OK)
```json
{
  "order_id": 3,
  "session_id": "cs_test_mock_3_59799",
  "checkout_url": "http://localhost:5173/mock-stripe-checkout?session_id=cs_test_mock_3_59799...",
  "total_amount_cents": 59799
}
```

### `GET /api/orders/my-orders`
Retrieves authenticated customer's own order history. Enforces strict tenant isolation.

### `GET /api/admin/orders` *(Admin Only)*
Retrieves all orders across all customers on the platform.

### `PATCH /api/admin/orders/{id}/status` *(Admin Only)*
Updates order status (`pending`, `paid`, `processing`, `shipped`, `cancelled`).

---

## 4. Stripe Webhook Endpoint

### `POST /api/webhooks/stripe`
Receives asynchronous event webhooks from Stripe:
* Validates `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`.
* Handles `checkout.session.completed`: updates order to `paid` and atomically decrements inventory stock.
* Handles `payment_intent.payment_failed`: updates order to `cancelled`.

---

## 5. AI Support Agent Endpoint

### `POST /api/ai/chat`
Interacts with the LangChain / LangGraph AI Support Agent with live database tools.

#### Request Body
```json
{
  "message": "What is the price of AeroPro Wireless headphones?",
  "conversation_history": []
}
```

#### Response (200 OK)
```json
{
  "response": "Here is the current live price and stock information from our catalog:\n\n• AeroPro Wireless Noise-Cancelling Headphones: $299.99 (25 units available) [Category: Audio]\n\nLet me know if you would like to add this to your cart or need more details!",
  "tools_called": ["get_product_price"]
}
```
