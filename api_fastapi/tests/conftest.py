"""
Fixtures compartilhadas entre todos os testes.
"""
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture()
def client() -> TestClient:
    """Cliente HTTP síncrono do FastAPI (não requer pytest-asyncio)."""
    return TestClient(app, raise_server_exceptions=False)

@pytest.fixture()
def sample_transaction_rows() -> list[dict]:
    return [
        {"type": "income", "amount": 1500.0, "date": "2024-01-10", "description": "Venda de produto", "category": "Vendas"},
        {"type": "expense", "amount": 300.0, "date": "2024-01-15", "description": "Conta de luz", "category": "Utilidades"},
    ]


@pytest.fixture()
def sample_product_rows() -> list[dict]:
    return [
        {"name": "Camiseta Básica", "cost": 20.0, "price": 50.0, "desired_margin": 0.6},
        {"name": "Consultoria", "price": 200.0},
    ]


@pytest.fixture()
def sample_employee_rows() -> list[dict]:
    return [
        {"name": "João Silva", "contract_type": "CLT", "salary": 2000.0, "charges": 500.0},
        {"name": "Maria Freelancer", "contract_type": "PJ", "salary": 3000.0},
    ]


@pytest.fixture()
def base_import_state(sample_transaction_rows: list[dict]) -> dict:
    """Estado inicial mínimo para testes dos nodes."""
    return {
        "messages": [],
        "import_id": "imp-001",
        "mei_id": "mei-abc",
        "raw_rows": sample_transaction_rows,
        "total_rows": 0,
        "errors": [],
        "result": None,
    }
