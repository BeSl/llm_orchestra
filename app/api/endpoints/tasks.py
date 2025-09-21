import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import Task, User, TaskStatus
from app.schemas.tasks import TaskCreate, TaskResponse
from app.tasks.celery_worker import process_llm_task
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/tasks", status_code=status.HTTP_201_CREATED, response_model=dict)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
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
    db.commit()
    db.refresh(db_task)

    # Отправляем задачу в Celery для обработки
    process_llm_task.delay(new_task_id)

    return {"task_id": new_task_id, "status": db_task.status}

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Проверка статуса задания.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Пользователь может видеть только свои задания
    if task.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this task")

    return task

@router.get("/tasks/all", response_model=List[TaskResponse])
def get_all_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получение всех заданий (только для администраторов).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    tasks = db.query(Task).all()
    return tasks