# 📅 Planejamento - Lumemei FastAPI Backend

**Data de Início:** 21 de abril de 2026  
**Status:** Em Planejamento  
**Owner:** Desenvolvedor Python (FastAPI)

---

## 🎯 Visão Geral

Este documento define a **ordem de execução**, **prazos** e **dependências** para implementação do backend FastAPI do projeto Lumemei.

### Timeline Total

- **Início:** 21 de abril de 2026
- **MVP Completo:** 19 de maio de 2026 (28 dias)
- **MVP+ Simulações:** 26 de maio de 2026 (35 dias)
- **MVP+ Importação:** 02 de junho de 2026 (42 dias)

---

## 📊 Matriz de Dependências

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 0: Setup Base (Bloqueador de tudo!)                   │
│ ├─ 21/04 - 22/04 (2 dias)                                  │
│ └─ Precisa estar 100% pronta antes de qualquer outra fase │
└──────────────────────┬──────────────────────────────────────┘
                       │ (bloqueia)
          ┌────────────┴────────────┐
          │                         │
    ┌─────▼──────────┐     ┌───────▼──────────┐
    │ FASE 1: Chat   │     │ Pode mockar em   │
    │ 23/04 - 28/04  │     │ paralelo!        │
    │ (5-7 dias)     │     │ (testes locais)  │
    │ ✅ CRÍTICO MVP │     │                  │
    └─────┬──────────┘     └──────────────────┘
          │ (bloqueia FASE 4)
    ┌─────▼──────────────────────────────────────┐
    │ FASE 2: Categorização                      │
    │ 28/04 - 30/04 (3 dias)                    │
    │ ✅ CRÍTICO (necessária para FASE 4)        │
    │ ⚠️ Depende de FASE 1 (GeminiService)       │
    └─────┬──────────────────────────────────────┘
          │ (bloqueia FASE 4)
    ┌─────▼──────────────────────────────────────┐
    │ FASE 4: Importação Inteligente             │
    │ 01/05 - 05/05 (4-5 dias)                  │
    │ ⚠️ MVP+ (pode ser paralelo com FASE 3)     │
    │ ⚠️ Depende de FASE 1 + FASE 2              │
    └─────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────┐
    │ FASE 3: Simulações Financeiras             │
    │ 29/04 - 02/05 (3-4 dias)                  │
    │ ⚠️ MVP+ (paralelo com FASE 2)              │
    │ ⚠️ Depende de FASE 1 (GeminiService)       │
    └─────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────┐
    │ FASE 5: RAG (Depois do MVP)                │
    │ 06/05+ (2-3 dias quando necessário)        │
    │ ❌ NÃO-CRÍTICO (MVP+)                       │
    │ ⚠️ Depende de FASE 1 (GeminiService)       │
    └─────────────────────────────────────────────┘
