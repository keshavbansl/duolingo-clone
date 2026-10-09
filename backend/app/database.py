from pathlib import Path
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy import inspect, text

def migrate_daily_xp():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("users")}

    with engine.begin() as connection:
        if "daily_xp" not in columns:
            connection.execute(text(
                "ALTER TABLE users ADD COLUMN daily_xp INTEGER NOT NULL DEFAULT 0"
            ))
        if "daily_xp_date" not in columns:
            connection.execute(text(
                "ALTER TABLE users ADD COLUMN daily_xp_date DATE"
            ))


# Store the SQLite database in the backend root directory.
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "database.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# SQLite needs this option when used with FastAPI's request handling.
connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """Provide a database session for a FastAPI request."""
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()



def init_db() -> None:
    """Create all database tables and apply migrations."""
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    migrate_daily_xp()


