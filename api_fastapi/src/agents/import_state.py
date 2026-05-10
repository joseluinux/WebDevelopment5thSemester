import operator
from collections.abc import Sequence
from typing import Annotated, TypedDict

from langgraph.graph.message import BaseMessage, add_messages


class ImportState(TypedDict):
    """
    Estado do agente de importação de planilhas.
    """

    # Histórico de mensagens do agente (LLM + Tools)
    messages: Annotated[Sequence[BaseMessage], add_messages] # Esse add_messages é um reducer que vai concatenar as mensagens, poderiamos fazer um na mão, poderiamos, mas n compensa.

    # Contexto da importação (preenchido antes do grafo iniciar)
    import_id: str
    mei_id: str

    # Dados da planilha (preenchido pelo parse_file_node)
    raw_rows: list[dict]
    total_rows: int

    errors: Annotated[list[str], operator.add] # esse add é outro reducer so que para string.

    # Resultado final montado pelo assemble_result_node
    result: dict | None
