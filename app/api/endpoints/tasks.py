import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import Task, User, TaskStatus
from app.schemas.tasks import TaskCreate, TaskResponse
from app.tasks.celery_worker import celery_app
from app.api.deps import get_current_user

router = APIRouter(tags=["tasks"])

@router.post("/tasks", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Создание нового задания.
    """
    # Создаем запись в БД
    new_task_id = str(uuid.uuid4())
    db_task = Task(
        id=new_task_id,
        user_id=current_user.id,
        task_type=task_in.task_type,
        prompt=task_in.prompt,
        status=TaskStatus.PENDING
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)

    # Отправляем задачу в Celery для обработки ONLY after ensuring it's committed
    try:
        celery_app.send_task('app.tasks.celery_worker.process_llm_task', args=[new_task_id])
    except Exception as e:
        # If Celery fails, we should log the error but not fail the request
        print(f"Failed to queue task {new_task_id}: {str(e)}")

    return {"task_id": new_task_id, "status": db_task.status}

@router.get("/tasks/all", response_model=List[TaskResponse])
async def get_all_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получение всех заданий (только для администраторов).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Task))
    tasks = result.scalars().all()
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Проверка статуса задания.
    """
    result = await db.execute(select(Task).filter(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Пользователь может видеть только свои задания
    if task.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this task")

    return task