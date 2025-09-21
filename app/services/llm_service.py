from langchain_community.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

class LLMService:
    def __init__(self, api_key: str):
        # Инициализация LLM. Можно использовать и другие модели, например, HuggingFace
        self.llm = OpenAI(openai_api_key=api_key)

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