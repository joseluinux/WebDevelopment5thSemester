"""
Testes de integração do endpoint FastAPI de importação.
"""
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from schemas.schemas import ImportResponse, TransactionItem


def _make_success_response() -> ImportResponse:
    return ImportResponse(
        import_id="imp-001",
        mei_id="mei-abc",
        transactions=[
            TransactionItem(type="income", amount=1500.0, date="2024-01-10", description="Venda")
        ],
        products=[],
        employees=[],
        total_rows=1,
        processed_rows=1,
        errors=[],
        status="success",
    )


VALID_PAYLOAD = {
    "import_id": "imp-001",
    "mei_id": "mei-abc",
    "file_url": "",
}

class TestImportEndpoint:
    def test_returns_200_with_valid_payload(self, client: TestClient) -> None:
        with patch(
            "api.routes._import_service.process",
            new=AsyncMock(return_value=_make_success_response()),
        ):
            response = client.post("/api/import/process", json=VALID_PAYLOAD)

        assert response.status_code == 200

    def test_returns_422_when_body_is_empty(self, client: TestClient) -> None:
        response = client.post("/api/import/process", json={})

        assert response.status_code == 422

    def test_returns_500_when_service_raises_exception(self, client: TestClient) -> None:
        with patch(
            "api.routes._import_service.process",
            new=AsyncMock(side_effect=RuntimeError("Erro interno simulado")),
        ):
            response = client.post("/api/import/process", json=VALID_PAYLOAD)

        assert response.status_code == 500



class TestHealthEndpoint:
    def test_health_returns_200(self, client: TestClient) -> None:
        response = client.get("/health")

        assert response.status_code == 200
