# Guia — do template genérico até um projeto guiado (Django ou FastAPI)

Este template já vem com:

- Layout `src/`
- Dependências e build em [pyproject.toml](pyproject.toml)
- Lock do uv em [uv.lock](uv.lock)
- Ruff + Pyright + Pytest configurados
- Exemplo de `.env` em [.env-example](.env-example)

Meta: clonar → subir ambiente → ajustar TOML → criar Django/FastAPI → 1 entrega mínima (rota + teste + checks).

---

## 1) Do clone ao ambiente pronto (sempre)

### 1.1 Clonar e entrar na pasta

- `git clone <URL_DO_TEMPLATE> <NOME_DO_PROJETO>`
- `cd <NOME_DO_PROJETO>`

### 1.2 Sincronizar ambiente e dependências (dev incluso)

- `uv sync --all-extras`

### 1.3 Criar `.env`

- PowerShell (Windows): `Copy-Item .env-example .env`
- Bash (Linux/macOS/Git Bash): `cp .env-example .env`

### 1.4 Sanidade do template (recomendado antes de mexer)

- `uv run python src/main.py`
- `uv run ruff format .`
- `uv run ruff check .`
- `uv run pyright`
- `uv run pytest`

### 1.5 Limpeza (se necessário)

Se existir `*.egg-info` dentro de `src/` (ex.: `src/project3_uv.egg-info/`), apague.

- PowerShell: `Remove-Item -Recurse -Force src\project3_uv.egg-info`
- Bash: `rm -rf src/project3_uv.egg-info`

---

## 2) O que você DEVE ajustar no TOML no começo

Edite [pyproject.toml](pyproject.toml) e ajuste estes pontos antes de iniciar Django/FastAPI.

### 2.1 Identidade do projeto

No `[project]`:

- `name`, `description`, `authors`
- `requires-python` (mantendo consistente com Ruff/Pyright)
- `dependencies` (você vai adicionar Django/FastAPI aqui via `uv add`)

Exemplo:

```toml
[project]
name = "minha-api"
version = "0.1.0"
description = "Minha API"
readme = "README.md"
license = "MIT"
authors = [{ name = "Seu Nome", email = "seu@email.com" }]
requires-python = ">=3.12"
dependencies = [
  "python-dotenv>=1.1.0",
]
```

### 2.2 Consistência de versões de Python (obrigatório)

Deixe alinhado:

- `[project].requires-python` (ex.: `>=3.12`)
- `[tool.ruff].target-version` (ex.: `py312`)
- `[tool.pyright].pythonVersion` (ex.: `"3.12"`)

### 2.3 Renomear o pacote Python do `src/` (recomendado)

Hoje o exemplo é `src/my_package/`. Quando você trocar para `src/app/` (ou outro nome), ajuste:

```toml
[tool.ruff.lint.isort]
known-first-party = ["app"]
```

Se você usa `[project.scripts]`, também sincronize:

```toml
[project.scripts]
minha_api = "app.algum_modulo:alguma_funcao"
```

(Se você não vai ter CLI, pode remover/ignorar scripts.)

### 2.4 Ajuste específico: Django (migrations)

Quando começar a gerar migrações, é normal excluir do Ruff:

```toml
[tool.ruff]
exclude = ["venv", ".venv", "env", ".env", "node_modules", "__pycache__", "**/migrations/**"]
```

---

## 3) Projeto guiado — FastAPI (passo a passo)

### 3.1 Instalar dependências (e travar no lock)

- `uv add fastapi "uvicorn[standard]"`
- `uv sync --all-extras`

Opcional (adicione só se usar):

- `uv add pydantic-settings`
- `uv add sqlalchemy` (ou `uv add sqlmodel`)
- `uv add alembic` (se SQLAlchemy)

### 3.2 Ajustes no TOML para FastAPI

- Garanta o pacote principal (ex.: `app`) em:

```toml
[tool.ruff.lint.isort]
known-first-party = ["app"]
```

### 3.3 Estrutura mínima (guiada)

Crie uma estrutura simples (ex.: pacote `app`):

- `src/app/api/main.py`
- `src/app/api/routers/health.py`
- `tests/test_health.py`

PowerShell (Windows):

- `New-Item -ItemType Directory -Force src\app\api\routers | Out-Null`
- `New-Item -ItemType Directory -Force tests | Out-Null`
- `New-Item -ItemType File -Force src\app\__init__.py | Out-Null`
- `New-Item -ItemType File -Force src\app\api\__init__.py | Out-Null`
- `New-Item -ItemType File -Force src\app\api\routers\__init__.py | Out-Null`

### 3.4 Subir o servidor

Exemplo (ajuste o import conforme sua estrutura):

- `uv run uvicorn src.main:app --reload --host 127.0.0.1 --port 8000`

### 3.5 Primeira entrega mínima (guiada)

Critério de “tá pronto pra continuar”:

- Rota `/health` funcionando
- 1 teste chamando `/health`
- Tudo passando:
  - `uv run ruff format .`
  - `uv run ruff check .`
  - `uv run pyright`
  - `uv run pytest`

---

## 4) Projeto guiado — Django (passo a passo)

### 4.1 Instalar dependências (e travar no lock)

- `uv add django`
- `uv sync --all-extras`

Opcional (adicione só se usar):

- Postgres: `uv add psycopg[binary]`
- Settings por env “estilo Django”: `uv add django-environ`

### 4.2 Ajustes no TOML para Django

Recomendado excluir migrações do Ruff:

```toml
[tool.ruff]
exclude = ["venv", ".venv", "env", ".env", "node_modules", "__pycache__", "**/migrations/**"]
```

### 4.3 Criar o projeto Django dentro de `src/`

Para manter o layout do template:

- `uv run django-admin startproject config src`

Isso cria:

- `src/manage.py`
- `src/config/` (settings/asgi/wsgi/urls)

### 4.4 Carregar `.env` cedo no Django

Este template já usa `python-dotenv` (veja o padrão em [src/my_package/my_module.py](src/my_package/my_module.py)).
No Django, carregue o `.env` cedo (antes de ler settings), normalmente em:

- `src/manage.py`
- `src/config/asgi.py`
- `src/config/wsgi.py`

### 4.5 Rodar migrações e subir

- `uv run python src/manage.py migrate`
- `uv run python src/manage.py runserver`

### 4.6 Primeiro app (primeira entrega guiada)

Criar app `users` dentro de `src/`:

- `uv run python src/manage.py startapp users src/users`

Entrega mínima (guiada):

- App em `INSTALLED_APPS`
- 1 view/endpoint simples
- 1 teste passando (escolha A ou B)

Testes:

- A) Runner do Django:
  - `uv run python src/manage.py test`
- B) Pytest (padronizar):
  - `uv add pytest-django`
  - configurar `DJANGO_SETTINGS_MODULE`
  - `uv run pytest`

---

## 5) Fluxo que eu recomendo (sempre)

1. Bootstrap: `uv sync --all-extras` + `.env`
2. Ajuste do TOML: `name`, versões do Python, `known-first-party`
3. Criar esqueleto do framework (FastAPI ou Django)
4. Primeira entrega: 1 rota + 1 teste
5. Qualidade sempre antes de seguir:
   - `uv run ruff format .`
   - `uv run ruff check .`
   - `uv run pyright`
   - `uv run pytest`
