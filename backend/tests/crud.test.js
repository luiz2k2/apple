/**
 * Teste unitário e de integração dos métodos do AparelhoController
 * Valida o comportamento de cada método isoladamente e com simulação de dados
 */

const assert = require('assert');
const mongoose = require('mongoose');
const Aparelho = require('../src/models/Aparelho');
const controller = require('../src/controllers/aparelhoController');

function criarMockRes() {
  const res = {
    statusCode: null,
    dadosJson: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(dados) {
      this.dadosJson = dados;
      return this;
    }
  };
  return res;
}

async function testarController() {
  console.log('\n--- Testando Métodos do Controller Isoladamente ---');

  // Teste: Health Check
  const reqHealth = {};
  const resHealth = criarMockRes();
  controller.healthCheck(reqHealth, resHealth);
  assert.strictEqual(resHealth.statusCode, 200, 'Health check deve responder com status 200');
  assert.strictEqual(resHealth.dadosJson.sucesso, true, 'Health check deve ter sucesso = true');
  console.log('✅ Health check validado com sucesso.');

  // Teste: Validação de ID inválido na busca
  const reqIdInvalido = { params: { id: 'abc-invalido' } };
  const resIdInvalido = criarMockRes();
  await controller.buscarPorId(reqIdInvalido, resIdInvalido, () => {});
  assert.strictEqual(resIdInvalido.statusCode, 400, 'ID inválido deve retornar status 400');
  assert.strictEqual(resIdInvalido.dadosJson.sucesso, false);
  console.log('✅ Validação de ID inválido na busca validada com sucesso.');

  // Teste: Validação de criação com marca não-Apple
  const reqCriarNaoApple = {
    body: {
      marca: 'Xiaomi',
      modelo: 'Redmi Note',
      preco: 1500,
      foto: 'https://exemplo.com/xiaomi.jpg'
    }
  };
  const resCriarNaoApple = criarMockRes();
  await controller.criar(reqCriarNaoApple, resCriarNaoApple, () => {});
  assert.strictEqual(resCriarNaoApple.statusCode, 400, 'Marca não-Apple deve retornar 400');
  console.log('✅ Rejeição de marcas concorrentes validada com sucesso.');

  // Teste: Validação de criação sem modelo
  const reqCriarSemModelo = {
    body: {
      marca: 'Apple',
      modelo: '',
      preco: 5000,
      foto: 'https://exemplo.com/foto.jpg'
    }
  };
  const resCriarSemModelo = criarMockRes();
  await controller.criar(reqCriarSemModelo, resCriarSemModelo, () => {});
  assert.strictEqual(resCriarSemModelo.statusCode, 400, 'Modelo vazio deve retornar 400');
  console.log('✅ Validação de modelo obrigatório validada com sucesso.');

  // Teste: Validação de criação com preço negativo
  const reqCriarPrecoNegativo = {
    body: {
      marca: 'Apple',
      modelo: 'iPhone 13',
      preco: -50,
      foto: 'https://exemplo.com/foto.jpg'
    }
  };
  const resCriarPrecoNegativo = criarMockRes();
  await controller.criar(reqCriarPrecoNegativo, resCriarPrecoNegativo, () => {});
  assert.strictEqual(resCriarPrecoNegativo.statusCode, 400, 'Preço negativo deve retornar 400');
  console.log('✅ Validação de preço negativo validada com sucesso.');

  // Teste: Validação de criação com foto sem http/https
  const reqCriarFotoInvalida = {
    body: {
      marca: 'Apple',
      modelo: 'iPhone 13',
      preco: 3999,
      foto: 'caminho/local/imagem.png'
    }
  };
  const resCriarFotoInvalida = criarMockRes();
  await controller.criar(reqCriarFotoInvalida, resCriarFotoInvalida, () => {});
  assert.strictEqual(resCriarFotoInvalida.statusCode, 400, 'Foto sem protocolo web deve retornar 400');
  console.log('✅ Validação de formato de URL da foto validada com sucesso.');

  // Teste: Validação de atualização com ID inválido
  const reqAtualizarIdInvalido = { params: { id: '999' }, body: { preco: 2000 } };
  const resAtualizarIdInvalido = criarMockRes();
  await controller.atualizar(reqAtualizarIdInvalido, resAtualizarIdInvalido, () => {});
  assert.strictEqual(resAtualizarIdInvalido.statusCode, 400, 'ID inválido em atualização deve retornar 400');
  console.log('✅ Validação de ID inválido em PUT validada com sucesso.');

  // Teste: Validação de exclusão com ID inválido
  const reqExcluirIdInvalido = { params: { id: '123-bad-id' } };
  const resExcluirIdInvalido = criarMockRes();
  await controller.excluir(reqExcluirIdInvalido, resExcluirIdInvalido, () => {});
  assert.strictEqual(resExcluirIdInvalido.statusCode, 400, 'ID inválido em exclusão deve retornar 400');
  console.log('✅ Validação de ID inválido em DELETE validada com sucesso.');

  console.log('\n🎉 TODOS OS TESTES UNITÁRIOS DO CONTROLLER PASSARAM COM SUCESSO!\n');
}

testarController().catch(err => {
  console.error('Falha nos testes do controller:', err);
  process.exit(1);
});
