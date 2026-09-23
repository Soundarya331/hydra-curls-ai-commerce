from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import text, inspect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.seed_data import seed_database

# Routers
from app.routers.auth_router import router as auth_router
from app.routers.products_router import router as products_router
from app.routers.orders_router import router as orders_router, admin_orders_router
from app.routers.checkout_router import router as checkout_router
from app.routers.webhooks_router import router as webhooks_router
from app.routers.ai_router import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial catalogue
    Base.metadata.create_all(bind=engine)
    # Additive migration for deployments that already have the original orders table.
    with engine.begin() as connection:
        order_columns = {column['name'] for column in inspect(connection).get_columns('orders')}
        if 'paid_at' not in order_columns:
            connection.execute(text('ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP NULL'))
        if 'payment_error' not in order_columns:
            connection.execute(text('ALTER TABLE orders ADD COLUMN payment_error VARCHAR(255) NULL'))
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Full-stack AI-powered e-commerce backend with Google Auth, Stripe payments, RBAC, and LangChain AI agent.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(admin_orders_router, prefix=settings.API_V1_STR)
app.include_router(checkout_router, prefix=settings.API_V1_STR)
app.include_router(webhooks_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text('SELECT 1'))
    except Exception:
        raise HTTPException(503, 'Database unavailable')
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected"
    }

# The Render Docker image includes the frontend, keeping login and checkout on one origin.
frontend_dist = Path(__file__).resolve().parents[2] / 'frontend' / 'dist'
if frontend_dist.is_dir():
    app.mount('/assets', StaticFiles(directory=frontend_dist / 'assets'), name='assets')

    @app.get('/')
    @app.get('/checkout/success')
    @app.get('/checkout/cancel')
    def storefront():
        return FileResponse(frontend_dist / 'index.html')
else:
    @app.get('/')
    def root():
        return {'message': settings.PROJECT_NAME, 'docs': '/docs'}
