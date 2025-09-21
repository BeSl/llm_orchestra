from langchain_community.llms import OpenAI
from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from app.core.config import settings

class LLMService:
    def __init__(self):
        # Initialize LLM based on provider setting
        if settings.LLM_PROVIDER == "ollama":
            self.llm = OllamaLLM(
                model=settings.LLM_MODEL,
                base_url=settings.OLLAMA_BASE_URL
            )
        elif settings.LLM_PROVIDER == "openai":
            self.llm = OpenAI(openai_api_key=settings.OPENAI_API_KEY)
        else:
            # Default to Ollama if provider not specified or invalid
            self.llm = OllamaLLM(
                model=settings.LLM_MODEL,
                base_url=settings.OLLAMA_BASE_URL
            )

    def run_task(self, task_type: str, prompt: str) -> str:
        """
        Запускает задачу на основе типа и промпта.
        """
        if task_type == "summarization":
            template = "Summarize the following text:\n{text}"
            prompt_template = PromptTemplate(template=template, input_variables=["text"])
            chain = LLMChain(prompt=prompt_template, llm=self.llm)
            result = chain.run(text=prompt)
            return result
        elif task_type == "translation":
            template = "Translate the following text to English:\n{text}"
            prompt_template = PromptTemplate(template=template, input_variables=["text"])
            chain = LLMChain(prompt=prompt_template, llm=self.llm)
            result = chain.run(text=prompt)
            return result
        else:
            raise ValueError(f"Unknown task type: {task_type}")