```

---

## 📅 FASE 0: Setup Base ⚙️

**Status:** ⏳ Não iniciado  
**Data de Início:** 21 de abril de 2026  
**Data de Conclusão:** 22 de abril de 2026  
**Duração:** 2 dias  
**Prioridade:** 🔴 CRÍTICA (bloqueador de tudo)

### Dependências

- ✅ Nenhuma (pode começar imediatamente)

### Arquivos a Criar

- [ ] `src/config.py` (HOJE - 21/04)
- [ ] `src/domain/interfaces.py` (HOJE - 21/04)
- [ ] `src/shared/logger.py` (HOJE - 21/04)
- [ ] `src/shared/exceptions.py` (AMANHÃ - 22/04)
- [ ] `src/schemas.py` (AMANHÃ - 22/04)
- [ ] `src/main.py` (AMANHÃ - 22/04)
- [ ] `requirements.txt` (AMANHÃ - 22/04)
- [ ] `.env.example` (AMANHÃ - 22/04)

### Checklist

#### 21/04 (Segunda) - Manhã

- [ ] Criar `src/config.py`
  - Settings com pydantic-settings
  - Variáveis GEMINI_API_KEY, CSHARP_API_URL, etc
  - Ler de `.env`

- [ ] Criar `src/domain/interfaces.py`
  - LLMProvider (generate_response)
  - ContextProvider (get_mei_context)
  - WebhookNotifier (notify)

- [ ] Criar `src/shared/logger.py`
  - Logger usando `logging` padrão
  - Configuração básica

#### 21/04 (Segunda) - Tarde

- [ ] Criar `src/shared/exceptions.py`
  - LumemeiException (base)
  - ContextFetchError
  - GeminiError
  - WebhookError

#### 22/04 (Terça) - Manhã

- [ ] Criar `src/schemas.py`
  - ChatRequest, SimulationRequest, CategorizeRequest
  - TaskResponse, ChatResponse
  - Usar Field() para validação

- [ ] Criar `src/main.py`
  - FastAPI app básico
  - CORS setup
  - Health check
  - Import de routes (ainda não existe)

#### 22/04 (Terça) - Tarde

- [ ] Criar `requirements.txt`
  - fastapi
  - uvicorn
  - pydantic-settings
  - google-generativeai
  - httpx
  - python-multipart

- [ ] Criar `.env.example`
  - Template com todas as variáveis

### Deliverable

✅ Estrutura base funcionando: `python -m uvicorn src.main:app --reload`

---

## 📅 FASE 1: MVP Core - Chat IA 💬

**Status:** ⏳ Não iniciado  
**Data de Início:** 23 de abril de 2026  
**Data de Conclusão:** 28 de abril de 2026  
**Duração:** 5-7 dias  
**Prioridade:** 🔴 CRÍTICA (MVP Principal)

### Dependências

```
┌─────────────────────────────┐
│ FASE 0 (Setup Base)         │ ← DEVE ESTAR 100% PRONTA
├─────────────────────────────┤
│ ✅ config.py                │
│ ✅ interfaces.py            │
│ ✅ logger.py                │
│ ✅ exceptions.py            │
│ ✅ schemas.py               │
│ ✅ main.py                  │
└─────────────────────────────┘
```

### Subtarefas em Ordem

#### 23/04 (Quarta) - Dia 1

**Tarefas:** Services de Integração (primeira metade)

- [ ] Criar `src/services/gemini_service.py`
  - Classe `GeminiService` implementa `LLMProvider`
  - `__init__()`: configura genai com GEMINI_API_KEY
  - `async generate_response(prompt: str, temperature: float) -> str`
  - Tratamento de erros com try/except
  - Logging de chamadas

**Estimativa:** 3-4 horas  
**Testes:** Mock local com prompt simples

#### 24/04 (Quinta) - Dia 2

**Tarefas:** Services de Integração (segunda metade)

- [ ] Criar `src/services/context_service.py`
  - Classe `ContextService` implementa `ContextProvider`
  - `async get_mei_context(mei_id: str) -> dict`
  - GET para `{CSHARP_API_URL}/api/context/{mei_id}`
  - Header: Authorization Bearer
  - Tratamento de erros (timeout, 404, 500)
  - Logging de requisições

**Estimativa:** 3-4 horas  
**Testes:** Mockar resposta do C# com httpx

- [ ] Criar `src/services/webhook_service.py`
  - Classe `WebhookService` implementa `WebhookNotifier`
  - `async notify(callback_url, task_id, status, data) -> bool`
  - POST para callback_url
  - Header: X-Webhook-Secret
  - Timeout 30s
  - Retry logic (3 tentativas com backoff)
  - Logging de sucesso/falha

**Estimativa:** 3-4 horas  
**Testes:** Mockar callback com webhook.site

#### 25/04 (Sexta) - Dia 3

**Tarefas:** Agent e Graph

- [ ] Criar `src/agents/base_agent.py`
  - Classe abstrata `BaseAgent`
  - `__init__(name: str)`
  - `@abstractmethod async execute(input_data: dict) -> Any`

**Estimativa:** 1-2 horas

- [ ] Criar `src/agents/chat_agent.py`
  - Classe `ChatAgent` herda `BaseAgent`
  - `__init__(gemini_service, context_service)`
  - `async execute(input_data: dict) -> str`
  - Lógica:
    1. Busca mei_context via ContextService
    2. Monta prompt com contexto
    3. Chama GeminiService
    4. Retorna resposta
  - `_build_prompt(user_message, context) -> str`
  - Logging em cada step

**Estimativa:** 4-5 horas  
**Testes:** Teste local com mock de context

#### 26/04 (Sábado) - Dia 4

**Tarefas:** Graph e primeiras rotas

- [ ] Criar `src/graphs/chat_graph.py`
  - Classe `ChatGraph`
  - `__init__(chat_agent, webhook_service)`
  - `async execute(user_message, mei_id, callback_url) -> dict`
  - Lógica:
    1. Valida inputs
    2. Executa ChatAgent
    3. Try/except com logging
    4. Chama WebhookService.notify()
    5. Retorna resultado
  - Tratamento de erros em cada stage

**Estimativa:** 4-5 horas  
**Testes:** Teste com mocks de todos os serviços

- [ ] Início de `src/api/routes.py`
  - APIRouter setup
  - Imports iniciais
  - Dependências simples (get_gemini_service, etc)

**Estimativa:** 1-2 horas

#### 27-28/04 (Domingo-Segunda) - Dias 5-6

**Tarefas:** Routes completas e testes

- [ ] Completar `src/api/routes.py`
  - POST /api/chat
    - Request: ChatRequest
    - Response: TaskResponse
    - background_tasks.add_task(chat_graph.execute)
  - POST /health (já existe em main.py)
  - GET /docs (automático do FastAPI)

**Estimativa:** 2-3 horas

- [ ] Testes e validação
  - Teste local com uvicorn
  - Testar POST /api/chat com dados fake
  - Validar schemas (Pydantic)
  - Validar logging
  - Checklist:
    - [ ] Servidor inicia sem erros
    - [ ] GET /health retorna 200
    - [ ] GET /docs carrega Swagger
    - [ ] POST /chat aceita request válido
    - [ ] POST /chat retorna task_id

**Estimativa:** 3-4 horas

### Deliverable

✅ Endpoint `/api/chat` funcionando:

- Recebe POST com message, mei_id, callback_url
- Enfileira processamento em background
- Retorna task_id imediatamente
- Processa com Gemini
- Chama webhook do C# ao terminar

**Teste Final:**

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Como estão meus lucros?",
    "mei_id": "123",
    "callback_url": "https://seu-c-sharp.com/api/callback"
  }'
```

