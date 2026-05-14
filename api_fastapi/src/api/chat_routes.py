from fastapi import APIRouter, HTTPException, status

from schemas.schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["Chat"])

_chat_service = ChatService()


@router.post(
    "/message",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Enviar mensagem ao LUMEMEI AI",
)
async def send_message(request: ChatRequest) -> ChatResponse:
    try:
        return await _chat_service.chat(request)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar mensagem: {exc}",
        ) from exc
