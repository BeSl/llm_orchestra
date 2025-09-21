# app/core/startup.py
# Startup events for the application

from sqlalchemy.orm import Session
from app.db.models import User
from app.db.session import sync_engine
from app.core.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user_if_not_exists():
    """
    Create an admin user if one doesn't exist yet.
    This function uses the sync engine to work with the database during startup.
    """
    # Create all tables if they don't exist
    from app.db.models import Base
    Base.metadata.create_all(bind=sync_engine)
    
    # Create a sync session
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        
        if not admin_user:
            # Create admin user
            hashed_password = pwd_context.hash(settings.ADMIN_PASSWORD)
            admin_user = User(
                username=settings.ADMIN_USERNAME,
                hashed_password=hashed_password,
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user '{settings.ADMIN_USERNAME}' created successfully.")
        else:
            print(f"Admin user '{settings.ADMIN_USERNAME}' already exists.")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
    finally:
        db.close()