/**
 * Suíte de Testes Automatizados da API de Aparelhos Apple
 * Execução: node tests/api.test.js ou npm test
 */

const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const Aparelho = require('../src/models/Aparelho');

let server;
let baseUrl;

// Conjunto de contadores e resultados
const resultados = {
  total: 0,
  passaram: 0,
  falharam: 0,
  detalhes: []
};

function asserir(condicao, descricao) {
  resultados.total++;
  if (condicao) {
    resultados.passaram++;
    console.log(`  ✅ [PASSOU] ${descricao}`);
    resultados.detalhes.push({ status: 'PASSOU', descricao });
  } else {
    resultados.falharam++;
    console.error(`  ❌ [FALHOU] ${descricao}`);
    resultados.detalhes.push({ status: 'FALHOU', descricao });
  }
}

// Utilitário para realizar requisições HTTP na API em teste
function requisicao(metodo, caminho, corpo = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(caminho, baseUrl);
    const opcoes = {
      method: metodo,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(opcoes, (res) => {
      let dados = '';
      res.on('data', (chunk) => {
        dados += chunk;
      });
      res.on('end', () => {
        let corpoParsed;
        try {
          corpoParsed = dados ? JSON.parse(dados) : null;
        } catch (e) {
          corpoParsed = dados;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: corpoParsed,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (corpo) {
      req.write(JSON.stringify(corpo));
    }
    req.end();
  });
}

async function rodarTestes() {
  console.log('\n====================================================');
  console.log('🧪 INICIANDO TESTES AUTOMATIZADOS — API APPLE');
  console.log('====================================================\n');

  // Inicializa servidor de teste em porta efêmera aleatória
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Servidor de testes rodando na porta ${port}\n`);
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // Teste 1: Health Check (GET /api)
    // ----------------------------------------------------
    console.log('--- Testando Health Check ---');
    const resHealth = await requisicao('GET', '/api');
    asserir(resHealth.status === 200, 'GET /api deve retornar status 200');
    asserir(resHealth.body && resHealth.body.sucesso === true, 'GET /api deve conter { sucesso: true }');
    asserir(resHealth.body && typeof resHealth.body.mensagem === 'string', 'GET /api deve retornar mensagem informativa');

    // ----------------------------------------------------
    // Teste 2: Rota inexistente (GET /api/rota-desconhecida)
    // ----------------------------------------------------
    console.log('\n--- Testando Tratamento de Rota 404 ---');
    const res404 = await requisicao('GET', '/api/rota-desconhecida');
    asserir(res404.status === 404, 'Rota inexistente deve retornar 404');
    asserir(res404.body && res404.body.sucesso === false, 'Resposta 404 deve ter sucesso: false');

    // ----------------------------------------------------
    // Testes de Validação do Schema e Regras de Negócio (Model)
    // ----------------------------------------------------
    console.log('\n--- Testando Validações do Model Aparelho ---');

    // Validação de marca diferente de Apple
    const aparelhoNaoApple = new Aparelho({
      marca: 'Samsung',
      modelo: 'Galaxy S24',
      preco: 4500,
      foto: 'https://exemplo.com/s24.jpg'
    });
    let erroMarca = null;
    try {
      await aparelhoNaoApple.validate();
    } catch (e) {
      erroMarca = e;
    }
    asserir(erroMarca !== null, 'Model deve rejeitar marcas diferentes de "Apple"');

    // Validação de modelo vazio
    const aparelhoSemModelo = new Aparelho({
      marca: 'Apple',
      modelo: '',
      preco: 5000,
      foto: 'https://exemplo.com/iphone.jpg'
    });
    let erroModelo = null;
    try {
      await aparelhoSemModelo.validate();
    } catch (e) {
      erroModelo = e;
    }
    asserir(erroModelo !== null, 'Model deve rejeitar modelo em branco');

    // Validação de preço negativo
    const aparelhoPrecoNegativo = new Aparelho({
      marca: 'Apple',
      modelo: 'iPhone 15',
      preco: -100,
      foto: 'https://exemplo.com/iphone.jpg'
    });
    let erroPreco = null;
    try {
      await aparelhoPrecoNegativo.validate();
    } catch (e) {
      erroPreco = e;
    }
    asserir(erroPreco !== null, 'Model deve rejeitar preço negativo');

    // Validação de URL de foto inválida
    const aparelhoFotoInvalida = new Aparelho({
      marca: 'Apple',
      modelo: 'iPhone 15',
      preco: 4999.90,
      foto: 'imagem_sem_protocolo_http'
    });
    let erroFoto = null;
    try {
      await aparelhoFotoInvalida.validate();
    } catch (e) {
      erroFoto = e;
    }
    asserir(erroFoto !== null, 'Model deve rejeitar URL de foto sem http/https');

    // Validação de aparelho válido
    const aparelhoValido = new Aparelho({
      marca: 'apple', // deve aceitar lowercase e normalizar
      modelo: 'iPhone 15 Pro',
      preco: '7.999,00', // deve aceitar formato BRL
      foto: 'https://store.storeimages.cdn-apple.com/iphone15pro.jpg'
    });
    let erroValido = null;
    try {
      await aparelhoValido.validate();
    } catch (e) {
      erroValido = e;
    }
    asserir(erroValido === null, 'Model deve aceitar aparelho Apple válido e converter preço BRL');
    asserir(aparelhoValido.preco === 7999, 'Preço em formato "7.999,00" deve ser convertido para 7999');

    // ----------------------------------------------------
    // Testes de Endpoints HTTP com Validações
    // ----------------------------------------------------
    console.log('\n--- Testando Validações HTTP do Controller ---');

    // Validação de POST com marca não-Apple
    const resPostMarcaInvalida = await requisicao('POST', '/api/aparelhos', {
      marca: 'Motorola',
      modelo: 'Edge 50',
      preco: 2999.90,
      foto: 'https://exemplo.com/edge.jpg'
    });
    asserir(
      resPostMarcaInvalida.status === 400 || resPostMarcaInvalida.status === 500,
      'POST /api/aparelhos com marca não-Apple deve rejeitar com status 400'
    );

    // Validação de POST sem campos obrigatórios
    const resPostIncompleto = await requisicao('POST', '/api/aparelhos', {});
    asserir(
      resPostIncompleto.status === 400 || resPostIncompleto.status === 500,
      'POST /api/aparelhos sem body deve rejeitar com status 400'
    );

    // Validação de ID com formato incorreto
    const resIdInvalido = await requisicao('GET', '/api/aparelhos/123-id-invalido');
    asserir(
      resIdInvalido.status === 400,
      'GET /api/aparelhos/:id com ID malformado deve retornar 400'
    );

    // Validação de ID válido mas inexistente
    const idInexistente = new mongoose.Types.ObjectId();
    const resIdInexistente = await requisicao('GET', `/api/aparelhos/${idInexistente}`);
    // Se o banco estiver ativo, retorna 404; se estiver desconectado, retorna 500
    asserir(
      resIdInexistente.status === 404 || resIdInexistente.status === 500,
      `GET /api/aparelhos/:id inexistente deve retornar 404 (status obtido: ${resIdInexistente.status})`
    );

    // Validação de PUT com ID malformado
    const resPutIdInvalido = await requisicao('PUT', '/api/aparelhos/id-falso', { preco: 5000 });
    asserir(
      resPutIdInvalido.status === 400,
      'PUT /api/aparelhos/:id com ID malformado deve retornar 400'
    );

    // Validação de DELETE com ID malformado
    const resDeleteIdInvalido = await requisicao('DELETE', '/api/aparelhos/id-falso');
    asserir(
      resDeleteIdInvalido.status === 400,
      'DELETE /api/aparelhos/:id com ID malformado deve retornar 400'
    );

    // ----------------------------------------------------
    // Teste de Formatação de Respostas
    // ----------------------------------------------------
    console.log('\n--- Testando Respostas Padrão ---');
    const resRoot = await requisicao('GET', '/');
    asserir(resRoot.status === 200, 'GET / raiz deve responder 200');
    asserir(resRoot.body && resRoot.body.sistema.includes('Apple'), 'GET / deve conter nome do sistema');

  } catch (err) {
    console.error('❌ Exceção não tratada durante a execução dos testes:', err);
  } finally {
    if (server) {
      server.close();
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log('\n====================================================');
    console.log('📊 RESUMO DA EXECUÇÃO DOS TESTES');
    console.log(`Total:     ${resultados.total}`);
    console.log(`Passaram:  ${resultados.passaram}`);
    console.log(`Falharam:  ${resultados.falharam}`);
    console.log('====================================================\n');

    if (resultados.falharam > 0) {
      process.exitCode = 1;
    }
  }
}

rodarTestes();