---

## 📅 FASE 2: Categorização Inteligente 🏷️

**Status:** ⏳ Não iniciado  
**Data de Início:** 28 de abril de 2026  
**Data de Conclusão:** 30 de abril de 2026  
**Duração:** 3 dias  
**Prioridade:** 🟡 IMPORTANTE (necessária para FASE 4)

### Dependências

```
DEVE TER COMPLETADO:
├─ FASE 0 ✅
├─ FASE 1 ✅ (GeminiService reutilizado)
└─ services/gemini_service.py ✅
```

### Subtarefas em Ordem

#### 28/04 (Segunda) - Dia 1

**Tarefas:** CategorizerAgent

- [ ] Criar `src/agents/categorizer_agent.py`
  - Classe `CategorizerAgent` herda `BaseAgent`
  - `__init__(gemini_service)`
  - `async execute(input_data: dict) -> dict`
  - Lógica:
    1. Recebe transaction_description
    2. Monta prompt com categorias (Receita, Despesa, etc)
    3. Chama GeminiService
    4. Parse resposta para JSON: {category, confidence}
    5. Retorna dict
  - Tratamento de erros no parse

**Estimativa:** 4-5 horas  
**Testes:** Teste local com exemplos de transações

#### 29/04 (Terça) - Dia 2

