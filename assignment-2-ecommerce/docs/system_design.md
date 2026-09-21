# System Design: Mini AI E-Commerce Platform

This document presents the end-to-end architectural system design for the Mini AI E-Commerce application, covering data flows, component relationships, authentication security, payment lifecycle, AI grounding, and AWS deployment.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    Client["Client Browser<br/>(React + TypeScript + Tailwind)"]

    subgraph Authentication["Authentication Flow"]
        GoogleOAuth["Google Identity Services<br/>(OAuth 2.0 / OpenID Connect)"]
    end

    subgraph BackendGateway["FastAPI Gateway & Business Logic"]
        FastAPI["FastAPI Application Server<br/>(ASGI / Uvicorn)"]
        AuthMiddleware["JWT & RBAC Middleware<br/>(Customer vs Admin)"]
        RouterAuth["Auth Router"]
        RouterProd["Product Router"]
        RouterOrder["Order Router"]
        RouterCheckout["Checkout Router"]
        RouterWebhook["Stripe Webhook Router"]
        RouterAI["AI Chat Router"]
    end

    subgraph AIDomain["AI Support Layer"]
        LangChainAgent["LangChain / LangGraph Agent"]
        ToolPrice["Tool: get_product_price"]
        ToolStock["Tool: list_available_products"]
        ToolOrder["Tool: get_order_status"]
    end

    subgraph DataTier["Data Tier"]
        DB[(PostgreSQL / SQLite Database)]
        UsersTable[("Users Table")]
        ProductsTable[("Products Table")]
        OrdersTable[("Orders & Items Table")]
    end

    subgraph ThirdParty["External Services"]
        StripeAPI["Stripe Payments API<br/>(Checkout Sessions)"]
        StripeWebhook["Stripe Webhook Events"]
        LLMProvider["OpenAI / Gemini LLM API"]
    end

    %% Connections
    Client -->|"1. Authenticate with Google ID Token"| GoogleOAuth
    GoogleOAuth -->|"2. Return ID Token"| Client
    Client -->|"3. POST /api/auth/google (Verify & Receive JWT)"| FastAPI
    
    Client -->|"Browse / Cart / Orders (with Bearer JWT)"| FastAPI
    FastAPI --> AuthMiddleware
    AuthMiddleware --> RouterAuth
    AuthMiddleware --> RouterProd
    AuthMiddleware --> RouterOrder
    AuthMiddleware --> RouterCheckout
    AuthMiddleware --> RouterAI

    RouterCheckout -->|"Create Checkout Session"| StripeAPI
    StripeAPI -->|"Redirect to Stripe Hosted Checkout"| Client
    StripeWebhook -->|"checkout.session.completed"| RouterWebhook

    RouterAI --> LangChainAgent
    LangChainAgent <--> LLMProvider
    LangChainAgent --> ToolPrice & ToolStock & ToolOrder

    ToolPrice & ToolStock & ToolOrder --> DB
    RouterProd & RouterOrder & RouterWebhook --> DB

    DB --- UsersTable & ProductsTable & OrdersTable
```

---

## 2. Core Flows & Sequences

### A. Authentication & Session Flow
1. **Frontend Trigger**: User clicks "Sign In with Google" via Google Identity Services button.
2. **Google Authentication**: Google popup authenticates user and returns an asymmetric signed `id_token` (JWT).
3. **Backend Verification**: Frontend transmits `id_token` to `POST /api/auth/google`.
4. **FastAPI Verification**: FastAPI uses `google-auth` to fetch Google's public JWKS keys and verify signature, audience (`GOOGLE_CLIENT_ID`), and expiry.
5. **Database Upsert**: If user email is new, a record is created in `users` with default role `customer`. If existing, profile is updated.
6. **JWT Issuance**: FastAPI issues a signed HMAC-SHA256 JWT containing `sub` (user_id), `email`, and `role`.
7. **Protected API Access**: Client passes `Authorization: Bearer <jwt>` with every request. FastAPI dependency `require_admin` ensures only admins can access administrative routes.

---

### B. Stripe Checkout & Payment Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant Frontend as React Frontend
    participant Backend as FastAPI Backend
    participant DB as Database
    participant Stripe as Stripe API

    Customer->>Frontend: Click "Proceed to Stripe Checkout"
    Frontend->>Backend: POST /api/checkout/create-session (Items, Quantities)
    Backend->>DB: Check Product Stock (Ensure stock_quantity >= requested)
    Backend->>DB: Create Order (Status: 'pending') + OrderItems
    Backend->>Stripe: stripe.checkout.Session.create(...)
    Stripe-->>Backend: Return Checkout Session URL & ID
    Backend-->>Frontend: Return session_id & checkout_url
    Frontend->>Stripe: Redirect user to Stripe hosted checkout page
    Customer->>Stripe: Enter Card details and complete payment
    Stripe->>Backend: POST /api/webhooks/stripe (Event: checkout.session.completed)
    Note over Backend: Verify Stripe Webhook Signature
    Backend->>DB: UPDATE Order SET status='paid'
    Backend->>DB: ATOMIC DECREMENT Product stock_quantity
    Stripe-->>Frontend: Redirect to /checkout/success
    Frontend->>Customer: Display Order Confirmation & Success Modal
```

