# Task Service (Go Implementation)

This directory contains the Go implementation of the task service, which replaces the previous Python Celery-based implementation.

## Architecture

The new architecture consists of:

1. **Task Service API** (`main.go`): A simple HTTP server that handles task creation and status queries
2. **Task Worker** (`simple_worker.go`): A background process that processes tasks by calling the Python LLM service
3. **Python LLM Service** (`app/api/endpoints/llm.py`): The existing Python service that handles LLM interactions

## Components

### Task Service API
- Listens on port 8081
- Provides endpoints for task creation and status checking
- Forwards task processing to the task worker through a queue mechanism (to be implemented)

### Task Worker
- Runs as a separate process
- Processes tasks by calling the Python LLM service
- Updates task status in the database (to be implemented)

### Python LLM Service
- Handles all LLM interactions
- Provides a REST API for the Go service to call
- Maintains the same functionality as before

## Docker Configuration

The service is configured to run in Docker with the following containers:
- `task-service`: The main API service
- `task-worker`: The background worker process

## Building and Running

To build and run the service:

```bash
# Build the Docker images
docker-compose build task-service task-worker

# Start the services
docker-compose up task-service task-worker
```

## API Endpoints

### Create Task
```
POST /tasks
```

### Get Task Status
```
GET /tasks/{task_id}
```

## Environment Variables

- `PORT`: Port for the task service to listen on (default: 8081)
- `LLM_SERVICE_URL`: URL of the Python LLM service (default: http://web:8000/llm/process)