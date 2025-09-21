from celery import Celery
from app.core.config import settings
from app.db.session import sync_engine
from app.db.models import Task, TaskStatus
from app.services.llm_service import LLMService
from sqlalchemy.orm import sessionmaker

# Create a synchronous session for Celery
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# Инициализация Celery
celery_app = Celery("tasks", broker=settings.CELERY_BROKER_URL, backend=settings.CELERY_RESULT_BACKEND)
celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='Europe/Moscow',
    enable_utc=True,
)

@celery_app.task(bind=True)
def process_llm_task(self, task_id: str):
    """
    Асинхронная задача для обработки запроса к LLM.
    """
    db = SyncSessionLocal()
    task = None
    
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise ValueError(f"Task with ID {task_id} not found.")

        # Обновляем статус на "в процессе"
        task.status = TaskStatus.IN_PROGRESS
        db.commit()

        # Инициализация сервиса и запуск задачи
        llm_service = LLMService(api_key=settings.OPENAI_API_KEY)
        result = llm_service.run_task(task_type=task.task_type, prompt=task.prompt)

        # Обновляем статус и результат
        task.result = result
        task.status = TaskStatus.COMPLETED
        db.commit()

        return result

    except Exception as e:
        if task:
            task.status = TaskStatus.FAILED
            task.result = str(e)
            db.commit()
        self.retry(exc=e, countdown=60, max_retries=3) # Повтор задачи при ошибке
    finally:
        db.close()