**Tarefas:** Routes para categorização

- [ ] Adicionar em `src/api/routes.py`
  - POST /api/categorize
    - Request: CategorizeRequest (transaction, mei_id)
    - Response: CategorizeResponse (category, confidence)
    - ✅ SÍNCRONO (não precisa background)
    - Chama CategorizerAgent direto

**Estimativa:** 2-3 horas

#### 30/04 (Quarta) - Dia 3

**Tarefas:** Testes e validação

- [ ] Testes
  - [ ] Testar categorização de 5-10 transações diferentes
  - [ ] Validar resposta JSON
  - [ ] Validar confiança (0-1)
  - [ ] Teste de erro (entrada inválida)

**Estimativa:** 2-3 horas

### Deliverable

✅ Endpoint `/api/categorize` funcionando:

- POST com description e mei_id
- Retorna categoria e confiança
- Rápido (síncrono)

---

## 📅 FASE 3: Simulações Financeiras 📊

**Status:** ⏳ Não iniciado  
**Data de Início:** 29 de abril de 2026  
**Data de Conclusão:** 02 de maio de 2026  
**Duração:** 3-4 dias  
**Prioridade:** 🟠 MVP+ (paralelo com FASE 2)

### Dependências

```
DEVE TER COMPLETADO:
├─ FASE 0 ✅
├─ FASE 1 ✅ (GeminiService + ContextService)
└─ services/gemini_service.py ✅
└─ services/context_service.py ✅
```

### Nota

⚠️ **PODE COMEÇAR PARALELO COM FASE 2** (29/04)  
Não precisa esperar categorização estar pronta.

### Subtarefas em Ordem

#### 29/04 (Terça) - Dia 1

**Tarefas:** SimulatorAgent

- [ ] Criar `src/agents/simulator_agent.py`
  - Classe `SimulatorAgent` herda `BaseAgent`
  - `__init__(gemini_service, context_service)`
  - `async execute(input_data: dict) -> str`
  - Lógica:
    1. Busca mei_context
    2. Recebe scenario_description
    3. Monta prompt com contexto + cenário
    4. Chama GeminiService
    5. Retorna resposta

**Estimativa:** 4-5 horas  
**Testes:** Teste local com cenários exemplo

#### 30/04 (Quarta) - Dia 2

**Tarefas:** SimulationGraph

- [ ] Criar `src/graphs/simulation_graph.py`
  - Classe `SimulationGraph`
  - `__init__(simulator_agent, webhook_service)`
  - `async execute(scenario_desc, mei_id, callback_url)`
  - Similar ao ChatGraph (background + webhook)

**Estimativa:** 3-4 horas

#### 01/05 (Quinta) - Dia 3

**Tarefas:** Routes

- [ ] Adicionar em `src/api/routes.py`
  - POST /api/simulate
    - Request: SimulationRequest (scenario_description, mei_id, callback_url)
    - Response: TaskResponse (task_id, status, message)
    - background_tasks.add_task()

**Estimativa:** 2-3 horas

#### 02/05 (Sexta) - Dia 4

**Tarefas:** Testes

- [ ] Testes
  - [ ] Testar 3-5 cenários diferentes
  - [ ] Validar webhook é chamado
  - [ ] Validar response JSON

**Estimativa:** 2-3 horas

### Deliverable

✅ Endpoint `/api/simulate` funcionando:

- POST com scenario_description, mei_id, callback_url
- Retorna task_id
- Processa em background
- Webhook ao terminar

---

## 📅 FASE 4: Importação Inteligente 📤

**Status:** ⏳ Não iniciado  
**Data de Início:** 01 de maio de 2026  
**Data de Conclusão:** 05 de maio de 2026  
**Duração:** 4-5 dias  
**Prioridade:** 🟡 MVP+ (pode começar paralelo com FASE 3)

### Dependências

