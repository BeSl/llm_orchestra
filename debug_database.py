import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables
os.environ['DATABASE_URL'] = 'postgresql://user:password@localhost:5432/llm_orchestra'
os.environ['ADMIN_USERNAME'] = 'admin'
os.environ['ADMIN_PASSWORD'] = 'admin'
os.environ['SECRET_KEY'] = 'test-secret-key'

def test_database_connection():
    try:
        from app.db.session import sync_engine
        from sqlalchemy import text
        
        print("Testing database connection...")
        with sync_engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

def test_admin_creation():
    try:
        print("Testing admin user creation...")
        from app.core.startup import create_admin_user_if_not_exists
        create_admin_user_if_not_exists()
        print("Admin creation process completed.")
    except Exception as e:
        print(f"Admin creation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if test_database_connection():
        test_admin_creation()