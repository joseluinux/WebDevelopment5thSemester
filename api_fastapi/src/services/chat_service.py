from agents.chat_agent import run_chat
from schemas.schemas import ChatRequest, ChatResponse
from shared.logger import logger


class ChatService:
    async def chat(self, request: ChatRequest) -> ChatResponse:
        logger.info(f"[chat-service] Processando mensagem para MEI {request.mei_id}")
        return await run_chat(request)
