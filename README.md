# Mini Sistema — Gerenciamento de Aparelhos Apple

Sistema completo para cadastro, gerenciamento, listagem e persistência de aparelhos da Apple, desenvolvido com arquitetura separada entre **Backend (Node.js + Express + MongoDB)** e **Frontend (HTML5 + CSS3 + JavaScript Puro)**.

---

## Estrutura do Projeto

```text
projeto-apple/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # Conexão MongoDB com cache para Vercel Serverless
│   │   │   └── seed.js               # Script de carga inicial com aparelhos Apple
│   │   ├── controllers/
│   │   │   └── aparelhoController.js # Lógica do CRUD, validações e respostas HTTP
│   │   ├── models/
│   │   │   └── Aparelho.js           # Schema Mongoose para aparelhos Apple
│   │   ├── routes/
│   │   │   └── aparelhoRoutes.js     # Definição dos endpoints REST
│   │   ├── app.js                    # Configuração central do Express e middlewares
│   │   └── server.js                 # Ponto de inicialização do servidor local
│   ├── api/
│   │   └── index.js                  # Ponto de entrada Serverless para a Vercel
│   ├── tests/
│   │   ├── crud.test.js              # Testes unitários do controller e validações
│   │   └── api.test.js               # Testes automatizados dos endpoints HTTP
│   ├── package.json                  # Dependências e scripts
│   ├── vercel.json                   # Configuração de roteamento Serverless na Vercel
│   ├── .env                          # Variáveis de ambiente locais (não versionado)
│   ├── .env.example                  # Modelo de variáveis de ambiente
│   └── .gitignore                    # Regras de exclusão do git
│
├── frontend/
│   ├── css/
│   │   └── style.css                 # Folha de estilo inspirada no design Apple
│   ├── js/
│   │   └── script.js                 # Consumo da API via fetch, cards e modais
│   └── index.html                    # Interface principal responsiva
│
├── Roadmap.md                        # Rastreamento de etapas do projeto
├── Contexto.md                       # Estado atual, arquitetura e decisões técnicas
├── api.md                            # Documentação detalhada da API REST
├── README.md                         # Guia de execução e configuração
└── .gitignore                        # Regras de exclusão globais
```

---

## Tecnologias Utilizadas

- **Backend:** Node.js, Express 4.x
- **Banco de Dados:** MongoDB, Mongoose 8.x
- **Configuração & Segurança:** Dotenv, CORS
- **Deploy Serverless:** Vercel (`@vercel/node`)
- **Frontend:** HTML5 semântico, CSS3 moderno (design Apple, responsivo para PC e celular), JavaScript ES6+ puro (sem frameworks pesados)

---

## Como Executar Localmente

### 1. Pré-requisitos
- Node.js instalado (versão 18.x ou superior recomendada)
- Instância do MongoDB em execução (localmente em `mongodb://127.0.0.1:27017/apple_db` ou cluster gratuito no **MongoDB Atlas**)

### 2. Configurar o Backend
Acesse a pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Configure o arquivo `.env`:
```bash
# Copie o modelo de exemplo caso o .env ainda não exista
cp .env.example .env
```

Edite o arquivo `.env` inserindo sua string de conexão:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/apple_db
```
*(Para usar MongoDB Atlas na nuvem, utilize a string de conexão fornecida pelo painel do Atlas).*

### 3. Carga Inicial de Dados de Teste (Opcional)
Para popular o banco de dados com aparelhos Apple de exemplo (iPhone 15, iPhone 16 Pro, MacBook Air, iPad, Apple Watch):

```bash
npm run seed
```

### 4. Iniciar o Servidor
```bash
# Modo de produção/padrão
npm start

# Ou modo de desenvolvimento com hot-reload automático
npm run dev
```

O servidor estará operante em:
- **API Local:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/api`
- **Endpoints de Aparelhos:** `http://localhost:3000/api/aparelhos`

### 5. Executar os Testes Automatizados
```bash
# Executa a suíte de testes unitários e de integração
npm test
```

### 6. Executar o Frontend
O frontend foi desenvolvido com tecnologias web nativas e não requer compilação.
Você pode:
1. Abrir o arquivo `frontend/index.html` diretamente em seu navegador (Google Chrome, Safari, Edge, Firefox);
2. Ou utilizar um servidor estático local, como a extensão **Live Server** do VS Code ou:
```bash
npx serve frontend
```

---

## Configuração para Produção (Vercel)

O backend já está preparado para a Vercel através do arquivo `backend/vercel.json` e do handler serverless `backend/api/index.js`.

### Passos para Deploy:
1. Instale a Vercel CLI (`npm i -g vercel`) ou conecte seu repositório no [Vercel Dashboard](https://vercel.com).
2. Na raiz da pasta `backend`:
   ```bash
   cd backend
   vercel
   ```
3. Configure a variável de ambiente `MONGODB_URI` no painel da Vercel:
   - Acesse **Project Settings > Environment Variables**
   - Chave: `MONGODB_URI`
   - Valor: sua string de conexão do MongoDB Atlas (ex: `mongodb+srv://...`)
4. Após o deploy, a Vercel gerará uma URL como:
   `https://seu-projeto.vercel.app`
5. Atualize a constante `API_URL` no arquivo `frontend/js/script.js`:
   ```javascript
   const API_URL = "https://seu-projeto.vercel.app";
   ```
6. O frontend pode ser hospedado no GitHub Pages, Vercel ou qualquer servidor estático.

---

## Documentação dos Endpoints

Consulte o arquivo [`api.md`](./api.md) para obter a lista completa de rotas, parâmetros, exemplos de requisição (`curl`) e códigos de status HTTP.
