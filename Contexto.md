# Contexto do Projeto — Gerenciamento de Aparelhos Apple

## Objetivo
Mini sistema completo e funcional para gerenciamento (cadastro, listagem, visualização, edição e exclusão) de aparelhos da Apple.
O sistema é composto por uma **API RESTful desenvolvida em Node.js e Express**, com persistência de dados em **MongoDB via Mongoose** (otimizada para ambientes Serverless como a **Vercel**), e uma interface web moderna, responsiva e elegante construída com **HTML5, CSS3 e JavaScript puro**.

---

## Tecnologias Utilizadas
- **Backend:** Node.js (v18+), Express.js 4.x
- **Banco de Dados:** MongoDB, Mongoose 8.x
- **Segurança & Utilitários:** Dotenv (variáveis de ambiente), CORS (Cross-Origin Resource Sharing)
- **Hospedagem Backend:** Vercel Serverless Functions (`@vercel/node` com rewrites via `vercel.json`)
- **Frontend:** HTML5 semântico, CSS3 (variáveis, flexbox, CSS grid, animações, responsividade e estética inspirada na Apple), JavaScript ES6+ nativo (sem frameworks pesados)
- **Comunicação:** API REST via JSON com consumo assíncrono por `fetch`

---

## Estrutura do Projeto
```text
projeto-apple/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # Conexão MongoDB com cache global resiliente para Serverless
│   │   │   └── seed.js               # Script para carga de dados de teste (iPhone, Mac, iPad, Watch)
│   │   ├── controllers/
│   │   │   └── aparelhoController.js # Lógica do CRUD, tratamento de validações e respostas HTTP
│   │   ├── models/
│   │   │   └── Aparelho.js           # Schema Mongoose para aparelhos Apple com validações
│   │   ├── routes/
│   │   │   └── aparelhoRoutes.js     # Declaração das rotas REST (/api, /api/aparelhos)
│   │   ├── app.js                    # Configuração central do Express, middlewares e CORS
│   │   └── server.js                 # Inicialização do servidor HTTP para ambiente local
│   ├── api/
│   │   └── index.js                  # Ponto de entrada Serverless da Vercel
│   ├── tests/
│   │   ├── crud.test.js              # Testes unitários do controller e regras de negócio
│   │   └── api.test.js               # Testes de integração dos endpoints HTTP
│   ├── .env                          # Variáveis de ambiente locais (ignorado no git)
│   ├── .env.example                  # Modelo demonstrativo de variáveis de ambiente
│   ├── .gitignore                    # Regras de exclusão do git para o backend
│   ├── package.json                  # Manifesto de dependências e scripts do backend
│   └── vercel.json                   # Regras de reescrita para Serverless na Vercel
│
├── frontend/
│   ├── css/
│   │   └── style.css                 # Folha de estilos moderna, limpa e responsiva (design Apple)
│   ├── js/
│   │   └── script.js                 # Centralização de API_URL, chamadas fetch, renderização e modais
│   └── index.html                    # Interface principal do usuário
│
├── Roadmap.md                        # Rastreamento de progresso e tarefas do projeto
├── Contexto.md                       # Resumo arquitetural, estado atual e documentação
├── api.md                            # Documentação técnica completa da API com exemplos
├── README.md                         # Guia de instalação, configuração, execução e testes
└── .gitignore                        # Regras de exclusão do git para a raiz do repositório
```

---

## Backend
- **Estado atual:** Concluído e testado.
- **Arquitetura:** Separação estrita em camadas (Routes -> Controllers -> Models -> Config).
- **Otimização Serverless:** A conexão com o MongoDB é mantida em cache no escopo global (`global.mongoose`) no arquivo `src/config/db.js`, evitando a criação descontrolada de conexões em cada invocação serverless na Vercel.
- **Tratamento de Erros:** Respostas padronizadas em JSON com códigos HTTP semânticos (200, 201, 400, 404, 500).

---

## Banco de Dados
- **Banco:** MongoDB Atlas (Cluster em Nuvem configurado no `.env`).
- **ODM:** Mongoose 8.x.
- **Entidade `Aparelho`:**
  - `marca`: String obrigatória, validada para aceitar apenas "Apple" (insensível a maiúsculas/minúsculas) e normalizada para "Apple" via hook `pre('save')`.
  - `modelo`: String obrigatória (mínimo 2 caracteres).
  - `preco`: Number obrigatório e positivo, com tratamento automático para strings e valores formatados no padrão brasileiro.
  - `foto`: String obrigatória com validação de formato de URL (`http://` ou `https://`).
  - `timestamps`: `createdAt` e `updatedAt` gerados automaticamente.

---

