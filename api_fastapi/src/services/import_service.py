import io
import json
import re

import httpx
import pandas as pd

from agents.import_agent import build_import_graph
from schemas.schemas import ImportRequest, ImportResponse
from shared.logger import logger


class ImportService:
    """
    Orquestra o fluxo de importação de planilhas:
      1. Baixa o arquivo via file_url (Supabase Storage)
      2. Faz o parse do CSV/XLSX para lista de dicts
      3. Executa o grafo LangGraph (agente de classificação)
      4. Retorna ImportResponse estruturado para a rota FastAPI
    """

    def __init__(self) -> None:
        self._graph = build_import_graph()

    async def process(self, request: ImportRequest) -> ImportResponse:
        logger.info(f"[import] Iniciando import_id={request.import_id} mei_id={request.mei_id}")

        # 1. Download do arquivo
        raw_bytes = await self._download_file(request.file_url)

        # 2. Parse para lista de dicts
        rows = self._parse_file(raw_bytes, request.file_url)
        logger.info(f"[import] {len(rows)} linhas extraídas do arquivo")

        # 3. Executa o agente LangGraph
        initial_state = {
            "messages": [],
            "import_id": request.import_id,
            "mei_id": request.mei_id,
            "raw_rows": rows,
            "total_rows": 0,
            "errors": [],
            "result": None,
        }

        final_state = await self._graph.ainvoke(initial_state)
        result: dict = final_state.get("result") or {}

        logger.info(
            f"[import] Concluído — status={result.get('status')} "
            f"processed={result.get('processed_rows')}/{result.get('total_rows')}"
        )

        return ImportResponse(**result)

    # ──────────────────────────────────────────────
    # Helpers privados
    # ──────────────────────────────────────────────

    async def _download_file(self, url: str) -> bytes:
        """Baixa o arquivo via HTTP."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content

    async def process_raw_bytes(
        self,
        raw_bytes: bytes,
        filename: str,
        import_id: str,
        mei_id: str,
    ) -> ImportResponse:
        """Alternativa ao process() para quando os bytes já estão disponíveis.

        Usado pela rota de dev/test que recebe upload direto.
        """
        rows = self._parse_file(raw_bytes, filename)
        logger.info(f"[import-dev] {len(rows)} linhas extraídas de '{filename}'")

        initial_state = {
            "messages": [],
            "import_id": import_id,
            "mei_id": mei_id,
            "raw_rows": rows,
            "total_rows": 0,
            "errors": [],
            "result": None,
        }

        final_state = await self._graph.ainvoke(initial_state)
        result: dict = final_state.get("result") or {}
        return ImportResponse(**result)

    def _parse_file(self, raw_bytes: bytes, file_url: str) -> list[dict]:
        """
        Faz o parse do arquivo (CSV ou XLSX) para lista de dicts.
        Usa pandas + openpyxl (já declarados no pyproject.toml).
        """
        extension = file_url.split("?")[0].rsplit(".", 1)[-1].lower()

        if extension in ("xlsx", "xls"):
            df = pd.read_excel(io.BytesIO(raw_bytes), engine="openpyxl")
        else:
            # CSV com fallback de encoding
            try:
                df = pd.read_csv(io.BytesIO(raw_bytes), encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(raw_bytes), encoding="latin-1")

        # Remove colunas e linhas completamente nulas
        df = df.dropna(how="all").dropna(axis=1, how="all")

        # ── Filtra linhas de lixo ──────────────────────────────────────────
        # Remove linhas onde >70% das colunas são texto puro (títulos, totais)
        # e linhas onde todos os valores numéricos são NaN.
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        if numeric_cols:
            # Mantém linhas que tenham ao menos 1 valor numérico não-nulo
            df = df[df[numeric_cols].notna().any(axis=1)]

        # Remove linhas que parecem cabeçalhos repetidos ou totalizadores
        # (primeira coluna igual ao nome da própria coluna, ou contém "total"/"subtotal")
        first_col = df.columns[0]
        _total_pattern = re.compile(r"\b(total|subtotal|soma|sum)\b", re.IGNORECASE)
        mask_garbage = df[first_col].astype(str).str.lower().isin(
            [str(first_col).lower(), ""]
        ) | df[first_col].astype(str).apply(lambda v: bool(_total_pattern.search(v)))
        df = df[~mask_garbage]

        # Converte para lista de dicts removendo NaN nativos do pandas
        rows = json.loads(df.to_json(orient="records", force_ascii=False, date_format="iso"))
        return rows
