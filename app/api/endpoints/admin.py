from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from collections import Counter

from app.db.session import get_db
from app.db.models import User, Task, TaskStatus
from app.schemas.users import User as UserSchema, UserCreate, UserUpdate
from app.schemas.tasks import TaskResponse, TaskStatsByStatus, TaskStatsByType
from app.api.deps import get_admin_user
from passlib.context import CryptContext
from sqlalchemy import select

router = APIRouter(prefix="/admin", tags=["admin"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User Management Endpoints

@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Получение списка всех пользователей в системе.
    Доступ: Только для администратора.
    """
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@router.post("/users", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Создание нового пользователя.
    Доступ: Только для администратора.
    """
    # Check if user already exists
    result = await db.execute(select(User).filter(User.username == user_in.username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username already exists"
        )
    
    # Hash password
    hashed_password = pwd_context.hash(user_in.password)
    
    # Create user
    user = User(
        username=user_in.username,
        hashed_password=hashed_password,
        role=user_in.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.put("/users/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Обновление данных пользователя (например, смена роли или сброс пароля).
    Доступ: Только для администратора.
    """
    # Find user
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields if provided
    if user_update.role is not None:
        user.role = user_update.role
    
    if user_update.password is not None:
        user.hashed_password = pwd_context.hash(user_update.password)
    
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Удаление пользователя из системы.
    Доступ: Только для администратора.
    """
    # Find user
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}

# Task Monitoring Endpoints

@router.get("/tasks/all", response_model=List[TaskResponse])
async def get_all_tasks(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Получение полного списка всех заданий в системе.
    Доступ: Только для администратора.
    """
    result = await db.execute(select(Task))
    tasks = result.scalars().all()
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task_details(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Получение деталей конкретного задания, включая результат или ошибку.
    Доступ: Администратор может получить доступ к любому заданию.
    """
    result = await db.execute(select(Task).filter(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task

# Statistics and Metrics Endpoints

@router.get("/stats/tasks/by_status", response_model=TaskStatsByStatus)
async def get_task_stats_by_status(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Получение количества заданий по каждому статусу.
    Доступ: Только для администратора.
    """
    result = await db.execute(select(Task))
    tasks = result.scalars().all()
    status_counts = Counter(task.status for task in tasks)
    
    return TaskStatsByStatus(
        pending=status_counts.get(TaskStatus.PENDING, 0),
        in_progress=status_counts.get(TaskStatus.IN_PROGRESS, 0),
        completed=status_counts.get(TaskStatus.COMPLETED, 0),
        failed=status_counts.get(TaskStatus.FAILED, 0)
    )

@router.get("/stats/tasks/by_type", response_model=TaskStatsByType)
async def get_task_stats_by_type(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """
    Получение количества заданий по их типу.
    Доступ: Только для администратора.
    """
    result = await db.execute(select(Task))
    tasks = result.scalars().all()
    type_counts = Counter(task.task_type for task in tasks)
    
    return TaskStatsByType(
        summarization=type_counts.get("summarization", 0),
        translation=type_counts.get("translation", 0),
        code_generation=type_counts.get("code_generation", 0)
    )