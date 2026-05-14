from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configurações centralizadas da aplicação.
    
    Carrega todas as variáveis do arquivo .env e fornece
    type hints para toda a aplicação.
    """

    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"  # INFO | DEBUG | WARNING | ERROR | CRITICAL

    API_TITLE: str = "Lumemei AI API"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "API Python com IA para gestão financeira de MEI"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True

    GEMINI_API_KEY: str  # Obrigatório - definir no .env
    GEMINI_MODEL: str = "gemini-3.1-flash-lite-preview"
    GEMINI_TIMEOUT: int = 30  # segundos
    GEMINI_MAX_RETRIES: int = 3

    # ── LLM Provider ──────────────────────────────────────────────────────────
    # "gemini" → Google Gemini (requer GEMINI_API_KEY)
    # "ollama" → Ollama local (requer Ollama rodando em OLLAMA_BASE_URL)
    LLM_PROVIDER: str = "gemini"

    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen2.5:3b"  # leve (~2GB), suporta function calling

    CSHARP_API_URL: str = "http://localhost:5000"  # URL base do ASP.NET Core
    CSHARP_API_TIMEOUT: int = 30  # segundos
    CSHARP_CONTEXT_ENDPOINT: str = "/api/context/{mei_id}"
    CSHARP_WEBHOOK_CHAT_ENDPOINT: str = "/api/ai-callback/chat"
    CSHARP_WEBHOOK_IMPORT_ENDPOINT: str = "/api/ai-callback/import"
    CSHARP_WEBHOOK_SIMULATION_ENDPOINT: str = "/api/ai-callback/simulation"
    WEBHOOK_SECRET_KEY: str = "seu-secret-key-aqui"  # Usar no .env produção
    WEBHOOK_VERIFY_HMAC: bool = True  # Validar assinatura HMAC
    WEBHOOK_TIMEOUT: int = 10  # segundos para chamadas webhook


    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Lista de origens permitidas para chamadas diretas do browser.
    # Em dev: localhost. Em prod: domínio real do frontend.
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://lumemei.com.br",
        "https://www.lumemei.com.br",
    ]
    ALLOWED_EXTENSIONS: str = "csv,xlsx,xls,json"  # String separada por vírgula


    class Config:
        """Configuração do Pydantic para carregar variáveis de ambiente"""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    """
    Retorna instância singleton de Settings.
    Uso:
        settings = get_settings()
        print(settings.GEMINI_API_KEY)
    """
    return Settings() # type: ignore


# Exportar instância default para uso direto
settings = get_settings()
