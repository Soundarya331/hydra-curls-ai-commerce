from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import AIChatRequest, AIChatResponse
from app.auth import get_optional_current_user
from app.agent.support_agent import run_support_agent

router = APIRouter(prefix="/ai", tags=["AI Support Agent"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_support_agent(
    request: AIChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Support Agent powered by LangChain tools.
    Retrieves real-time product prices, stock, and customer order status directly from the database.
    """
    user_email = current_user.email if current_user else None
    history_dicts = [m.model_dump() for m in (request.conversation_history or [])]

    result = run_support_agent(
        message=request.message,
        db=db,
        conversation_history=history_dicts,
        current_user_email=user_email
    )

    return AIChatResponse(
        response=result["response"],
        tools_called=result.get("tools_called", [])
    )
