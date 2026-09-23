import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "customer"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Google Auth
class GoogleAuthRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id_token: str = Field(min_length=1, max_length=10000)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Product Schemas
class ProductBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str
    category: str
    price_cents: int = Field(..., ge=50, description="Price in USD cents; minimum 50")
    stock_quantity: int = Field(..., ge=0)
    image_url: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_cents: Optional[int] = Field(None, ge=50)
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# Order Schemas
class CartItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1, le=100)

class CheckoutSessionRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    items: List[CartItemRequest] = Field(min_length=1, max_length=100)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_title: str
    unit_price_cents: int
    quantity: int

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount_cents: int
    status: str
    stripe_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    customer_email: str
    customer_name: Optional[str] = None
    created_at: datetime.datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|paid|processing|shipped|cancelled)$")

# AI Chat Schemas
class ChatMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str = Field(max_length=4000)

class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_history: List[ChatMessage] = Field(default_factory=list, max_length=12)

class AIChatResponse(BaseModel):
    response: str
    tools_called: Optional[List[str]] = []
    mode: str = 'basic'
