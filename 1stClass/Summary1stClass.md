# Resumo – Disciplina de Desenvolvimento Web
> **Curso:** Engenharia de Computação  
> **Autores:** José Luiz, Murilo Antunes, Rafael Reis,  Victor Rodrigues, Vítor Benavides,

---

## Índice
- [Arquitetura de um Site](#-arquitetura-de-um-site)
- [Introdução ao Versionamento e Deploy](#-introdução-ao-versionamento-e-deploy)
- [Introdução ao JavaScript](#-introdução-ao-javascript-vanilla-js)
- [Servidores, Hospedagem e CMS](#-servidores-hospedagem-e-cms)
- [Website Builders](#-website-builders)
- [Frameworks Front-end](#-frameworks-front-end)
- [Frameworks Back-end](#-frameworks-back-end)
- [Banco de Dados NoSQL](#-banco-de-dados-nosql)
- [Critérios de Avaliação](#-critérios-de-avaliação)

---

---

## Arquitetura de um Site

É o ponto de partida de qualquer projeto web. Antes de partir para o desenvolvimento e o design, é preciso definir o **escopo** do projeto, ou seja, quais serão as funções e o propósito do site, para quem e quais serão seus limites. Essa etapa garante que todos os envolvidos estejam alinhados com os objetivos.

Dentro desse processo, entram os conceitos de **UX (User Experience)** e **UI (User Interface)**, que juntos orientam como a interface será estruturada e como o usuário vai interagir com ela. UX é relativa à experiência como um todo, como a usabilidade, enquanto UI trata da camada visual, como o layout.

A **prototipação** é a ferramenta que une essas duas frentes na prática. Criar protótipos permite validar ideias antes de desenvolvê-las de fato, identificar problemas de usabilidade cedo e iterar rapidamente com base em feedback. 

---

## Introdução ao Versionamento e Deploy

No desenvolvimento de software, raramente o produto fica usável de primeira. Por isso, o **controle de versão**: um sistema que registra todas as alterações feitas em arquivos ao longo do tempo, permitindo recuperar versões anteriores, trabalhar em paralelo com outras pessoas e manter um histórico completo do projeto. Isso significa que se algo quebrar, sempre é possível voltar a um estado anterior que funcionava.

As ferramentas mais usadas para isso são o **GitHub**, o **GitLab** e o **Bitbucket**, todas baseadas no Git. Cada uma tem suas particularidades, mas o conceito central é o mesmo: repositórios, commits, branches e merges.

O **deploy** é o processo de levar o código do ambiente de desenvolvimento para um ambiente acessível ao usuário final, podendo ser um servidor para testes ou o ambiente de produção. Nesse contexto, surgem as práticas de **CI/CD (Integração e Entrega Contínua)**, que automatizam etapas como testes, build e publicação do projeto, reduzindo erros humanos e acelerando o ciclo de entrega. Monitorar a aplicação após o deploy também faz parte das boas práticas, garantindo estabilidade e desempenho em produção.

---

## Introdução ao JavaScript (Vanilla JS)

O **JavaScript** é uma linguagem de programação focada na lógica por trás de páginas web. Enquanto o HTML estrutura o conteúdo e o CSS define o estilo, o JavaScript que adiciona comportamento: animações, validações de formulário, atualizações dinâmicas de conteúdo sem recarregar a página e comunicação com servidores são apenas alguns exemplos do que ele torna possível.

Quando falamos em **Vanilla JS**, nos referimos ao JavaScript puro, sem bibliotecas externas, sem frameworks, sem dependências. Estudar Vanilla JS é fundamental porque todos os frameworks modernos, como React, Vue e Angular, são construídos sobre ele. 

---

## Servidores, Hospedagem e CMS

Para que um site seja acessível na internet, ele precisa estar **hospedado** em algum lugar. Um **servidor** é basicamente um computador que fica sempre ligado e disponível para responder às requisições dos usuários. As opções de hospedagem variam bastante: desde servidores compartilhados e VPS (Servidores Privados Virtuais) até soluções em nuvem como AWS, Google Cloud e Vercel.

Já os **CMS (Content Management Systems)**, ou Sistemas de Gerenciamento de Conteúdo, são plataformas que permitem criar, organizar e publicar conteúdo na web sem a necessidade de grandes conhecimentos técnicos de programação. Eles oferecem painéis administrativos, suporte a plugins e temas, e tornam a gestão de sites muito mais acessível — especialmente para equipes que não têm perfil técnico.

---

## Website Builders

Os **website builders** levam a proposta dos CMS um passo além: são ferramentas que permitem construir sites inteiros de forma visual, arrastando e soltando elementos na tela, sem escrever nenhuma linha de código. Wix, Squarespace e Webflow são exemplos populares dessa categoria.

As vantagens são evidentes: interfaces intuitivas reduzem drasticamente a curva de aprendizado, e é possível ter um site no ar em questão de horas com templates profissionais e responsivos. Os planos geralmente já incluem hospedagem e manutenção, o que simplifica ainda mais o processo.

Por outro lado, essa facilidade tem um preço. A **flexibilidade é limitada**, ou seja, implementar funcionalidades muito específicas pode ser difícil ou impossível dentro da plataforma. Além disso, o código gerado automaticamente tende a ser mais pesado, o que pode prejudicar a performance. E caso o projeto cresça e seja necessário migrar para outra plataforma, esse processo costuma ser trabalhoso e complexo.

---

## Frameworks Front-end

Os **frameworks front-end** surgem como solução para a complexidade gerada pelo crescimento das aplicações web. São estruturas de código que oferecem convenções, ferramentas e abstrações para construir interfaces de forma mais organizada, eficiente e escalável.

Os três grandes nomes da área são **React** (mantido pelo Meta), **Vue.js** e **Angular** (mantido pelo Google). Cada um tem sua filosofia, mas todos compartilham o conceito de **componentização**:a ideia de dividir a interface em peças reutilizáveis e independentes, o que facilita a manutenção e o trabalho em equipe.

---

## Frameworks Back-end

O **back-end** é a camada "invisível" de uma aplicação que processa as requisições, aplica as regras de negócio, acessa o banco de dados e devolve as respostas. Os **frameworks back-end** organizam esse trabalho, oferecendo estruturas prontas para tarefas comuns, como: autenticação, roteamento de requisições e acesso a dados.

Frameworks populares incluem **Express** (Node.js), **Django** (Python), **Laravel** (PHP) e **Spring** (Java), **Asp.NET** (.NET/C#) cada um com suas particularidades e ecossistemas.

Outro conceito central é o das **RESTful APIs**, interfaces que padronizam a comunicação entre front-end e back-end (e entre sistemas distintos) usando o protocolo HTTP. A segurança também é um tema crítico no back-end, envolvendo autenticação de usuários, controle de acesso e proteção contra vulnerabilidades comuns.

---

## Banco de Dados NoSQL

Os **bancos de dados NoSQL** (Not Only SQL) representam uma alternativa aos bancos relacionais tradicionais, que organizam dados em tabelas com colunas fixas e relações rígidas. O NoSQL surge para atender cenários onde essa rigidez é um problema, como aplicações que lidam com grandes volumes de dados variados ou que precisam escalar rapidamente.

A principal característica é a **flexibilidade**: schemas dinâmicos permitem armazenar documentos com estruturas diferentes no mesmo banco, algo impensável no modelo relacional. Exemplos populares incluem **MongoDB** (orientado a documentos), **Redis** (chave-valor) e **Cassandra** (colunar).

Em termos de **escalabilidade**, o NoSQL é projetado para crescer horizontalmente, ou seja, adicionando mais servidores ao sistema ao invés de aumentar a capacidade de um único servidor. Isso o torna uma escolha natural para aplicações distribuídas e de alta demanda, como redes sociais, sistemas de recomendação e plataformas de streaming.

---

## Critérios de Avaliação

A disciplina é avaliada de forma distribuída ao longo do semestre, com quatro momentos distintos que somam 100% da nota final.

A **AC1 (15%)** é uma prova escrita de múltipla escolha com foco na verificação da compreensão teórica dos conceitos abordados em aula. As questões envolvem situações práticas que exigem identificação de abordagens adequadas e tomada de decisão fundamentada.

A **AC2 (30%)** avalia a entrega e apresentação de um projeto, com ênfase no processo de desenvolvimento: organização do backlog, páginas construídas e uma análise de benchmarking comparando a solução desenvolvida com outras disponíveis no mercado.

A **Avaliação Geral (10%)** complementa o processo contínuo de avaliação ao longo do semestre.

Por fim, a **Avaliação Final (45%)** — com o maior peso — consiste na entrega de uma documentação completa do projeto, nos moldes de um "mini TCC". Ela deve cobrir todo o ciclo: concepção, planejamento, execução, resultados obtidos, desafios enfrentados, soluções adotadas e uma análise crítica do trabalho realizado.

---