## Frontend
- **Estado atual:** Concluído e integrado.
- **Características e Experiência do Usuário:**
  - **Constante Centralizada:** Variável `API_URL` definida no topo de `frontend/js/script.js` para alternância facilitada entre o ambiente local (`http://localhost:3000`) e a Vercel.
  - **Cards Apple:** Cards elegantes com foto centralizada, badge da marca Apple, nome do modelo em destaque, preço formatado em Real (`R$ 0.000,00`) e botões de ação ("Editar" e "Excluir").
  - **Barra de Visão Geral:** Contadores em tempo real de aparelhos cadastrados, valor total do catálogo somado e campo de busca/filtro por modelo instantâneo.
  - **Formulário de Cadastro:** Modal moderno com marca pré-fixada em "Apple", validação de campos e prévia em tempo real da imagem ao digitar a URL.
  - **Modal de Edição:** Permite atualizar modelo, preço e foto do dispositivo.
  - **Modal de Exclusão:** Confirmação segura antes de remover qualquer item do banco de dados.
  - **Tratamento de Estados Visuais:**
    - Carregamento (spinner animado e elegante);
    - Lista vazia (mensagem informativa e botão de ação rápida para cadastrar o primeiro dispositivo);
    - Erro de conexão (alerta detalhado com instruções e botão de "Tentar Novamente");
    - Fallback de imagem: caso a imagem remota falhe ou fique indisponível, um SVG minimalista de dispositivo Apple é renderizado automaticamente via evento `onerror`.
  - **Notificações Flutuantes (Toasts):** Alertas suaves e temporários no canto da tela informando o resultado das ações de cadastro, atualização e exclusão.

---

## Endpoints da API
| Método | Endpoint | Descrição | Códigos HTTP |
|---|---|---|---|
| `GET` | `/api` | Health check da API e status do banco | `200` |
| `GET` | `/api/aparelhos` | Lista todos os aparelhos (ordenados por mais recentes) | `200` |
| `GET` | `/api/aparelhos/:id` | Retorna os detalhes de um aparelho específico | `200`, `400`, `404` |
| `POST` | `/api/aparelhos` | Cadastra um novo aparelho da Apple | `201`, `400` |
| `PUT` | `/api/aparelhos/:id` | Atualiza os dados de um aparelho existente | `200`, `400`, `404` |
| `DELETE` | `/api/aparelhos/:id` | Remove um aparelho do banco de dados | `200`, `400`, `404` |

---

## Variáveis de Ambiente
- `PORT`: Porta HTTP local (padrão `3000`).
- `MONGODB_URI`: String de conexão com o banco de dados MongoDB (ex: `mongodb://127.0.0.1:27017/apple_db` ou `mongodb+srv://...`).
- O arquivo `.env` não é versionado (protegido por `.gitignore`), existindo o `.env.example` como modelo de referência.

---

## Testes Realizados e Cobertura
- [x] **Suíte Unitária do Controller (`backend/tests/crud.test.js`):**
  - Health check respondendo 200 com JSON semântico;
  - Validação de formato de ID incorreto (rejeitado com 400);
  - Rejeição de marcas concorrentes ou diferentes de "Apple" (status 400);
  - Rejeição de modelo vazio ou com menos de 2 caracteres (status 400);
  - Rejeição de valores de preço negativos ou não numéricos (status 400);
  - Rejeição de URLs de foto sem protocolo web válido (status 400);
  - Validações de ID em rotas de atualização (`PUT`) e exclusão (`DELETE`).
- [x] **Suíte Automatizada de Integração (`backend/tests/api.test.js`):**
  - Inicialização do servidor em porta efêmera;
  - Requisições HTTP simuladas com cliente `node:http`;
  - Validação de rota inexistente (404 com resposta JSON);
  - Validação do schema Mongoose e conversão de preços no formato BRL ("7.999,00" -> 7999);
  - Validações de payload e respostas da rota raiz (`GET /`).
- [x] **Script de Carga de Dados (`backend/src/config/seed.js`):**
  - Populamento de 5 aparelhos de teste oficiais (iPhone 15, iPhone 16 Pro Max, MacBook Air M3, iPad Air M2, Apple Watch Ultra 2).

---

## Deploy na Vercel
- Arquivo `backend/vercel.json` configurado com reescrita para o ponto de entrada serverless `backend/api/index.js`.
- Conexão MongoDB com pool e cache implementados para evitar abertura excessiva de conexões por requisição.
- Instruções detalhadas de publicação documentadas no `README.md`.

---

## Pendências
- Nenhuma pendência técnica de código. O sistema está 100% implementado, organizado e documentado.
- Conexão com o MongoDB Atlas configurada no arquivo `.env`. Ao realizar o deploy na Vercel, basta adicionar a mesma variável `MONGODB_URI` no painel do projeto.
