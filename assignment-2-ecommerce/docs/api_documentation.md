# API Documentation: NovaStore

FastAPI OpenAPI docs: /docs. Base API path: /api.

## Authentication

GET /api/auth/config returns the configured Google Web Client ID for the browser button.

POST /api/auth/google accepts a JSON body with id_token from Google Identity Services. FastAPI verifies signature, audience, expiry and verified email. All users default to customer. Admin role is assigned only when their verified email appears in server-side ADMIN_EMAILS. No client role is accepted.

GET /api/auth/me requires a bearer JWT. JWT contains only the user ID; account role is loaded from the database.

## Catalog

GET /api/products supports category, search and in_stock_only filters. GET /api/products/{id} reads one active product.

Admin bearer token is required for POST /api/products, PUT /api/products/{id} and DELETE /api/products/{id}. Delete is a soft delete.

## Checkout and orders

POST /api/checkout/create-session requires a bearer token and a non-empty list of product_id and quantity. It aggregates duplicate product lines, reserves stock with a conditional database update, creates the pending order, and opens Stripe Checkout. Any failure rolls back the reservation. It returns order_id, Stripe session_id, checkout_url and total_amount_cents.

POST /api/checkout/confirm-payment/{order_id}?session_id=... requires the owning customer. FastAPI retrieves the session from Stripe and verifies its order, session ID, amount, currency, test mode, complete status and paid status before marking it paid.

POST /api/checkout/cancel/{order_id} requires the owner and releases stock only after Stripe confirms that the Checkout Session has expired.

GET /api/orders/my-orders returns the signed-in user's orders. GET /api/orders/{id} allows the owner or an admin. GET /api/admin/orders and PATCH /api/admin/orders/{id}/status are admin-only. Admin status transitions cannot forge payment.

## Stripe webhook

POST /api/webhooks/stripe requires Stripe-Signature verified with STRIPE_WEBHOOK_SECRET and accepts test events only. Session, order, amount and currency are checked. Unique event IDs make retries idempotent. Successful payment does not decrement already reserved stock; expired sessions release it. A failed card payment may still be retried in the same open session.

## AI support

POST /api/ai/chat accepts a message and up to 12 user/assistant history messages. Product facts come from database tools. Order status requests require an authenticated token and tools query only that account's orders. Invalid bearer tokens are rejected.

The response contains response, tools_called and mode. mode is llm when configured LangChain/OpenAI tool calling succeeds, or basic when database-backed deterministic routing is active without an OpenAI key.
