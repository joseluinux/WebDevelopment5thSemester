import json
from typing import Literal

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.constants import START
from langgraph.graph.state import CompiledStateGraph, StateGraph

from agents.import_prompts import IMPORT_SYSTEM_PROMPT
from agents.import_state import ImportState
from agents.import_tools import TOOLS, TOOLS_BY_NAME
from domain.llm_factory import get_llm
from shared.logger import logger


def _log_graph_mermaid(graph: CompiledStateGraph) -> None:
    """Gera e loga o código Mermaid do grafo para depuração visual."""
    try:
        mermaid_code = graph.get_graph().draw_mermaid()
        logger.debug(f"\n[MERMAID GRAPH]\n{mermaid_code}\n")
    except Exception as e:
        logger.error(f"Erro ao gerar Mermaid: {e}")


# ──────────────────────────────────────────────
# Nodes
# ──────────────────────────────────────────────

def parse_file_node(state: ImportState) -> dict:
    """
    Node de conversão: converte raw_rows em uma HumanMessage
    estruturada para o LLM processar.
    """
    rows = state["raw_rows"]
    total = len(rows)

    # Detecta colunas presentes para ajudar o LLM a identificar o modelo
    columns = list(rows[0].keys()) if rows else [] #Isso aqui é hipotético, tipo a logica é assim a primeira coluna é sempre o cabeçalho com a colunas, então o rows[0] tem que ser um dict com as chaves sendo as colunas, entao a gente pega as chaves do primeiro item pra ter uma ideia das colunas, se n tiver linha nenhuma fica vazio mesmo.

    # Limita amostra para evitar overflow de tokens em arquivos grandes
    sample = rows[:100] if total > 100 else rows
    truncated = total > 100 #Isso aqui o claude falou n sei qual o limite real da IA para os tokens, mas ja ajuda. Pois se tiver mais de 100 linhas o modelo fica sabendo e rola o truncamento foda

    content_parts = [
        f"Planilha recebida: {total} linhas" + (" (primeiras 100 exibidas)" if truncated else "") + ".",
        f"Colunas detectadas: {columns}",
        "",
        "Dados:",
        f"```json\n{json.dumps(sample, ensure_ascii=False, indent=2)}\n```",
        "",
        "Analise as colunas, identifique o modelo da planilha e chame as ferramentas para classificar os dados.",
    ]

    return {
        "messages": [
            SystemMessage(IMPORT_SYSTEM_PROMPT),
            HumanMessage("\n".join(content_parts)),
        ],
        "total_rows": total,
        "errors": [],
        "result": None,
    }


def call_llm(state: ImportState) -> dict:
    """
    Node LLM
    Invoca o modelo com as tools vinculadas e retorna a resposta.
    """
    llm_with_tools = get_llm().bind_tools(TOOLS)
    result = llm_with_tools.invoke(state["messages"])

    logger.debug(f"[call-llm] LLM response: {result}")

    return {"messages": [result]}


def tool_node(state: ImportState) -> dict:
    """
    Node de execução de tools
    Executa a última tool call do AIMessage e retorna um ToolMessage.
    """
    llm_response = state["messages"][-1]

    if not isinstance(llm_response, AIMessage) or not getattr(
        llm_response, "tool_calls", None
    ):
        return {}

    call = llm_response.tool_calls[-1]
    name = call["name"]
    call_id = call["id"]
    args = call["args"]

    logger.debug(f"[tool-node] tool={name} args={args!r}")

    try:
        content = TOOLS_BY_NAME[name].invoke(args)
        status = "success"
    except (KeyError, IndexError, TypeError) as error:
        content = json.dumps({"error": f"Erro ao executar ferramenta: {error}"})
        status = "error"

    return {"messages": [ToolMessage(content=content, tool_call_id=call_id, status=status)]}


def assemble_result_node(state: ImportState) -> dict:
    """
    Node final: coleta todos os ToolMessages de sucesso e monta
    o JSON estruturado que será retornado ao backend C#.
    """
    transactions: list[dict] = []
    products: list[dict] = []
    employees: list[dict] = []
    errors: list[str] = list(state.get("errors") or [])

    for msg in state["messages"]:
        if not isinstance(msg, ToolMessage) or msg.status != "success":
            continue
        try:
            data: dict = json.loads(msg.content) #type: ignore  #
            transactions.extend(data.get("transactions", []))
            products.extend(data.get("products", []))
            employees.extend(data.get("employees", []))
            errors.extend(data.get("errors", []))
        except (json.JSONDecodeError, AttributeError):
            continue

    processed = len(transactions) + len(products) + len(employees)
    status = "success" if not errors else ("partial" if processed > 0 else "error")

    result = {
        "import_id": state["import_id"],
        "mei_id": state["mei_id"],
        "transactions": transactions,
        "products": products,
        "employees": employees,
        "total_rows": state.get("total_rows", 0),
        "processed_rows": processed,
        "errors": errors,
        "status": status,
    }

    return {"result": result}

def router(state: ImportState) -> Literal["tool_node", "assemble_result_node"]:
    """
    Se o LLM emitiu tool_calls → executa a tool.
    Caso contrário → monta o resultado final.
    """
    llm_response = state["messages"][-1]
    if getattr(llm_response, "tool_calls", None):
        return "tool_node"
    return "assemble_result_node"


# ──────────────────────────────────────────────
# Graph builder
# ──────────────────────────────────────────────

def build_import_graph() -> CompiledStateGraph:
    """
    Topologia do grafo de importação:

        START
          │
          ▼
    parse_file_node          ← converte planilha em HumanMessage
          │
          ▼
       call_llm  ◄──────────────────────┐
          │                             │
          ▼ (router)                    │
    ┌─────────────┐                     │
    │  tool_node  │─────────────────────┘
    └─────────────┘
          │ (quando LLM não emite mais tool_calls)
          ▼
    assemble_result_node
          │
          ▼
         END
    """
    builder = StateGraph(ImportState)

    builder.add_node("parse_file_node", parse_file_node)
    builder.add_node("call_llm", call_llm)
    builder.add_node("tool_node", tool_node)
    builder.add_node("assemble_result_node", assemble_result_node)

    builder.add_edge(START, "parse_file_node")
    builder.add_edge("parse_file_node", "call_llm")
    builder.add_conditional_edges(
        "call_llm",
        router,
        ["tool_node", "assemble_result_node"],
    )
    builder.add_edge("tool_node", "call_llm")
    builder.add_edge("assemble_result_node", "__end__")

    graph = builder.compile()

    _log_graph_mermaid(graph)

    return graph
