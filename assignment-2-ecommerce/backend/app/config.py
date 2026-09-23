import secrets
import os
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    PROJECT_NAME: str = 'NovaStore'
    API_V1_STR: str = '/api'
    ENVIRONMENT: str = 'development'
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(48), min_length=32)
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = 'postgresql+psycopg://novastore:novastore_local@localhost:5434/novastore'
    GOOGLE_CLIENT_ID: str = ''
    ADMIN_EMAILS: str = ''
    STRIPE_SECRET_KEY: str = ''
    STRIPE_WEBHOOK_SECRET: str = ''
    FRONTEND_URL: str = Field(default_factory=lambda: os.getenv('RENDER_EXTERNAL_URL', 'http://localhost:5173'))
    OPENAI_API_KEY: str = ''
    OPENAI_MODEL: str = 'gpt-4o-mini'
    PAYMENT_SESSION_TTL_MINUTES: int = 30

    @model_validator(mode='after')
    def production_settings(self):
        if self.DATABASE_URL.startswith('postgres://'):
            self.DATABASE_URL = self.DATABASE_URL.replace('postgres://', 'postgresql+psycopg://', 1)
        elif self.DATABASE_URL.startswith('postgresql://'):
            self.DATABASE_URL = self.DATABASE_URL.replace('postgresql://', 'postgresql+psycopg://', 1)
        if self.ENVIRONMENT == 'production':
            if 'SECRET_KEY' not in self.model_fields_set:
                raise ValueError('Set a persistent SECRET_KEY for production')
            if not self.FRONTEND_URL.startswith('https://'):
                raise ValueError('Production FRONTEND_URL must use HTTPS')
            if not self.DATABASE_URL.startswith('postgresql'):
                raise ValueError('Production requires PostgreSQL')
        return self


settings = Settings()
