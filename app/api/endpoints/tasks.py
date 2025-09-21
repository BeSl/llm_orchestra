import uuid
import json
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
    # Serialize history to JSON string for storage
    history_json = json.dumps(task_in.history) if task_in.history else None
    
    # Создаем запись в БД
    new_task_id = str(uuid.uuid4())
    db_task = Task(
        id=new_task_id,
        user_id=current_user.id,
        task_type=task_in.task_type,
        prompt=task_in.prompt,
        status=TaskStatus.PENDING,
        history=history_json
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
    # Convert to dict to avoid type checking issues
    user_dict = {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }
    
    if user_dict["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Task))
    tasks = result.scalars().all()
    
    # Convert to dict format for response
    task_list = []
    for task in tasks:
        # Convert task to dict to avoid type checking issues
        task_dict = {
            "id": task.id,
            "user_id": task.user_id,
            "task_type": task.task_type,
            "prompt": task.prompt,
            "status": task.status,
            "result": task.result,
            "created_at": task.created_at,
            "completed_at": task.completed_at,
            "history": task.history
        }
        
        # Deserialize history from JSON string
        if task_dict["history"]:
            try:
                task_dict["history"] = json.loads(str(task_dict["history"]))
            except (json.JSONDecodeError, TypeError):
                task_dict["history"] = None
        else:
            task_dict["history"] = None
            
        task_list.append(task_dict)
    
    return task_list

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
    
    # Convert to dict to avoid type checking issues
    user_dict = {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }
    
    task_dict = {
        "id": task.id,
        "user_id": task.user_id,
        "task_type": task.task_type,
        "prompt": task.prompt,
        "status": task.status,
        "result": task.result,
        "created_at": task.created_at,
        "completed_at": task.completed_at,
        "history": task.history
    }
    
    # Пользователь может видеть только свои задания
    if str(task_dict["user_id"]) != str(user_dict["id"]) and user_dict["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this task")

    # Deserialize history from JSON string
    if task_dict["history"]:
        try:
            task_dict["history"] = json.loads(str(task_dict["history"]))
        except (json.JSONDecodeError, TypeError):
            task_dict["history"] = None
    else:
        task_dict["history"] = None

    return task_dict