---

### C. AI Support Agent Tool Calling Flow
```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant UI as Floating AI Chat
    participant Agent as LangChain Agent
    participant Tools as Deterministic Tools
    participant DB as Database

    Customer->>UI: "What is the status of my order #1?"
    UI->>Agent: POST /api/ai/chat (Prompt + Context + JWT)
    Agent->>Tools: Match intent -> invoke get_order_status(order_id=1)
    Tools->>DB: SELECT * FROM orders WHERE id=1
    Note over Tools: Verify customer_email matches JWT (Tenant Isolation)
    DB-->>Tools: Order #1 (Status: PAID, Total: $448.99, Items: 1x Headphones...)
    Tools-->>Agent: Grounded order data string
    Agent-->>UI: Formatted answer with exact status & items
    UI-->>Customer: Render message with tool badge "Tool: get_order_status"
```

---

## 3. Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Role Allowed | Behavior |
|---|---|---|---|
| `/api/products` | GET | Public (Everyone) | View active catalogue |
| `/api/products/{id}` | GET | Public (Everyone) | View single product specs |
| `/api/products` | POST | **Admin Only** | Create product (403 if Customer) |
| `/api/products/{id}` | PUT | **Admin Only** | Edit product details & stock (403 if Customer) |
| `/api/products/{id}` | DELETE | **Admin Only** | Deactivate product (403 if Customer) |
| `/api/orders/my-orders` | GET | **Customer / Admin** | Strict Tenant Isolation: User's own orders |
| `/api/orders/{id}` | GET | **Owner or Admin** | View single order |
| `/api/admin/orders` | GET | **Admin Only** | View orders across all customers |
| `/api/admin/orders/{id}/status`| PATCH | **Admin Only** | Update shipment/delivery status |
| `/api/checkout/create-session`| POST | Authenticated User | Validate stock & create pending order |
| `/api/webhooks/stripe` | POST | Stripe Webhook Server | Verify signature & finalize order |
| `/api/ai/chat` | POST | Public / Authenticated | Grounded AI queries with user tenant guard |

---

## 4. Production AWS Deployment Approach

```mermaid
flowchart LR
    Route53["AWS Route 53<br/>DNS & SSL"] --> CloudFront["AWS CloudFront<br/>CDN & Edge Cache"]
    CloudFront -->|"Static Assets (HTML/JS/CSS)"| S3["AWS S3 Bucket<br/>(Frontend SPA)"]
    CloudFront -->|"/api/*"| ALB["Application Load Balancer (ALB)"]
    
    ALB --> ECSCluster["ECS Fargate Cluster<br/>(FastAPI Container Tasks)"]
    
    subgraph VPC["AWS VPC (Private Subnets)"]
        ECSCluster
        RDS["Amazon RDS PostgreSQL<br/>(Multi-AZ Master + Replica)"]
        ElastiCache["ElastiCache Redis<br/>(Session Cache & Rate Limit)"]
        Secrets["AWS Secrets Manager<br/>(Stripe & JWT Keys)"]
    end
    
    ECSCluster --> RDS
    ECSCluster --> ElastiCache
    ECSCluster --> Secrets
```

* **Frontend**: Built as static bundle and distributed via **Amazon S3** fronted by **AWS CloudFront** edge network for sub-30ms global latency.
* **Backend**: Dockerized FastAPI container running on **AWS ECS Fargate** with auto-scaling based on CPU/Request count.
* **Database**: **Amazon RDS PostgreSQL** (Multi-AZ with automated backups and read replica).
* **Cache & Rate Limiting**: **Amazon ElastiCache (Redis)** for LLM semantic query caching and API rate limiting.
* **Secrets Management**: **AWS Secrets Manager** for secure injection of Stripe and Google client credentials into task containers.
