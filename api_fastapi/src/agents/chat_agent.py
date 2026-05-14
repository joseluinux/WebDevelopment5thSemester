from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from domain.llm_factory import get_llm
from schemas.schemas import ChatRequest, ChatResponse
from shared.logger import logger


def _build_system_prompt(context: dict) -> str:
    mei_name = context.get("mei_name", "seu MEI")
    plan = context.get("plan", "starter")
    annual_limit = context.get("annual_limit", 81000)
    total_income = context.get("total_income", 0)
    total_expense = context.get("total_expense", 0)
    net_profit = context.get("net_profit", 0)
    tx_count = context.get("transaction_count", 0)
    product_count = context.get("product_count", 0)
    employee_count = context.get("employee_count", 0)
    top_categories: list = context.get("top_categories", [])
    recent_tx: list = context.get("recent_transactions", [])

    pct_used = (total_income / annual_limit * 100) if annual_limit > 0 else 0
    cats_str = ", ".join(top_categories) if top_categories else "nenhuma registrada"

    recent_lines = ""
    for tx in recent_tx[:8]:
        tipo = "Receita" if tx.get("type") == "income" else "Despesa"
        cat = tx.get("category") or "sem categoria"
        amt = float(tx.get("amount", 0))
        date = tx.get("date", "")
        desc = tx.get("description") or ""
        recent_lines += f"  • {tipo}: R$ {amt:,.2f} ({cat}) — {date}"
        if desc:
            recent_lines += f" — {desc}"
        recent_lines += "\n"

    if not recent_lines:
        recent_lines = "  Nenhuma transação registrada ainda.\n"

    return f"""Você é LUMEMEI AI, assistente financeiro especializado em MEI (Microempreendedor Individual) brasileiro.

## Regulamentação MEI vigente
- Limite anual de faturamento: R$ 81.000,00 (R$ 6.750,00/mês em média)
- Contribuição mensal DAS: 5% do salário mínimo (INSS) + ICMS fixo R$ 1,00 ou ISS fixo R$ 5,00
- Declaração anual DASN-SIMEI: prazo até 31 de maio do ano seguinte
- Pode contratar 1 empregado com salário mínimo ou piso da categoria
- Vedado ser sócio, titular ou administrador de outra empresa
- Nota fiscal obrigatória para prestação de serviços a pessoas jurídicas

## Dados do MEI do usuário
- Nome: {mei_name}
- Plano LUMEMEI: {plan}
- Limite anual: R$ {annual_limit:,.2f}

## Situação financeira atual
- Receitas totais: R$ {total_income:,.2f}
- Despesas totais: R$ {total_expense:,.2f}
- Lucro líquido: R$ {net_profit:,.2f}
- Limite anual utilizado: {pct_used:.1f}% (R$ {total_income:,.2f} de R$ {annual_limit:,.2f})
- Transações registradas: {tx_count}
- Produtos cadastrados: {product_count}
- Funcionários: {employee_count}
- Categorias frequentes: {cats_str}

## Transações recentes
{recent_lines}
Responda sempre em português do Brasil, de forma clara e direta.
Use os dados reais do usuário nas respostas quando relevante.
Para valores monetários, use o formato R$ X.XXX,XX.
Seja conciso mas completo. Use markdown para formatação quando útil."""


async def run_chat(request: ChatRequest) -> ChatResponse:
    """Executa uma rodada de chat com contexto do MEI."""
    llm = get_llm()
    system_prompt = _build_system_prompt(request.context)

    messages = [SystemMessage(content=system_prompt)]

    for item in request.history:
        if item.role == "user":
            messages.append(HumanMessage(content=item.content))
        else:
            messages.append(AIMessage(content=item.content))

    messages.append(HumanMessage(content=request.message))

    logger.info(f"[chat] MEI {request.mei_id} — {len(messages)} mensagens enviadas ao LLM")

    response = await llm.ainvoke(messages)

    return ChatResponse(
        reply=response.content,
        mei_id=request.mei_id,
    )
