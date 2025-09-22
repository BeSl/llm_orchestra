import json
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.llm_service import LLMService

router = APIRouter(tags=["llm"])

class LLMRequest(BaseModel):
    task_type: str
    prompt: str
    history: Optional[List[Dict[str, str]]] = None

class LLMResponse(BaseModel):
    result: str

@router.post("/llm/process", response_model=LLMResponse)
async def process_llm_task(request: LLMRequest):
    """
    Process LLM task - endpoint for Go service to call
    """
    try:
        # Initialize LLM service
        llm_service = LLMService()
        
        # Run the task
        result = llm_service.run_task(
            task_type=request.task_type,
            prompt=request.prompt,
            history=request.history
        )
        
        return LLMResponse(result=result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing LLM task: {str(e)}"
        )