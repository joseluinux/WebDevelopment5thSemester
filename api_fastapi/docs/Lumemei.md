PROJETO – LUMEMEI

Projeto foda dos crias das Facens

 
SUMÁRIO
1 Introdução
2 Objetivo
3 Escopo e Funcionalidades (O que o sistema deve fazer)
4 Arquitetura Técnica (Visão geral)
5 Componentes Críticos (Requisitos não funcionais)
6 Telas e Experiência do Usuário (UX)
7 Roadmap sugerido (MVP e evolução)

 
1 INTRODUÇÃO
Este documento descreve, de forma objetiva, a visão do projeto de uma plataforma SaaS voltada a Microempreendedores Individuais (MEI) no Brasil. O sistema tem como foco central ajudar o MEI a compreender a saúde financeira do negócio (lucro ou prejuízo), registrar custos e receitas com o mínimo de fricção e receber apoio de um agente de IA para interpretação de dados, recomendações e simulações.

2 OBJETIVO
O objetivo do projeto é disponibilizar uma solução web que consolide lançamentos financeiros, permita importação de planilhas e forneça indicadores essenciais de gestão em linguagem simples. Adicionalmente, um módulo de IA (com RAG quando aplicável) deve auxiliar na tomada de decisão e na explicação de relatórios.
3 ESCOPO E FUNCIONALIDADES (O QUE O SISTEMA DEVE FAZER)
A seguir estão listadas as capacidades esperadas do sistema, organizadas por módulos.
3.1 Gestão de Usuários e MEIs
• Cadastro e autenticação de usuários.
• Cadastro e gerenciamento de uma ou mais empresas (MEIs) por usuário (suporte a multi-MEI).
• Perfil do MEI com dados básicos (ex.: nome do negócio, CNPJ, CNAE, limite anual e configurações do plano).
3.2 Lançamentos Financeiros (Fluxo de caixa)
• CRUD de lançamentos de receitas e despesas por MEI.
• Validação de campos (valores, datas e categorias).
• Filtros por período, tipo e categoria.
• Rastreabilidade de lançamentos oriundos de importação.
3.3 Importação de Planilhas
• Upload de arquivos (CSV/XLSX) com persistência do arquivo bruto em storage.
• Registro de importação com status (pendente, processando, concluída, falha).
• Processamento assíncrono (não bloquear interface do usuário).
• Distribuição inteligente dos dados importados para as entidades corretas (principalmente transações; opcionalmente produtos e colaboradores).
3.4 Produtos e Serviços
• Cadastro de produtos/serviços com preço, custo e margem desejada.
• Cálculo e visualização de margem e sinalização de margens baixas/negativas (quando aplicável).
3.5 Colaboradores/Funcionários (MVP+)
• Cadastro de colaboradores com tipo de vínculo e custo associado.
• Possibilidade de relacionar custos de pessoal à saúde financeira por período.
3.6 Marketing/Prospecção (MVP+)
• Registro de gastos de marketing por canal.
• Relatórios básicos para comparação com variação de faturamento (quando houver dados suficientes).
3.7 Dashboard e Relatórios
• Dashboard com receita, despesa, lucro/prejuízo, margem e tendências por período.
• Relatórios consolidados e exportáveis (evolução futura).
3.8 Agente de IA (Apoio à decisão)
• Chat para perguntas sobre os números do negócio e interpretação de indicadores.
• Sugestões de ações com base nos dados (redução de custos, ajuste de preços, etc.).
• Simulações do tipo “e se” (ex.: aumento de preço, corte de despesas, contratação).
• RAG com base de conhecimento (ex.: materiais internos, documentos do usuário e conteúdos relevantes), quando aplicável.
4 ARQUITETURA TÉCNICA (VISÃO GERAL)
A arquitetura proposta segue a separação entre um backend de domínio (C#) e um backend de IA (FastAPI).
4.1 Frontend (Web)
• Aplicação em Next.js (TypeScript), com rotas separadas para landing page (marketing), autenticação e área logada.
• Consumo das APIs por HTTPS e navegação orientada a módulos (Dashboard, Lançamentos, Importação, IA, etc.).
4.2 Backend Principal (Core)
• API em ASP.NET Core (C#), responsável por autenticação, regras de domínio e persistência.
• Persistência em PostgreSQL (Supabase) com modelagem multi-tenant por MEI.
• Endpoints de contexto/summary para abastecer o módulo de IA sem acesso direto ao banco.
4.3 Backend de IA (Sidecar)
• API em FastAPI (Python) com LangChain para chat, categorizações, simulações e processamento inteligente de importações.
• Consome contexto do Core via HTTP e retorna resultados para persistência no Core.
• Não acessa o banco diretamente (princípio de encapsulamento do domínio e segurança).
4.4 Infraestrutura de Dados
• Supabase PostgreSQL como base de dados principal.
• Supabase Storage para armazenamento de arquivos brutos de importação e documentos do usuário.
• Mecanismo assíncrono (fila/jobs) para importações e tarefas pesadas.
5 COMPONENTES CRÍTICOS (REQUISITOS NÃO FUNCIONAIS)
5.1 Segurança e Autenticação
• Autenticação via cookies HttpOnly e HTTPS em produção.
• Isolamento de dados por MEI (multi-tenancy) e validação de acesso em todas as rotas.
• Logs de auditoria e rastreabilidade de importações.
5.2 Observabilidade e Resiliência
• Monitoramento de erros e métricas (latência, falhas por endpoint).
• Processamento assíncrono para importação e integração com IA.
• Retentativas e proteção contra falhas transitórias nas chamadas entre serviços.
6 TELAS E EXPERIÊNCIA DO USUÁRIO (UX)
6.1 Área Pública (Landing)
• Página inicial com proposta de valor e chamada para ação.
• Página de recursos (features) e planos (pricing).
6.2 Autenticação
• Login e cadastro de usuário.
• Recuperação de senha (quando implementado).
6.3 Área Logada
• Dashboard: visão consolidada da saúde financeira por período.
• Lançamentos: criação/edição e filtragem de receitas e despesas.
• Importação: envio de planilha, acompanhamento de status e resultados.
• Produtos/Serviços: cadastro e visualização de margem.
• IA (Chat): perguntas, recomendações e simulações.
• Configurações: dados do perfil e do MEI (quando aplicável).
7 ROADMAP SUGERIDO (MVP E EVOLUÇÃO)
7.1 MVP (primeiro release vendável)
• Autenticação e perfil do usuário.
• Cadastro do MEI (empresa) e multi-tenant básico.
• CRUD de lançamentos financeiros.
• Dashboard com indicadores principais.
• Chat de IA com contexto financeiro resumido (primeira versão).
7.2 Evolução (incrementos)
• Importação com IA e processamento assíncrono.
• Produtos/serviços com precificação e margem.
• Funcionários/colaboradores e marketing/prospecção (MVP+).
• RAG com documentos do usuário e base de conhecimento (quando houver necessidade real de consulta).
• Relatórios exportáveis e alertas inteligentes.
CONSIDERAÇÕES FINAIS
O projeto propõe uma solução incremental, com foco no valor imediato ao MEI e crescimento controlado de complexidade. A separação entre o Core em C# (domínio e persistência) e o serviço de IA em FastAPI (interpretação e automação) visa manter o domínio consistente e reduzir riscos de segurança, ao mesmo tempo em que permite evolução rápida das funcionalidades inteligentes.

Usuário (browser)
│ upload do arquivo (CSV/XLSX)
▼
C# (ASP.NET Core)
│ 1. Recebe o arquivo
│ 2. Salva no Supabase Storage
│ 3. Cria registro de import (status = "processando")
│ 4. POST /api/import/process → { import_id, mei_id, file_url }
▼
FastAPI (Python/LangGraph)
│ 5. Baixa o arquivo via file_url
│ 6. Roda o agente de classificação
│ 7. Retorna o JSON estruturado
▼
C# recebe o resultado
│ 8. Persiste transactions/products/employees no BD
│ 9. Atualiza import (status = "concluída")
