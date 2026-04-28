import json
import re
from typing import Any

from langchain.tools import BaseTool, tool
from pydantic import BaseModel, Field, ValidationError, field_validator

from schemas.schemas import EmployeeItem, ProductItem, TransactionItem


#Com todo respeito se alguém acha q eu ia fazer um regex desse na mão pode ficar suave q não fiz, claude manja muito sé loco. Esse regex aqui é pra tratar a resposta da LLM que as vezes pode ficar paia, na teoria nem precisa disso tudo, mas vai que né.
def _coerce_rows(v: Any) -> list[dict]:
    """Coerce qualquer formato de entrada para list[dict]."""
    if isinstance(v, dict):
        return [v]

    if isinstance(v, list):
        if not v:
            return []
        # list[dict] — caso ideal
        if isinstance(v[0], dict):
            return v
        # list[str] — modelo embrulhou a string num array
        if isinstance(v[0], str):
            raw = v[0]
            # tenta parse direto
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return parsed
                if isinstance(parsed, dict):
                    return [parsed]
            except json.JSONDecodeError:
                pass
            # tenta extrair array via regex (JSON sem vírgulas, etc.)
            match = re.search(r"\[.*\]", raw, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group())
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    pass
        return v

    if isinstance(v, str) and v.strip():
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                return parsed
            if isinstance(parsed, dict):
                return [parsed]
        except json.JSONDecodeError:
            pass
        # extrai array via regex
        match = re.search(r"\[.*\]", v, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group())
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass

    return v #type: ignore  # deixa Pydantic rejeitar com mensagem de erro clara


class RowsInput(BaseModel):
    """Schema compartilhado entre as três tools."""
    rows: list[dict] = Field(
        description="Array de objetos com os dados da planilha"
    )

    @field_validator("rows", mode="before")
    @classmethod
    def coerce_rows(cls, v: Any) -> Any:
        return _coerce_rows(v)


class TransactionInput(RowsInput):
    pass


class ProductInput(RowsInput):
    pass


class EmployeeInput(RowsInput):
    pass


@tool(args_schema=TransactionInput)
def classify_transactions(rows: list[dict]) -> str: #aki no argumento eu poderia passar o tipo certo, mas é aquilo eu n confio que a IA vai seguir o contrato do bigode então se não encaixar deixa no genérico e a gente trata depois.
    """Classifica linhas da planilha como transações financeiras (receitas ou despesas).
    Recebe um array de objetos com campos: date, amount, type (income|expense),
    description, category. Retorna JSON com as transações classificadas.
    """
    transactions: list[dict] = []
    errors: list[str] = []

    for i, row in enumerate(rows):
        try:
            item = TransactionItem.model_validate(row) #model validate é foda eu nem preciso saber o que ta vindo e tenta colocar, se da merda é erro se n der vai corinthians.
            transactions.append(item.model_dump(mode="json"))
        except ValidationError as e:
            errors.append(f"Linha {i}: {e.errors()}")

    return json.dumps({"transactions": transactions, "errors": errors}, ensure_ascii=False)


@tool(args_schema=ProductInput)
def classify_products(rows: list[dict]) -> str:
    """Classifica linhas da planilha como produtos ou serviços do MEI.
    Recebe um array de objetos com campos: name, cost, price, desired_margin.
    Retorna JSON com os produtos classificados.
    """
    products: list[dict] = []
    errors: list[str] = []

    for i, row in enumerate(rows):
        try:
            item = ProductItem.model_validate(row)
            products.append(item.model_dump())
        except ValidationError as e:
            errors.append(f"Linha {i}: {e.errors()}")

    return json.dumps({"products": products, "errors": errors}, ensure_ascii=False)


@tool(args_schema=EmployeeInput)
def classify_employees(rows: list[dict]) -> str:
    """Classifica linhas da planilha como colaboradores ou funcionários do MEI.
    Recebe um array de objetos com campos: name, contract_type, salary, charges.
    Retorna JSON com os colaboradores classificados.
    """
    employees: list[dict] = []
    errors: list[str] = []

    for i, row in enumerate(rows):
        try:
            item = EmployeeItem.model_validate(row)
            employees.append(item.model_dump())
        except ValidationError as e:
            errors.append(f"Linha {i}: {e.errors()}")

    return json.dumps({"employees": employees, "errors": errors}, ensure_ascii=False)


TOOLS: list[BaseTool] = [
classify_transactions,
classify_products,
classify_employees
]
TOOLS_BY_NAME: dict[str, BaseTool] = {t.name: t for t in TOOLS}

#Serio mesmo o Otavio Miranda é foda o que na hora la no video fez essa compreeshion, para fazer tipo um mapper iteravel. Diferenciado o kra.
