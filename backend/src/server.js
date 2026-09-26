const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Tenta conectar ao MongoDB na inicialização
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn('⚠️ ATENÇÃO: MONGODB_URI não foi configurado no arquivo .env!');
    }

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🍎 Servidor Apple API rodando com sucesso!`);
      console.log(`📍 Local:        http://localhost:${PORT}`);
      console.log(`📍 Health Check: http://localhost:${PORT}/api`);
      console.log(`📍 Aparelhos:    http://localhost:${PORT}/api/aparelhos`);
      console.log('====================================================');
    });

    // Tratamento de encerramento seguro
    const gracefulShutdown = () => {
      console.log('\nEncerrando servidor com segurança...');
      server.close(() => {
        console.log('Servidor finalizado.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

startServer();
