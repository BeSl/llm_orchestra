import os
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

class Message(BaseModel):
    role: str
    content: str

class GenerateRequest(BaseModel):
    model: str
    messages: list[Message]

class GenerateResponse(BaseModel):
    content: str

app = FastAPI()

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    # Stub: echo last user message. Replace with real HTTP call to provider
    text = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    return GenerateResponse(content=f"echo: {text}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8082"))
    uvicorn.run(app, host="0.0.0.0", port=port)


