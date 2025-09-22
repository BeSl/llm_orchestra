# LLM Orchestra

[🇷🇺 Перейти на русский](README_RU.md) | [🇺🇸 English (current)](README.md) | [<img src="https://img.shields.io/badge/README-CN-yellow" alt="CN" height="20">](README_CN.md)

# LLM Orchestra (Go Orchestrator + Python LLM Service)

This repository contains a Go-based orchestrator that exposes an HTTP API and persists dialogue history to Postgres, and a separate Python service that performs LLM calls over HTTP. The orchestrator communicates with the Python LLM service strictly via HTTP.

## Architecture

```
Client ──► Orchestrator (Go, HTTP) ──► LLM Service (Python, HTTP)
                  │
                  └────► Postgres (history, logs)
```

## Services

- Orchestrator (Go): HTTP API for conversations and messages, persistence in Postgres, calls the LLM service.
- LLM Service (Python/FastAPI): HTTP endpoint that wraps the actual LLM provider.
- Task Service (Go): HTTP service for task management with background workers.
- Postgres: stores `conversations`, `messages`, and `logs`.
- Admin UI (optional existing): points to orchestrator API.

## Quickstart (Docker)

```bash
docker compose up --build
```

Services:
- Orchestrator: http://localhost:8080
- LLM Service: http://localhost:8082
- Task Service: http://localhost:8081
- Postgres: localhost:5432 (user/password: user/password)

## HTTP API (orchestrator)

- `GET /healthz`
- `POST /v1/messages`
  - Request:
    ```json
    { "conversation_id": "<uuid or empty>", "messages": [{"role":"user","content":"hi"}] }
    ```
  - Response:
    ```json
    { "conversation_id": "<uuid>", "reply": "..." }
    ```

## Local development

### Orchestrator
```bash
cd services/orchestrator
go mod tidy
go run .
```

Environment:
- `DATABASE_URL` (e.g. `postgres://user:password@localhost:5432/llm_orchestra?sslmode=disable`)
- `LLM_SERVICE_URL` (default `http://localhost:8082/generate`)
- `LLM_MODEL` (default `llama3`)

### LLM Service
```bash
cd services/llm
pip install -r requirements.txt
python app.py
```

### Task Service
```bash
cd services/tasks
go run main.go
```

## Database

SQL migrations are in `migrations/`. Apply using your preferred tool or run them manually.

Schema:
- `conversations(id uuid, created_at timestamptz)`
- `messages(id bigserial, conversation_id uuid, role text, content text, created_at timestamptz)`
- `logs(id bigserial, type text, message text, created_at timestamptz)`

## CI/CD (GitLab)

`.gitlab-ci.yml` runs Go and Python checks and builds Docker images for orchestrator and llm service.