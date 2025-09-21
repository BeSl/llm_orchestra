# app/core/startup.py
# Startup events for the application

from sqlalchemy.orm import Session
from app.db.models import User
from app.db.session import sync_engine
from app.core.config import settings
from passlib.context import CryptContext
import traceback

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user_if_not_exists():
    """
    Create an admin user if one doesn't exist yet.
    This function uses the sync engine to work with the database during startup.
    """
    print(f"Attempting to create admin user with username: {settings.ADMIN_USERNAME}")
    print(f"Database URL: {sync_engine.url}")
    
    # Create all tables if they don't exist
    from app.db.models import Base
    try:
        print("Creating database tables if they don't exist...")
        Base.metadata.create_all(bind=sync_engine)
        print("Database tables created successfully.")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        traceback.print_exc()
        return
    
    # Create a sync session
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
    db = SessionLocal()
    
    try:
        print("Checking if admin user already exists...")
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        
        if not admin_user:
            print("Admin user does not exist. Creating...")
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
        traceback.print_exc()
    finally:
        db.close()