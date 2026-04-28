"""
Providers concretos de LLM, que vão herdar a interface LLMProviderI.

Cada provider implementa LLMProviderI e encapsula
a dependência da lib específica (langchain-google-genai, langchain-ollama…).
usa a factory em llm_factory.py.
"""
from typing import Any

from langchain.chat_models.base import BaseChatModel  # type: ignore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama

from config import settings
from domain.interfaces.interfaces import LLMProviderI


class GeminiProvider(LLMProviderI):
    """Provider usando Google Gemini via langchain-google-genai."""

    def get_chat_model(self) -> BaseChatModel:
        return ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            max_retries=settings.GEMINI_MAX_RETRIES,
        )

    def get_provider_name(self) -> str:
        return "gemini"

    def generate_response(self, prompt: str) -> str:
        model = self.get_chat_model()
        return str(model.invoke(prompt).content)

    async def categorize(self, description: str, amount: float) -> dict[str, Any]:
        raise NotImplementedError


class OllamaProvider(LLMProviderI):
    """Provider usando Ollama local via langchain-ollama.

    Modelo padrão: qwen2.5:3b (leve, suporta function calling, ~2 GB).
    Outros bons: llama3.2:3b, mistral:7b.
    Configure OLLAMA_MODEL e OLLAMA_BASE_URL no .env.
    """

    def get_chat_model(self) -> BaseChatModel:
        return ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
        )

    def get_provider_name(self) -> str:
        return "ollama"

    def generate_response(self, prompt: str) -> str:
        model = self.get_chat_model()
        return str(model.invoke(prompt).content)

    async def categorize(self, description: str, amount: float) -> dict[str, Any]:
        raise NotImplementedError
