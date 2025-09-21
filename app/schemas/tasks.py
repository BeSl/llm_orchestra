from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import UUID
from app.db.models import TaskStatus
from datetime import datetime

class TaskCreate(BaseModel):
    task_type: str
    prompt: str
    history: Optional[List[Dict[str, str]]] = None

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[str] = None

class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    task_type: str
    prompt: str
    status: TaskStatus
    result: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    history: Optional[List[Dict[str, str]]] = None
    
    class Config:
        orm_mode = True

class TaskStatsByStatus(BaseModel):
    pending: int = 0
    in_progress: int = 0
    completed: int = 0
    failed: int = 0

class TaskStatsByType(BaseModel):
    summarization: int = 0
    translation: int = 0
    code_generation: int = 0
    analyst: int = 0
    interviewer: int = 0
    programmer: int = 0
    # Add more task types as needed