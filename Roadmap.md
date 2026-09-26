# Roadmap — Mini Sistema de Gerenciamento de Aparelhos Apple

Este documento rastreia o planejamento, progresso e conclusão de cada etapa do desenvolvimento do mini sistema de gerenciamento de aparelhos Apple.

---

## Etapa 1 — Planejamento e Estruturação Inicial
- [x] Analisar os requisitos do sistema e o ambiente de desenvolvimento
- [x] Definir a estrutura de diretórios (`backend/` e `frontend/`)
- [x] Criar arquivos de governança do projeto (`Roadmap.md`, `Contexto.md`, `api.md`)
- [x] Definir o modelo de dados da entidade `Aparelho`
- [x] Especificar o contrato da API RESTful

## Etapa 2 — Desenvolvimento do Backend
- [x] Configurar `package.json` com dependências (Express, Mongoose, Dotenv, CORS)
- [x] Configurar variáveis de ambiente (`.env` e `.env.example`)
- [x] Implementar conexão com o MongoDB com cache para ambiente Serverless/Vercel (`src/config/db.js`)
- [x] Criar Mongoose Model `Aparelho` com validações de marca, modelo, preço e foto (`src/models/Aparelho.js`)
- [x] Implementar Controllers para CRUD completo e validações (`src/controllers/aparelhoController.js`)
- [x] Implementar Rotas da API (`src/routes/aparelhoRoutes.js` e rota base `/api`)
- [x] Configurar Express App com middlewares de segurança, parsing e tratamento de erros (`src/app.js`)
- [x] Criar ponto de entrada para execução local (`src/server.js`)
- [x] Criar script de carga inicial / seed com aparelhos Apple (`src/config/seed.js`)
- [x] Preparar configuração para hospedagem na Vercel (`vercel.json` e `api/index.js`)

## Etapa 3 — Testes da API
- [x] Criar suíte de testes automatizados para a API (`backend/tests/api.test.js`)
- [x] Criar testes unitários para os controllers e validações de regras de negócio (`backend/tests/crud.test.js`)
- [x] Testar rota de verificação de integridade (`GET /api`)
- [x] Testar listagem geral (`GET /api/aparelhos`)
- [x] Testar cadastro de aparelho válido (`POST /api/aparelhos`)
- [x] Testar validações de dados inválidos (marca não-Apple, preço negativo, campos obrigatórios ausentes)
- [x] Testar consulta por ID (`GET /api/aparelhos/:id`)
- [x] Testar consulta com ID inexistente e com formato inválido
- [x] Testar atualização de aparelho (`PUT /api/aparelhos/:id`)
- [x] Testar remoção de aparelho (`DELETE /api/aparelhos/:id`)
- [x] Validar códigos de status HTTP (200, 201, 400, 404, 500)

## Etapa 4 — Desenvolvimento do Frontend
- [x] Criar estrutura semântica HTML5 (`frontend/index.html`)
- [x] Implementar folha de estilos CSS3 moderna, responsiva com visual refinado inspirado no design Apple (`frontend/css/style.css`)
- [x] Criar sistema de cards para exibição dos aparelhos (foto, marca, modelo, preço formatado em BRL)
- [x] Desenvolver formulário de cadastro e modais de edição e exclusão de aparelhos
- [x] Implementar barra de visão geral (contador de dispositivos, soma do valor do catálogo e filtro de busca em tempo real)
- [x] Implementar estados visuais: carregamento (spinner), lista vazia e banners de erro com retry
- [x] Implementar tratamento de falha no carregamento de imagens com fallback visual em SVG de alta qualidade

## Etapa 5 — Conexão Frontend e Backend & Integração
- [x] Centralizar a URL da API em constante configurável (`frontend/js/script.js`)
- [x] Implementar consumo das rotas da API via `fetch` assíncrono
- [x] Conectar formulário de cadastro à rota `POST /api/aparelhos`
- [x] Conectar listagem de cards à rota `GET /api/aparelhos`
- [x] Conectar edição à rota `PUT /api/aparelhos/:id` com pré-preenchimento
- [x] Conectar exclusão à rota `DELETE /api/aparelhos/:id` com modal de confirmação
- [x] Implementar notificações visuais flutuantes (toasts) para feedback imediato das operações
- [x] Testar integração ponta a ponta (Frontend -> API Express -> MongoDB)

## Etapa 6 — Preparação para Deploy na Vercel
- [x] Validar arquivo `backend/vercel.json` com regra de reescrita para Serverless
- [x] Configurar exportação da aplicação para Serverless Function (`backend/api/index.js`)
- [x] Garantir que o cache de conexão Mongoose (`backend/src/config/db.js`) evite vazamento de sockets na Vercel
- [x] Documentar instruções passo a passo para deploy na Vercel
- [x] Documentar configuração das variáveis de ambiente na Vercel (`MONGODB_URI`)

## Etapa 7 — Documentação e Revisão Final
- [x] Atualizar `Contexto.md` com o estado final do sistema
- [x] Atualizar `api.md` com documentação completa dos endpoints e exemplos (`curl` e JSON)
- [x] Criar `README.md` com guia passo a passo de instalação, execução e testes
- [x] Revisar código em busca de imports órfãos, variáveis não utilizadas e bugs
- [x] Validar separação estrita de camadas e aderência a todas as diretrizes do projeto
- [x] Elaborar relatório final detalhado de conclusão
