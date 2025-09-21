# LLM Orchestra

[🇷🇺 Перейти на русский](README_RU.md) | [🇺🇸 English (current)](README.md) | [<img src="https://img.shields.io/badge/README-CN-yellow" alt="CN" height="20">](README_CN.md)

# LLM Orchestra

LLM Orchestra is a multi-agent system that leverages Large Language Models (LLMs) to automate complex workflows. The system allows users to define and execute tasks that are processed by specialized AI agents, each with distinct roles and capabilities.

## Features

- **Multi-Agent Architecture**: Different AI agents (Analyst, Interviewer, Programmer) with specialized capabilities
- **Task Management**: Create, monitor, and track tasks through their lifecycle
- **Dialogue History**: Tasks can include conversation history for context-aware processing
- **Admin Dashboard**: Web-based interface for administrators to manage users and monitor tasks
- **RESTful API**: Comprehensive API for programmatic access to all system features
- **Containerized Deployment**: Docker-based deployment for easy setup and scaling
- **Asynchronous Processing**: Celery-based task queue for efficient background processing
- **LLM Provider Support**: Configurable LLM provider (Ollama or OpenAI) with Ollama as default

## System Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Client    │◄──►│  Web Server  │◄──►│  Database     │
└─────────────┘    │ (FastAPI)    │    │ (PostgreSQL)  │
                   └──────────────┘    └──────────────┘
                          │
                   ┌──────────────┐    ┌──────────────┐
                   │ Task Queue   │◄──►│  Redis        │
                   │ (Celery)     │    │ (Broker/Cache)│
                   └──────────────┘    └──────────────┘
                          │
                   ┌──────────────┐
                   │ LLM Services │
                   │ (Ollama etc.)│
                   └──────────────┘
```

## Task Types

The system supports several types of tasks that can be processed by specialized agents:

- **Summarization**: Text summarization tasks
- **Translation**: Language translation tasks
- **Analyst**: Data analysis and insights tasks
- **Interviewer**: Question and answer tasks
- **Programmer**: Code generation and programming tasks

## Dialogue History

Tasks can include dialogue history to provide context for more accurate processing. The history is stored as part of the task and passed to the LLM when processing the task.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.8+
- PostgreSQL (when running without Docker)
- Redis (when running without Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd llm_orchestra
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file to configure your settings:
   - Database connection details
   - LLM provider settings (Ollama or OpenAI)
   - Admin credentials

4. Build and start the services:
   ```bash
   docker-compose up --build
   ```

### Usage

1. Access the admin dashboard at `http://localhost:3000`
2. Log in with the admin credentials configured in your `.env` file
3. Create tasks using the dashboard or API
4. Monitor task progress and view results

### API Endpoints

- **Authentication**: `/api/token` - Obtain access token
- **Task Management**: 
  - `POST /api/tasks` - Create a new task
  - `GET /api/tasks/all` - Get all tasks (admin only)
  - `GET /api/tasks/{task_id}` - Get task status
- **Admin Endpoints**:
  - `GET /api/admin/users` - Get all users
  - `POST /api/admin/users` - Create a user
  - `PUT /api/admin/users/{user_id}` - Update a user
  - `DELETE /api/admin/users/{user_id}` - Delete a user
  - `GET /api/admin/tasks/all` - Get all tasks
  - `GET /api/admin/tasks/{task_id}` - Get task details
  - `DELETE /api/admin/tasks/{task_id}` - Delete a task
  - `GET /api/admin/stats/tasks/by_status` - Get task statistics by status
  - `GET /api/admin/stats/tasks/by_type` - Get task statistics by type

## Configuration

The system can be configured through environment variables:

- `LLM_PROVIDER`: LLM provider to use (ollama or openai)
- `LLM_MODEL`: Model name to use
- `OLLAMA_BASE_URL`: Base URL for Ollama service
- `OPENAI_API_KEY`: API key for OpenAI (if using OpenAI provider)
- Database and Redis connection settings

## Development

### Project Structure

```
llm_orchestra/
├── app/                    # Backend application
│   ├── api/               # API endpoints
│   ├── core/              # Core configuration
│   ├── db/                # Database models and session
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   └── tasks/             # Celery tasks
├── ui/                    # Frontend admin dashboard
├── alembic/               # Database migrations
├── tests/                 # Test files
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Backend Dockerfile
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

### Running Tests

```bash
# Run tests
python -m pytest tests/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
