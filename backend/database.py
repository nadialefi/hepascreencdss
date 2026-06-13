from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

import os

# Read database URL from environment variable, default to Supabase PostgreSQL pooler URL
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres.ivhlkxdgasrxabpxnmwb:CDSSapklefi1@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
)

# Connect arguments check_same_thread is only for SQLite
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