```
DEVE TER COMPLETADO:
├─ FASE 0 ✅
├─ FASE 1 ✅ (GeminiService)
├─ FASE 2 ✅ (CategorizerAgent)
└─ services/gemini_service.py ✅
```

### Subtarefas em Ordem

#### 01/05 (Quinta) - Dia 1

**Tarefas:** ImportService

- [ ] Criar `src/services/import_service.py`
  - Classe `ImportService`
  - `__init__(gemini_service, webhook_service)`
  - `async process_csv_import(file_bytes, mei_id, callback_url)`
  - Lógica:
    1. Cria tempfile
    2. Parse CSV com csv.DictReader
    3. Loop em cada linha
    4. Categoriza com CategorizerAgent
    5. Webhook com resultado
    6. Deleta tempfile

**Estimativa:** 4-5 horas  
**Testes:** Teste com CSV de exemplo

#### 02-03/05 (Sexta-Sábado) - Dia 2-3

**Tarefas:** ImportGraph + Routes

- [ ] Criar `src/graphs/import_graph.py`
  - Classe `ImportGraph`
  - Similar ao ChatGraph

**Estimativa:** 2-3 horas

- [ ] Adicionar em `src/api/routes.py`
  - POST /api/import
    - Request: file (UploadFile), mei_id, callback_url
    - Response: TaskResponse
    - background_tasks.add_task()

**Estimativa:** 2-3 horas

#### 04-05/05 (Domingo-Segunda) - Dia 4-5

**Tarefas:** Testes

- [ ] Testes
  - [ ] CSV pequeno (10 linhas)
  - [ ] CSV grande (1000 linhas)
  - [ ] CSV com dados inválidos
  - [ ] Validar categorização de cada linha
  - [ ] Validar webhook é chamado

**Estimativa:** 3-4 horas

### Deliverable

✅ Endpoint `/api/import` funcionando:

- POST multipart/form-data com arquivo CSV
- Valida formato
- Processa em background
- Categoriza cada linha com CategorizerAgent
- Webhook ao terminar com resultado

---

## 📅 FASE 5: RAG (MVP+) 📚

**Status:** ⏳ Não iniciado  
**Data de Início:** 06 de maio de 2026 (quando necessário)  
**Data de Conclusão:** 08 de maio de 2026  
**Duração:** 2-3 dias  
**Prioridade:** 🟢 MVP+ (depois de tudo)

### Dependências

```
PODE COMEÇAR QUANDO:
├─ FASE 0 ✅
├─ FASE 1 ✅ (ChatAgent)
└─ Gemini Embeddings API disponível
```

### Subtarefas em Ordem

#### 06/05 (Terça) - Dia 1

- [ ] Criar `src/rag/vector_store.py`
- [ ] Criar `src/rag/document_loader.py`
- [ ] Criar `src/rag/embeddings_config.py`

#### 07/05 (Quarta) - Dia 2

- [ ] Integrar RAG no ChatAgent

#### 08/05 (Quinta) - Dia 3

- [ ] Testes com documentos reais

### Deliverable

✅ RAG funcionando no chat (busca documentos relevantes)

---

## 🔗 Sincronização com C#

### O que o C# precisa entregar ANTES de você:

| Data  | Funcionalidade                                    | Criticidade |
| ----- | ------------------------------------------------- | ----------- |
| 23/04 | GET `/api/context/{mei_id}`                       | 🔴 CRÍTICA  |
| 23/04 | POST `/api/ai-callback/chat` (webhook receiver)   | 🔴 CRÍTICA  |
| 01/05 | POST `/api/ai-callback/import` (webhook receiver) | 🟡 MVP+     |
| 01/05 | Import management APIs                            | 🟡 MVP+     |

### Negociar com amigo em C#:

```
"Preciso de GET /api/context/{mei_id} até 23/04 para começar testes."
"Preciso de POST /api/ai-callback/* até a mesma data."
```

---

## 📊 Cronograma Visual

