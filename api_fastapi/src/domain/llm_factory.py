"""
Factory de LLM.

Centraliza a decisão de qual provider usar com base em LLM_PROVIDER do .env.

"""
from functools import lru_cache

from langchain.chat_models.base import BaseChatModel  # type: ignore

from config import settings
from domain.interfaces.interfaces import LLMProviderI
from domain.providers.llm_providers import GeminiProvider, OllamaProvider
from shared.logger import logger

_REGISTRY: dict[str, type[LLMProviderI]] = {
    "gemini": GeminiProvider,
    "ollama": OllamaProvider,
}

# Essa bomba aqui de cache é uma das forma de garantir o Singleton vulgo 1 instancia, dava para fazer de outras 20 formas diferente, mas essa aqui é legal não tinha utilizado ela, o claude sabe muito.
@lru_cache
def get_provider() -> LLMProviderI:
    """Retorna o provider configurado em LLM_PROVIDER (singleton)."""
    name = settings.LLM_PROVIDER.lower()
    provider_cls = _REGISTRY.get(name)
    if not provider_cls:
        raise ValueError(f"LLM_PROVIDER '{name}' não é válido, erramo na escrita familia arruma o env e o mapper ai. Opções: {list(_REGISTRY.keys())}")
    provider = provider_cls()
    logger.info(f"[llm-factory] Provider ativo: {provider.get_provider_name()}")
    return provider


def get_llm() -> BaseChatModel:
    """Um Get que é Singleton também, tudo é singleton nesse lugar, vai corinthians. e vai retornar o chat ativo"""
    return get_provider().get_chat_model()
