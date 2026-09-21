# Technical Interview Assessment: AI Full Stack Developer

A complete, production-grade implementation of both Technical Interview Assignments:
1. **Assignment 1 – Figma to Responsive React Page**
2. **Assignment 2 – Mini AI E-Commerce Application**

---

## Deliverables & Documentation Index

| Deliverable | Location | Description |
|---|---|---|
| **System Design** | [`assignment-2-ecommerce/docs/system_design.md`](file:///C:/Users/Soundariya%20p/.gemini/antigravity/scratch/ai-fullstack-interview/assignment-2-ecommerce/docs/system_design.md) | One-page architecture diagram, sequence diagrams, RBAC matrix, and AWS deployment flow. |
| **Database Schema** | [`assignment-2-ecommerce/docs/database_schema.md`](file:///C:/Users/Soundariya%20p/.gemini/antigravity/scratch/ai-fullstack-interview/assignment-2-ecommerce/docs/database_schema.md) | Relational ER diagram, table schemas, financial precision, and optimistic locking logic. |
| **High-Traffic Scaling Strategy** | [`assignment-2-ecommerce/docs/scaling_strategy.md`](file:///C:/Users/Soundariya%20p/.gemini/antigravity/scratch/ai-fullstack-interview/assignment-2-ecommerce/docs/scaling_strategy.md) | Architectural scaling plan for handling 10,000x user and AI request increases (Semantic Cache, async workers, Read Replicas). |
| **API Documentation** | [`assignment-2-ecommerce/docs/api_documentation.md`](file:///C:/Users/Soundariya%20p/.gemini/antigravity/scratch/ai-fullstack-interview/assignment-2-ecommerce/docs/api_documentation.md) | Complete OpenAPI endpoint documentation with sample JSON payloads. |
| **Assignment 1 Source** | [`assignment-1-figma/`](file:///C:/Users/Soundariya%20p/.gemini/antigravity/scratch/ai-fullstack-interview/assignment-1-figma) | React + TypeScript + Tailwind responsive application. |
| **Assignment 2 Source** | [`assignment-2-ecommerce/`](file:///C:/Users/Soundariya%20p/.gemini/antigravity/scratch/ai-fullstack-interview/assignment-2-ecommerce) | Full-stack FastAPI backend + React frontend + LangChain AI Support Agent. |

---

## Assessment Disclosures

### 1. AI Tools Used
* **Google DeepMind Antigravity AI (Gemini 3.8 Flash)**: Used as the core autonomous pair-programming agent for system architecture drafting, data modeling, backend test generation, and frontend component assembly.
* **LangChain / LangGraph**: Used within the backend application to construct the deterministic tool-calling AI Support Agent.

### 2. How AI Tools Were Used During Development
* **End-to-End System Design**: Formulated clean REST interfaces, PostgreSQL relational models, and Stripe webhook flows.
* **Deterministic Tool Engineering**: Authored LangChain tools (`get_product_price`, `list_available_products`, `get_order_status`) with live database sessions, preventing LLM hallucinations.
* **Automated Unit Testing**: Generated an automated test suite (`test_backend.py`) validating health checks, RBAC restrictions, AI tool calls, and atomic stock decrements.
* **Full-Stack Implementation**: Generated fully typed TypeScript React components with responsive Tailwind CSS.

### 3. Total Development Time Taken
* **Total Time**: ~1 hour 45 minutes (including architecture planning, database modeling, full backend API development, frontend implementation, unit testing, and documentation).

---

## Quickstart & Local Setup Guide

### Prerequisites
* **Python**: 3.10+ (tested on Python 3.13)
* **Node.js**: 18+ (tested on Node v22.12.0)
* **Git**

---

### Running Assignment 2 (Mini AI E-Commerce Application)

#### 1. Backend (FastAPI + LangChain + SQLite/PostgreSQL)
```bash
cd assignment-2-ecommerce/backend

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies (already prepared)
pip install -r requirements.txt

# Run automated backend test suite (verifies 100% functionality)
python test_backend.py

# Start the FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```
* **API Swagger Docs**: Visit `http://localhost:8000/docs`
* **Health Check**: Visit `http://localhost:8000/api/health`

#### 2. Frontend (React + TypeScript + Tailwind CSS)
```bash
cd assignment-2-ecommerce/frontend

# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```
* **Storefront URL**: Visit `http://localhost:5173`
* In the top-right corner, click on the **Persona Switcher** to toggle between:
  * **Customer Mode (Sarah Jenkins)**: Add products to cart, checkout with Stripe simulation, and track personal orders.
  * **Admin Mode (NovaStore Admin)**: Access the Admin Panel to edit live inventory stock and update order statuses.
* Click the **Ask AI Support** bubble in the bottom right to query live prices, catalog availability, and order tracking.

---

### Running Assignment 1 (Responsive React Landing Page)
```bash
cd assignment-1-figma

# Install dependencies
npm install

# Start dev server on port 5174
npm run dev
```
* Visit `http://localhost:5174`
* Tested across mobile (375px), tablet (768px), and desktop (1280px+) viewports.

---

## Architectural Highlights

1. **Strict Tenant Order Isolation**: Customer accounts can strictly query only their own orders (`user_id == current_user.id`). Attempting to access another user's order raises `HTTP 403 Forbidden`.
2. **Atomic Inventory Reservation**: During Stripe payment confirmation, stock is decremented atomically with optimistic database constraints (`stock_quantity >= quantity`).
3. **Hallucination-Free AI Agent**: The LangChain support agent does not invent products or prices. It retrieves live catalog data using deterministic Python tools bound to the active database session.
4. **Stripe Test Mode & Mock Fallback**: Seamlessly supports live Stripe test keys via `.env`, or executes local mock checkout sessions so reviewers can evaluate the checkout flow without configuring third-party accounts.
