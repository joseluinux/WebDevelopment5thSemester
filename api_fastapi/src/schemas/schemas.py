
from enum import Enum

from pydantic import BaseModel, field_validator, model_validator

# ──────────────────────────────────────────────
# Entidades que o agente classifica
# ──────────────────────────────────────────────

# Mapper bem legal que vai deixar mais facil para IA se não ia ficar merda para ela classificar as coisas. E é aquilo qualquer coisa é so tirar e colocar algum item, é algum principio do SOLID que não lembro o nome.
_TYPE_MAP = {
    "receita": "income",
    "entrada": "income",
    "crédito": "income",
    "credito": "income",
    "income": "income",
    "despesa": "expense",
    "saída": "expense",
    "saida": "expense",
    "débito": "expense",
    "debito": "expense",
    "expense": "expense",
    "custo": "expense",
    "gasto": "expense",
}

class TransactionEnum(Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionItem(BaseModel):
    """Representa uma transação financeira (receita ou despesa).

    Suporta múltiplos modelos de planilha:
    - Valor negativo → expense (Livro Caixa)
    - Colunas separadas (entry/exit) → type inferido pelo LLM
    - Nome PT-BR no type: "Receita"/"Despesa" → normalizado
    """

    type: TransactionEnum | str
    category: str | None = None
    amount: float
    description: str | None = None
    date: str  # ISO: YYYY-MM-DD

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: dict) -> dict:
        """Normaliza campos antes da validação:
        - Valor negativo → amount positivo + type='expense'
        - Nomes PT-BR no type → padrão interno
        """
        amount = data.get("amount")
        tipo = data.get("type", "")

        # Normaliza type PT-BR
        if isinstance(tipo, str):
            data["type"] = _TYPE_MAP.get(tipo.lower().strip(), tipo)

        # Valor negativo implica despesa
        if isinstance(amount, (int, float)) and amount < 0:
            data["amount"] = abs(amount)
            data["type"] = "expense"
        return data

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: TransactionEnum | str) -> TransactionEnum:
        if isinstance(v, str):
            v = TransactionEnum(v.lower())
        allowed = {TransactionEnum.INCOME, TransactionEnum.EXPENSE}
        if v not in allowed:
            raise ValueError(f"type deve ser 'income' ou 'expense', recebido: '{v}'")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 0:
            raise ValueError("amount deve ser positivo; use o campo 'type' para indicar despesa")
        return v


class ProductItem(BaseModel):
    """Representa um produto ou serviço do MEI."""

    name: str
    cost: float | None = None
    price: float | None = None
    desired_margin: float | None = None


class EmployeeItem(BaseModel):
    """Representa um colaborador/funcionário do MEI."""

    name: str
    contract_type: str | None = None
    salary: float | None = None
    charges: float | None = None


#Aqui é o que o C# vai envia para o FastAPI, vamo ter q ver isso melhor
class ImportRequest(BaseModel):
    """Payload enviado pelo backend C# para iniciar o processamento de importação."""

    import_id: str
    mei_id: str
    file_url: str  # URL pública temporária do Supabase Storage


#E esse é o modelo de resposta que o C# vai pegar e se o user gostar ele salva no banco jogando aquele submit legal no formulário la no nosso frontend vibecodado.

class StatusEnum(Enum):
    SUCCESS = "success"
    PARTIAL = "partial"
    ERROR = "error"

class ImportResponse(BaseModel):
    """Resultado estruturado retornado ao backend C# após processamento."""

    import_id: str
    mei_id: str
    transactions: list[TransactionItem]
    products: list[ProductItem]
    employees: list[EmployeeItem]
    total_rows: int
    processed_rows: int
    errors: list[str]
    status: StatusEnum | str
