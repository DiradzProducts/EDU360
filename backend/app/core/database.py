from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    # PostgreSQL-only — no SQLite connect_args needed
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            # No SQLite-specific PRAGMA needed
    # if "sqlite" in settings.DATABASE_URL:
    #     await session.execute(text("PRAGMA foreign_keys=ON;"))
            yield session
        finally:
            await session.close()
