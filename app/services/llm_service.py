from langchain_community.llms import OpenAI
from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from app.core.config import settings
from typing import List, Dict, Optional

class LLMService:
    def __init__(self):
        # Initialize LLM based on provider setting
        if settings.LLM_PROVIDER == "ollama":
            self.llm = OllamaLLM(
                model=settings.LLM_MODEL,
                base_url=settings.OLLAMA_BASE_URL
            )
        elif settings.LLM_PROVIDER == "openai":
            self.llm = OpenAI()
        else:
            # Default to Ollama if provider not specified or invalid
            self.llm = OllamaLLM(
                model=settings.LLM_MODEL,
                base_url=settings.OLLAMA_BASE_URL
            )

    def run_task(self, task_type: str, prompt: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Запускает задачу на основе типа и промпта.
        """
        # Add history context to the prompt if provided
        full_prompt = prompt
        if history:
            history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
            full_prompt = f"Dialogue history:\n{history_text}\n\nCurrent request:\n{prompt}"
        
        if task_type == "summarization":
            template = "Summarize the following text:\n{text}"
            prompt_template = PromptTemplate(template=template, input_variables=["text"])
            chain = LLMChain(prompt=prompt_template, llm=self.llm)
            result = chain.run(text=full_prompt)
            return result
        elif task_type == "translation":
            template = "Translate the following text to English:\n{text}"
            prompt_template = PromptTemplate(template=template, input_variables=["text"])
            chain = LLMChain(prompt=prompt_template, llm=self.llm)
            result = chain.run(text=full_prompt)
            return result
        elif task_type == "analyst":
            template = "You are a data analyst. Analyze the following information:\n{text}"
            prompt_template = PromptTemplate(template=template, input_variables=["text"])
            chain = LLMChain(prompt=prompt_template, llm=self.llm)
            result = chain.run(text=full_prompt)
            return result
        elif task_type == "interviewer":
            template = "You are an interviewer. Respond to the following question:\n{text}"
            prompt_template = PromptTemplate(template=template, input_variables=["text"])
            chain = LLMChain(prompt=prompt_template, llm=self.llm)
            result = chain.run(text=full_prompt)
            return result
        elif task_type == "programmer":
            template = "You are a programmer. Help with the following coding task:\n{text}"
            prompt_template = PromptTemplate(template=template, input_variables=["text"])
            chain = LLMChain(prompt=prompt_template, llm=self.llm)
            result = chain.run(text=full_prompt)
            return result
        else:
            raise ValueError(f"Unknown task type: {task_type}")