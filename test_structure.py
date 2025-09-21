"""
Test script to verify the application structure and imports.
This script will help identify any immediate issues with the project setup.
"""

def test_imports():
    """Test that all modules can be imported without syntax errors."""
    try:
        # Test core modules
        from app.main import app
        print("✓ Main app imported successfully")
        
        # Test API endpoints
        from app.api.endpoints import auth, tasks, users, admin
        print("✓ API endpoints imported successfully")
        
        # Test core modules
        from app.core import config, security
        print("✓ Core modules imported successfully")
        
        # Test database modules
        from app.db import models, session
        print("✓ Database modules imported successfully")
        
        # Test schemas
        from app.schemas import tasks as task_schemas, users as user_schemas
        print("✓ Schemas imported successfully")
        
        # Test services
        from app.services import llm_service
        print("✓ Services imported successfully")
        
        # Test tasks
        from app.tasks import celery_worker
        print("✓ Celery worker imported successfully")
        
        print("\n✅ All imports successful! The application structure is correct.")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

if __name__ == "__main__":
    print("Testing application structure...")
    test_imports()