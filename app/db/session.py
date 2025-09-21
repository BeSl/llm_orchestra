# app/db/session.py
# Настройка сессии SQLAlchemy

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Async engine and session
async_engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

# Sync engine for Alembic
sync_database_url = settings.DATABASE_URL.replace("+asyncpg", "")
sync_engine = create_engine(sync_database_url, echo=True)

# Dependency
async def get_db():
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()