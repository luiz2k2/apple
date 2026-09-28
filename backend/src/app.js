const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes/aparelhoRoutes');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Configurações e Middlewares essenciais
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para garantir conexão ativa com o MongoDB para as rotas que necessitam de persistência
const ensureDbConnection = async (req, res, next) => {
  // A rota raiz de health check (/api) pode responder mesmo que o banco esteja oscilando
  if (req.path === '/api' || req.path === '/' || req.path === '/api/') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Não foi possível conectar ao banco de dados MongoDB.',
      erro: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

app.use(ensureDbConnection);

const path = require('path');
const fs = require('fs');

// Configuração de pastas estáticas (para servir o frontend na mesma porta/URL da Vercel)
const publicPath = path.join(__dirname, '../public');
const frontendPath = path.join(__dirname, '../../frontend');

app.use(express.static(publicPath));
app.use(express.static(frontendPath));

// Rota raiz: se o frontend existir, serve o index.html visual; se for requisitado JSON, entrega os endpoints
app.get('/', (req, res) => {
  const indexPublic = path.join(publicPath, 'index.html');
  const indexFrontend = path.join(frontendPath, 'index.html');

  if (fs.existsSync(indexPublic)) {
    return res.sendFile(indexPublic);
  }
  if (fs.existsSync(indexFrontend)) {
    return res.sendFile(indexFrontend);
  }

  res.status(200).json({
    sucesso: true,
    sistema: 'Mini Sistema — Gerenciamento de Aparelhos Apple',
    versao: '1.0.0',
    documentacao: '/api',
    endpoints: {
      healthCheck: 'GET /api',
      listarAparelhos: 'GET /api/aparelhos',
      buscarPorId: 'GET /api/aparelhos/:id',
      cadastrarAparelho: 'POST /api/aparelhos',
      atualizarAparelho: 'PUT /api/aparelhos/:id',
      excluirAparelho: 'DELETE /api/aparelhos/:id',
    },
  });
});

// Montagem das rotas sob o prefixo /api
app.use('/api', routes);

// Tratamento de rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `Rota '${req.method} ${req.originalUrl}' não encontrada. Consulte a documentação em api.md ou acesse GET /api.`,
  });
});

// Middleware global de tratamento de erros (500)
app.use((err, req, res, next) => {
  console.error('❌ Erro inesperado capturado pelo middleware global:', err);

  const status = err.status || 500;
  res.status(status).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno no servidor.',
  });
});

module.exports = app;
