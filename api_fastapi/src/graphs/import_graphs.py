"""
Expõe o grafo de importação compilado como singleton.

deixei ele aqui pq eu quero ver um negocio no langgraph studio dps
"""
from langgraph.graph.state import CompiledStateGraph

from agents.import_agent import build_import_graph

import_graph: CompiledStateGraph = build_import_graph()
