# Database Schema

The application requires PostgreSQL in production. SQLAlchemy also supports isolated SQLite tests. Monetary values use integer cents. PostgreSQL constraints prevent negative stock, sub-minimum prices, and non-positive order item quantities.

## Tables

users: id primary key; unique email; name/avatar; role; creation time. Google identity is verified before upsert. Authorization roles are reconciled from ADMIN_EMAILS.

products: id, title, description, category, price_cents, stock_quantity, image_url, is_active, timestamps. Stock cannot be negative; price_cents must be at least 50 USD cents.

orders: id, user_id foreign key, total_amount_cents, status, unique Stripe Checkout session ID, Stripe payment-intent ID, paid_at, payment_error, customer email/name snapshots and timestamps. Amount must be at least 50 cents.

order_items: id, order_id and product_id foreign keys, product-title and unit-price snapshots, positive quantity.

stripe_events: id, unique provider event_id, event_type and received_at. The unique provider ID protects webhook processing from duplicate delivery.

## Checkout and consistency

Checkout aggregates repeated product IDs, creates the order and atomically reserves each item's inventory in one database transaction. Reservation uses a conditional UPDATE requiring an active product and sufficient stock. An unavailable item or Stripe session failure rolls back the complete transaction.

Stripe remains the source of payment truth. A retrieve call or signed webhook validates Checkout Session ID, order reference, amount, currency, test-mode state, completion and paid status. paid_at marks successful fulfilment. Stock is already reserved and never subtracted a second time. Duplicate events and repeat payment calls are idempotent.

Inventory returns only after Stripe confirms that a Checkout Session expired. A retryable card decline keeps the reservation while the Checkout Session remains open. Administrative order transitions cannot set an unpaid order to paid.

Every customer order query is scoped to the signed-in user. Admin queries use a server-assigned role. AI order tools receive the same authenticated identity and cannot look up another customer's records.
