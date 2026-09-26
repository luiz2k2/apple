const mongoose = require('mongoose');

/**
 * Cache global da conexão para ambientes Serverless (como Vercel).
 * Evita a criação de conexões múltiplas a cada requisição invocada.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('A variável de ambiente MONGODB_URI não foi definida no arquivo .env');
  }

  // Se já existe uma conexão ativa pronta, reutiliza-a
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Se não há promessa de conexão em andamento, inicializa uma nova
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('✅ Conexão com MongoDB estabelecida com sucesso.');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ Falha ao conectar com o MongoDB:', error.message);
    throw error;
  }

  return cached.conn;
}

module.exports = connectDB;
