# NovaStore — mini AI e-commerce

React, TypeScript, Tailwind and shadcn/ui storefront backed by FastAPI, PostgreSQL, Google Identity Services, Stripe Checkout, and a LangChain product support assistant.

## Run locally

Prerequisites: Python 3.11+, Node 20.19+ (or 22.12+), PostgreSQL 15+.

1. Create a PostgreSQL database named `novastore`. Copy `backend/.env.example` to `backend/.env`; set a fresh random `SECRET_KEY` and `DATABASE_URL`.
2. In `assignment-2-ecommerce/backend`:

   ```powershell
   py -3.13 -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

   FastAPI docs: http://localhost:8000/docs. At startup the API creates the schema, applies its additive order-field migration, and seeds only the product catalog.
3. In another terminal, `cd assignment-2-ecommerce/frontend`, then run `npm ci` and `npm run dev`. Open http://localhost:5173.

Catalog browsing and basic database-backed product help work without provider credentials. Google login and Stripe checkout require real provider test credentials. Without an OpenAI key, support uses labelled basic database-backed routing.

## Provider configuration

- **Google Sign-In:** Create an OAuth 2.0 Web client in Google Cloud Console. Add `http://localhost:5173` or your deployed origin under authorized JavaScript origins. Set `GOOGLE_CLIENT_ID`. Set `ADMIN_EMAILS` to the comma-separated email allowlist for administrators; all other verified users receive customer roles. The browser posts Google ID tokens to FastAPI for server-side signature, audience, expiry and verified-email checks.
- **Stripe test checkout:** Add a Stripe test-mode `sk_test_` key as `STRIPE_SECRET_KEY`. Register the webhook at `/api/webhooks/stripe` for checkout completed, expired, async success/failure, and payment-intent failure events; add its signing secret as `STRIPE_WEBHOOK_SECRET`. The application never fakes a successful payment.
- **AI support:** Create an OpenAI API key and set `OPENAI_API_KEY` on the server; keep it out of browser bundles. The default `OPENAI_MODEL` is `gpt-4o-mini`. The LangChain tools retrieve current catalog/order facts; order tools only see orders owned by the authenticated account. [OpenAI key setup](https://developers.openai.com/api/docs/quickstart).

## Free Render demo

1. Push this repository to GitHub. In Render, choose **New → Blueprint** and select the repository. Set the Blueprint file path to `assignment-2-ecommerce/render.yaml`. Render creates a PostgreSQL database and Docker web service in Singapore.
2. In the service settings, enter your Google client ID, `ADMIN_EMAILS`, Stripe test key and webhook secret. Render provides the service's HTTPS URL to the app automatically. Add `OPENAI_API_KEY` if you want LLM support. Never commit `.env` or provider secrets.
3. Add the Render HTTPS origin to the Google OAuth client. Register `https://YOUR-HOST.onrender.com/api/webhooks/stripe` in Stripe test-mode webhooks and save the generated signing secret to Render.

Free Render web services spin down after idle time and can take around a minute to wake. Free PostgreSQL expires after 30 days, so keep this database for the demo only. See [Render's current free-service limits](https://render.com/docs/free).

## Payment and security behavior

- JWTs contain only a user ID; every request reloads the account and role from PostgreSQL. Only server-configured `ADMIN_EMAILS` grant admin access.
- Customer order APIs and the AI order tool enforce account ownership. Invalid bearer tokens are rejected.
- Checkout aggregates duplicate cart rows and reserves inventory with conditional database updates in the same transaction as order creation. Stripe session failures roll the transaction back.
- Confirmations require a Stripe retrieve or verified webhook with matching session ID, order, amount, currency and test-mode state. The session must be completed and paid. Verified event IDs are unique and payment fulfilment is idempotent.
- Inventory is released only after Stripe confirms session expiry. A decline can be retried within the active Checkout Session. Admins cannot change an unpaid order to paid.

## Verify

From `backend`, run `python -m pytest -q`. Tests run with isolated SQLite by default; set `TEST_DATABASE_URL` to PostgreSQL to run the concurrent last-item oversell test as well. Frontend production build: `cd frontend; npm ci; npm run build`.

Submit your actual final development time in the assignment README. AI tools used: OpenAI Codex for review, implementation and testing. The assignment materials supplied no Figma URL for this storefront and no provider credentials or deployed URL.
