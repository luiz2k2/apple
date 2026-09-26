const express = require('express');
const router = express.Router();
const aparelhoController = require('../controllers/aparelhoController');

// Rota de Health Check
router.get('/', aparelhoController.healthCheck);

// Rotas do CRUD de Aparelhos
router.get('/aparelhos', aparelhoController.listar);
router.get('/aparelhos/:id', aparelhoController.buscarPorId);
router.post('/aparelhos', aparelhoController.criar);
router.put('/aparelhos/:id', aparelhoController.atualizar);
router.delete('/aparelhos/:id', aparelhoController.excluir);

module.exports = router;
