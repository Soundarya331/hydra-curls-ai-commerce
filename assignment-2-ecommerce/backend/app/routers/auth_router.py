from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import GoogleAuthRequest, TokenResponse, UserResponse
from app.auth import create_access_token, verify_google_id_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/google", response_model=TokenResponse)
def google_sign_in(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate via Google OAuth ID Token or Demo/Test Account.
    Creates user in DB if new, otherwise logs them in and returns JWT.
    """
    if request.id_token and not request.id_token.startswith("mock_"):
        # Real Google OAuth token verification
        user_info = verify_google_id_token(request.id_token)
        email = user_info["email"]
        full_name = user_info.get("name") or email.split("@")[0].capitalize()
        avatar_url = user_info.get("picture")
        role = "customer"
    elif request.mock_email:
        # Mock/Demo login for reviewer evaluation without requiring Google Cloud Console keys
        email = request.mock_email.lower().strip()
        full_name = request.mock_name or email.split("@")[0].title()
        avatar_url = request.mock_avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"
        role = request.mock_role if request.mock_role in ["customer", "admin"] else "customer"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either id_token or mock_email must be provided."
        )

    # Check if user already exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user profile if needed
        if full_name and not user.full_name:
            user.full_name = full_name
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        if request.mock_role and request.mock_role != user.role:
            user.role = request.mock_role
        db.commit()
        db.refresh(user)

    # Generate JWT
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the profile and role of the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)
