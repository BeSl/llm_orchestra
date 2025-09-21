#!/usr/bin/env python3
"""
Test script to verify dialogue history functionality and new task types.
"""

import json
from app.services.llm_service import LLMService
from app.schemas.tasks import TaskCreate

def test_llm_service_with_history():
    """Test the LLM service with dialogue history."""
    print("Testing LLM service with dialogue history...")
    
    # Create LLM service
    llm_service = LLMService()
    
    # Test dialogue history
    history = [
        {"role": "user", "content": "What is Python?"},
        {"role": "assistant", "content": "Python is a high-level programming language."},
        {"role": "user", "content": "What are its main features?"}
    ]
    
    # Test analyst task type
    try:
        result = llm_service.run_task(
            task_type="analyst",
            prompt="Analyze the conversation and provide insights.",
            history=history
        )
        print(f"Analyst task result: {result[:100]}...")
    except Exception as e:
        print(f"Error with analyst task: {e}")
    
    # Test interviewer task type
    try:
        result = llm_service.run_task(
            task_type="interviewer",
            prompt="Ask a follow-up question about Python.",
            history=history
        )
        print(f"Interviewer task result: {result[:100]}...")
    except Exception as e:
        print(f"Error with interviewer task: {e}")
    
    # Test programmer task type
    try:
        result = llm_service.run_task(
            task_type="programmer",
            prompt="Write a simple Python function to calculate factorial.",
            history=history
        )
        print(f"Programmer task result: {result[:100]}...")
    except Exception as e:
        print(f"Error with programmer task: {e}")

def test_task_create_schema():
    """Test the TaskCreate schema with history."""
    print("\nTesting TaskCreate schema with history...")
    
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ]
    
    # Test creating a task with history
    task_data = {
        "task_type": "analyst",
        "prompt": "Analyze this conversation",
        "history": history
    }
    
    try:
        task_create = TaskCreate(**task_data)
        print(f"TaskCreate schema validation passed: {task_create}")
        print(f"History: {task_create.history}")
    except Exception as e:
        print(f"Error with TaskCreate schema: {e}")

if __name__ == "__main__":
    test_llm_service_with_history()
    test_task_create_schema()
    print("\nTest completed!")