```
Abril 2026
|  D  |  S  |  T  |  Q  |  Q  |  S  |  D  |
|-----|-----|-----|-----|-----|-----|-----|
| 21  | 22  | 23  | 24  | 25  | 26  | 27  |
|FASE0|FASE0|FASE1|FASE1|FASE1|FASE1|FASE1|
|     |     |     |     |     |     |     |
| 28  | 29  | 30  | 01  | 02  | 03  | 04  |
|FASE1|F2/3 |F2/3 |F2/3/4|F3/4 |F3/4 |DESCAN|
|     |     |     |     |     |     |SO   |
```

```
Maio 2026
|  D  |  S  |  T  |  Q  |  Q  |  S  |  D  |
|-----|-----|-----|-----|-----|-----|-----|
| 05  | 06  | 07  | 08  | 09  | 10  | 11  |
|TESTES|FASE5|FASE5|FASE5|TESTES|TESTES|PRONTO|
|     |     |     |     |     |     |MVP! |
```

---

## ✅ Checklist Global

### FASE 0 (21-22/04)

- [ ] Estrutura base funcionando
- [ ] Server inicia: `uvicorn src.main:app --reload`
- [ ] GET /health retorna 200
- [ ] GET /docs funciona

### FASE 1 (23-28/04)

- [ ] POST /api/chat funciona end-to-end
- [ ] Webhook é chamado ao terminar
- [ ] Testes com C# real (se disponível)

### FASE 2 (28-30/04)

- [ ] POST /api/categorize funciona
- [ ] Categorização acurada

### FASE 3 (29/04-02/05)

- [ ] POST /api/simulate funciona
- [ ] Webhook é chamado

### FASE 4 (01-05/05)

- [ ] POST /api/import funciona
- [ ] CSV parseado corretamente
- [ ] Cada linha categorizada

### FASE 5 (06-08/05)

- [ ] RAG integrado ao chat
- [ ] Documentos recuperados relevantes

### TESTES FINAIS (09-11/05)

- [ ] Todos endpoints testados
- [ ] Integração com C# testada
- [ ] Webhooks funcionando
- [ ] Documentação completa

---

## 🚨 Riscos e Mitigações

| Risco                                 | Impacto  | Mitigação                       |
| ------------------------------------- | -------- | ------------------------------- |
| C# não entrega `/api/context` a tempo | 🔴 Alto  | Mockar resposta com dados fake  |
| Gemini API cai                        | 🔴 Alto  | Tratamento de erro, retry logic |
| CSV muito grande (timeout)            | 🟡 Médio | Chunking de dados               |
| WebhookService falha                  | 🟡 Médio | Retry com backoff exponencial   |
| RAG embedding caro                    | 🟠 Baixo | Implementar depois (não MVP)    |

---

## 📝 Notas Importantes

1. **Datas são estimativas**: Podem variar ±1-2 dias
2. **Comece hoje**: FASE 0 deve ser concluída até 22/04
3. **Comunique com C#**: Certifique-se que endpoints estão prontos
4. **Testes locais**: Use mock/fake data enquanto C# não está pronto
5. **Commit frequente**: Commite ao terminar cada dia
6. **Logs**: Log tudo para debug depois

---

## 📞 Contatos e Acompanhamento

- **Seu amigo C#:** Sincronizar endpoints no mínimo 2x/semana
- **Status diário:** Commit com mensagem clara do progresso
- **Problemas:** Documentar e comunicar imediatamente

---

## 🎉 Conclusão

Seguindo este planejamento, você terá:

- **22 de abril:** Setup completo pronto
- **28 de abril:** MVP Chat funcionando
- **30 de abril:** Categorização funcionando
- **02 de maio:** Simulações funcionando
- **05 de maio:** Importação funcionando
- **08 de maio:** RAG funcional (MVP+)
- **11 de maio:** Sistema completo testado e pronto para produção

**Boa sorte! 🚀**
