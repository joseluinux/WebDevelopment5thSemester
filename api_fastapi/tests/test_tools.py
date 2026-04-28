"""
Testes unitários das Tools do agente de importação.

Não fazem chamadas ao LLM — testam apenas a lógica de validação
e transformação de cada ferramenta de classificação.
"""
import json

from agents.import_tools import (
    classify_employees,
    classify_products,
    classify_transactions,
)

# ══════════════════════════════════════════════
# classify_transactions
# ══════════════════════════════════════════════

class TestClassifyTransactions:
    def test_valid_income(self) -> None:
        rows = [{"type": "income", "amount": 500.0, "date": "2024-03-01", "description": "Venda"}]
        result = json.loads(classify_transactions.invoke({"rows": rows}))

        assert len(result["transactions"]) == 1
        assert result["transactions"][0]["type"] == "income"
        assert result["errors"] == []

    def test_invalid_type_generates_error(self) -> None:
        rows = [{"type": "transferencia", "amount": 100.0, "date": "2024-01-01"}]
        result = json.loads(classify_transactions.invoke({"rows": rows}))

        assert result["transactions"] == []
        assert len(result["errors"]) == 1

    def test_missing_required_fields_generates_error(self) -> None:
        rows = [{"type": "income"}]  # falta amount e date
        result = json.loads(classify_transactions.invoke({"rows": rows}))

        assert result["transactions"] == []
        assert len(result["errors"]) == 1


# ══════════════════════════════════════════════
# classify_products
# ══════════════════════════════════════════════

class TestClassifyProducts:
    def test_valid_product_full(self) -> None:
        rows = [{"name": "Camiseta", "cost": 20.0, "price": 50.0, "desired_margin": 0.6}]
        result = json.loads(classify_products.invoke({"rows": rows}))

        assert len(result["products"]) == 1
        assert result["products"][0]["name"] == "Camiseta"
        assert result["errors"] == []

    def test_missing_name_generates_error(self) -> None:
        rows = [{"cost": 10.0, "price": 30.0}]
        result = json.loads(classify_products.invoke({"rows": rows}))

        assert result["products"] == []
        assert len(result["errors"]) == 1


# ══════════════════════════════════════════════
# classify_employees
# ══════════════════════════════════════════════

class TestClassifyEmployees:
    def test_valid_employee_full(self) -> None:
        rows = [{"name": "João", "contract_type": "CLT", "salary": 2000.0, "charges": 400.0}]
        result = json.loads(classify_employees.invoke({"rows": rows}))

        assert len(result["employees"]) == 1
        assert result["employees"][0]["name"] == "João"
        assert result["errors"] == []

    def test_missing_name_generates_error(self) -> None:
        rows = [{"contract_type": "PJ", "salary": 5000.0}]
        result = json.loads(classify_employees.invoke({"rows": rows}))

        assert result["employees"] == []
        assert len(result["errors"]) == 1
