import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from schemas.schemas import ImportRequest, ImportResponse
from services.import_service import ImportService

router = APIRouter(prefix="/api/import", tags=["Import"])

import_service = ImportService()


@router.post(
    "/process",
    response_model=ImportResponse,
    status_code=status.HTTP_200_OK,
    summary="Processa planilha de importação",
    description=(
        "Recebe o contexto de uma importação do backend C#, baixa o arquivo via file_url, "
        "executa o agente de classificação e retorna o JSON estruturado para persistência."
    ),
)
async def process_import(request: ImportRequest) -> ImportResponse:
    """
    Endpoint chamado pelo backend ASP.NET Core após o upload do arquivo.

    Fluxo:
      C# → POST /api/import/process → (agente LangGraph) → JSON → C# salva no BD
    """
    try:
        return await import_service.process(request)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar importação: {exc}",
        ) from exc



@router.post(
    "/dev/upload",
    response_model=ImportResponse,
    status_code=status.HTTP_200_OK,
    tags=["Dev / Testes"],
    summary="[DEV] Upload direto de planilha para teste",
    description=(
        "Envia o arquivo CSV ou XLSX diretamente, sem precisar do backend C# nem do Supabase. "
        "Simula o fluxo completo do agente de importação. "
        "**Não usar em produção.**"
    ),
)
async def dev_upload(
    file: UploadFile = File(..., description="Arquivo CSV ou XLSX"),
    mei_id: str = Form(default="dev-mei-001", description="ID do MEI para contexto"),
) -> ImportResponse:
    raw_bytes = await file.read()
    filename = file.filename or "planilha.csv"
    import_id = f"dev-{uuid.uuid4().hex[:8]}"

    try:
        return await import_service.process_raw_bytes(
            raw_bytes=raw_bytes,
            filename=filename,
            import_id=import_id,
            mei_id=mei_id,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar arquivo: {exc}",
        ) from exc
