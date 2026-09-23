from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import GoogleAuthRequest, TokenResponse, UserResponse
from app.auth import create_access_token, verify_google_id_token, get_current_user
from app.config import settings

router = APIRouter(prefix='/auth', tags=['Authentication'])


@router.get('/config')
def auth_config():
    return {'google_client_id': settings.GOOGLE_CLIENT_ID}


@router.post('/google', response_model=TokenResponse)
def google_sign_in(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    info = verify_google_id_token(request.id_token)
    email = info['email'].strip().lower()
    admins = {value.strip().lower() for value in settings.ADMIN_EMAILS.split(',') if value.strip()}
    role = 'admin' if email in admins else 'customer'
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, role=role)
        db.add(user)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            user = db.query(User).filter(User.email == email).one()
    user.full_name = info.get('name') or email.split('@')[0]
    user.avatar_url = info.get('picture')
    user.role = role
    db.commit()
    db.refresh(user)
    token = create_access_token({'sub': str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get('/me', response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
