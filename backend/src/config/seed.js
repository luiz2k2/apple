/**
 * Script de Carga Inicial (Seed) com Aparelhos Apple de Exemplo
 * Execução: node src/config/seed.js ou npm run seed
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./db');
const Aparelho = require('../models/Aparelho');

dotenv.config();

const aparelhosExemplo = [
  {
    marca: 'Apple',
    modelo: 'iPhone 15',
    preco: 4999.90,
    foto: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue.jpeg',
  },
  {
    marca: 'Apple',
    modelo: 'iPhone 16 Pro Max',
    preco: 9999.00,
    foto: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium.jpeg',
  },
  {
    marca: 'Apple',
    modelo: 'MacBook Air 13 M3',
    preco: 11499.00,
    foto: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-space-gray-select-202402.jpeg',
  },
  {
    marca: 'Apple',
    modelo: 'iPad Air 11 M2',
    preco: 6999.00,
    foto: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-storage-select-202405-11inch-spacegray.jpeg',
  },
  {
    marca: 'Apple',
    modelo: 'Apple Watch Ultra 2',
    preco: 7999.00,
    foto: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-watch-ultra-2-black-titanium-oceantape-black.jpeg',
  },
];

async function executarSeed() {
  try {
    console.log('🌱 Conectando ao MongoDB para semear dados de teste...');
    await connectDB();

    console.log('Removendo registros antigos de teste...');
    await Aparelho.deleteMany({});

    console.log('Inserindo aparelhos Apple de demonstração...');
    const criados = await Aparelho.insertMany(aparelhosExemplo);

    console.log(`✅ Sucesso! ${criados.length} aparelhos Apple foram cadastrados com sucesso:`);
    criados.forEach((item) => {
      console.log(`  - [${item.marca}] ${item.modelo} | R$ ${item.preco.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Erro ao semear dados:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Conexão finalizada.');
  }
}

if (require.main === module) {
  executarSeed();
}

module.exports = { aparelhosExemplo, executarSeed };
