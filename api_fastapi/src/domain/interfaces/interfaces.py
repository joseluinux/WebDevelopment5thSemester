from abc import ABC, abstractmethod
from typing import Any

from langchain.chat_models.base import BaseChatModel


class LLMProviderI(ABC):
    """Interface para provedores de LLM (Language Model).

    Qualquer provedor concreto (Gemini, Ollama, OpenAI…) deve implementar
    este contrato. O restante da aplicação depende apenas desta interface,
    nunca de uma implementação específica.
    """

    @abstractmethod
    def get_chat_model(self) -> BaseChatModel:
        """Retorna o modelo de chat pronto para uso com LangChain/LangGraph."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Retorna o nome legível do provedor (ex.: 'gemini', 'ollama')."""
        pass

    # Métodos de domínio (mantidos para uso futuro nos serviços de domínio)

    @abstractmethod
    def generate_response(self, prompt: str) -> str:
        """Gera uma resposta a partir de um prompt."""
        pass

    @abstractmethod
    async def categorize(self, description: str, amount: float) -> dict[str, Any]:
        """Classifica uma transação com base na descrição e valor."""
        pass
