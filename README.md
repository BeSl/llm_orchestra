# LLM Orchestra Service

LLM Orchestra Service is a FastAPI-based web application designed to orchestrate and manage Large Language Model (LLM) tasks. The service provides a REST API for creating, managing, and monitoring LLM tasks with asynchronous processing capabilities using Celery and Redis.

## Features

- User authentication and authorization (JWT-based)
- Task management for LLM operations
- Asynchronous task processing with Celery and Redis
- PostgreSQL database integration with SQLAlchemy
- Docker containerization support
- RESTful API design
- Admin panel endpoints for user and task management
- Web-based admin UI for easy system management
- Automatic admin user creation

## Project Structure

```
├── app/
│   ├── __init__.py
│   ├── main.py              # Main FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies for API endpoints
│   │   ├── endpoints/
│   │   │   ├── __init__.py
│   │   │   ├── tasks.py     # Task-related endpoints
│   │   │   ├── users.py     # User management endpoints
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   └── admin.py     # Admin endpoints for user/task management
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Application settings
│   │   ├── security.py      # JWT and password hashing
│   │   └── startup.py       # Application startup logic
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py       # Database session setup
│   │   └── models.py        # Database models
│   ├── schemas/
│   │   ├── tasks.py         # Pydantic schemas for tasks
│   │   └── users.py         # Pydantic schemas for users
│   ├── services/
│   │   ├── __init__.py
│   │   └── llm_service.py   # LLM interaction logic
│   └── tasks/
│       ├── __init__.py
│       └── celery_worker.py # Celery workers
├── ui/
│   └── admin/               # Next.js admin dashboard
├── alembic/                 # Database migrations
│   ├── versions/            # Migration scripts
│   ├── env.py               # Alembic environment configuration
│   └── script.py.mako       # Migration script template
├── .env.example             # Environment variables example
├── alembic.ini              # Alembic configuration
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
├── requirements.txt         # Python dependencies
├── README.md                # English documentation
└── README_RU.md             # Russian documentation
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL
- Redis
- Docker (optional, for containerization)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd llm-orchestra-service
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install UI dependencies:
   ```bash
   cd ui/admin
   npm install  # or pnpm install
   ```

5. Set up environment variables:
   ```bash
   cp .env.example .env
   cp ui/admin/.env.example ui/admin/.env
   ```
   Edit the `.env` files with your actual configuration values.

## Database Setup

1. Make sure PostgreSQL is running and create the database:
   ```bash
   createdb llm_orchestra
   ```

2. Update the `alembic.ini` file with your database connection string:
   ```
   sqlalchemy.url = postgresql://username:password@localhost/llm_orchestra
   ```

3. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```

## Running the Application

### Development Mode

1. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

2. Start the Celery worker (in a separate terminal):
   ```bash
   celery -A app.tasks.celery_worker.celery_app worker --loglevel=info
   ```

3. (Optional) Start the Celery beat scheduler for periodic tasks:
   ```bash
   celery -A app.tasks.celery_worker.celery_app beat --loglevel=info
   ```

4. Start the Admin UI (in a separate terminal):
   ```bash
   cd ui/admin
   npm run dev  # or pnpm dev
   ```

### Using Docker

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```

2. The services will be available at:
   - API: `http://localhost:8000`
   - Admin UI: `http://localhost:3000`
   - Database: `http://localhost:5432`
   - Redis: `http://localhost:6379`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Admin Endpoints

The service includes a comprehensive set of admin endpoints for managing users and monitoring tasks:

### Authentication
- `POST /token` - Obtain access token with username and password

### User Management
- `GET /users/me` - Get current user information
- `GET /admin/users` - Get all users (admin only)
- `POST /admin/users` - Create a new user (admin only)
- `PUT /admin/users/{user_id}` - Update user details (admin only)
- `DELETE /admin/users/{user_id}` - Delete a user (admin only)

### Task Monitoring
- `GET /admin/tasks/all` - Get all tasks in the system (admin only)
- `GET /admin/tasks/{task_id}` - Get details of a specific task (admin only)

### Statistics and Metrics
- `GET /admin/stats/tasks/by_status` - Get task counts by status (admin only)
- `GET /admin/stats/tasks/by_type` - Get task counts by type (admin only)

## Admin UI

The project includes a web-based admin dashboard built with Next.js that provides a user-friendly interface for:

- Managing users (create, update, delete)
- Monitoring tasks (view status, details)
- Viewing system statistics and metrics
- Configuring system settings

The UI features JWT-based authentication that integrates with the backend API. On first login, use the admin credentials configured in your environment variables.

## Testing Authentication

To test the authentication flow:

1. Start the application using either development mode or Docker
2. Navigate to `http://localhost:3000` to access the admin UI
3. Log in with the admin credentials (default: username `admin`, password `admin`)
4. If you need to test authentication programmatically, you can use the `/token` endpoint directly

## Usage

1. On first startup, an admin user will be automatically created with the credentials from environment variables
2. Navigate to `http://localhost:3000` to access the admin UI
3. Log in with the admin credentials
4. Use the admin panel to manage users and monitor tasks
5. Create additional users as needed through the admin interface

## Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `SECRET_KEY`: Secret key for JWT token generation
- `ALGORITHM`: Algorithm for JWT token encoding
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `CELERY_BROKER_URL`: Redis URL for Celery broker
- `CELERY_RESULT_BACKEND`: Redis URL for Celery results
- `OPENAI_API_KEY`: OpenAI API key for LLM access
- `ADMIN_USERNAME`: Username for the default admin user (default: admin)
- `ADMIN_PASSWORD`: Password for the default admin user (default: admin)
- `NEXT_PUBLIC_API_URL`: API URL for the admin UI (in UI .env file)

## Common Issues and Fixes

1. **Database Connection Issues**: Ensure PostgreSQL is running and the connection string in `.env` is correct.

2. **Redis Connection Issues**: Make sure Redis is running on the specified port (default 6379).

3. **Missing Dependencies**: If you encounter import errors, make sure all dependencies from `requirements.txt` are installed.

4. **Alembic Migrations**: If you modify the database models, generate new migrations:
   ```bash
   alembic revision --autogenerate -m "Description of changes"
   alembic upgrade head
   ```

## Documentation Languages

- [English](README.md)
- [Русский](README_RU.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.