"""
Testes unitários dos Nodes e do Router do grafo de importação.

"""
import json

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

from agents.import_agent import (
    assemble_result_node,
    parse_file_node,
    router,
)

# ══════════════════════════════════════════════
# parse_file_node
# ══════════════════════════════════════════════

class TestParseFileNode:
    def test_sets_total_rows(self, base_import_state: dict) -> None:
        result = parse_file_node(base_import_state)

        assert result["total_rows"] == len(base_import_state["raw_rows"])

    def test_adds_system_and_human_messages(self, base_import_state: dict) -> None:
        result = parse_file_node(base_import_state)
        msgs = result["messages"]

        assert isinstance(msgs[0], SystemMessage)
        assert isinstance(msgs[1], HumanMessage)


# ══════════════════════════════════════════════
# router
# ══════════════════════════════════════════════

class TestRouter:
    def test_routes_to_tool_node_when_tool_calls_present(self, base_import_state: dict) -> None:
        ai_msg = AIMessage(content="", tool_calls=[{"name": "classify_transactions", "args": {}, "id": "123", "type": "tool_call"}])
        state = {**base_import_state, "messages": [ai_msg]}

        assert router(state) == "tool_node"

    def test_routes_to_assemble_when_no_tool_calls(self, base_import_state: dict) -> None:
        ai_msg = AIMessage(content="Processamento concluído.")
        state = {**base_import_state, "messages": [ai_msg]}

        assert router(state) == "assemble_result_node"


# ══════════════════════════════════════════════
# assemble_result_node
# ══════════════════════════════════════════════

class TestAssembleResultNode:
    def _make_tool_message(self, content: dict) -> ToolMessage:
        return ToolMessage(content=json.dumps(content), tool_call_id="call-001", status="success")

    def test_assembles_transactions(self, base_import_state: dict) -> None:
        tool_msg = self._make_tool_message({
            "transactions": [{"type": "income", "amount": 100.0, "date": "2024-01-01"}],
            "errors": [],
        })
        state = {**base_import_state, "messages": [tool_msg], "total_rows": 1}
        result = assemble_result_node(state)

        assert len(result["result"]["transactions"]) == 1
        assert result["result"]["status"] == "success"

    def test_status_is_partial_when_errors_exist(self, base_import_state: dict) -> None:
        tool_msg = self._make_tool_message({
            "transactions": [{"type": "income", "amount": 100.0, "date": "2024-01-01"}],
            "errors": ["Linha 1: campo inválido"],
        })
        state = {**base_import_state, "messages": [tool_msg], "total_rows": 2}
        result = assemble_result_node(state)

        assert result["result"]["status"] == "partial"

    def test_sets_import_and_mei_ids(self, base_import_state: dict) -> None:
        state = {**base_import_state, "messages": [], "total_rows": 0}
        result = assemble_result_node(state)

        assert result["result"]["import_id"] == "imp-001"
        assert result["result"]["mei_id"] == "mei-abc"
