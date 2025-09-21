#!/usr/bin/env python3
"""
Debug script to test database connection and schema.
"""

import asyncio
from sqlalchemy import text
from app.db.session import async_engine

async def test_db_connection():
    """Test database connection and schema."""
    print("Testing database connection...")
    
    try:
        # Test connection
        async with async_engine.connect() as conn:
            # Check if tasks table exists
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'tasks'
            """))
            tables = result.fetchall()
            print(f"Tasks table exists: {len(tables) > 0}")
            
            if tables:
                # Check columns in tasks table
                result = await conn.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'tasks'
                    ORDER BY ordinal_position
                """))
                columns = result.fetchall()
                print("Tasks table columns:")
                for col in columns:
                    print(f"  - {col[0]}: {col[1]}")
            
            # Check if users table exists
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'users'
            """))
            tables = result.fetchall()
            print(f"Users table exists: {len(tables) > 0}")
            
    except Exception as e:
        print(f"Error connecting to database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_db_connection())