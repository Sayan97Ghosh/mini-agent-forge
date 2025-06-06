import dotenv from 'dotenv';
import router from './api/routes';
import Fastify from 'fastify';
dotenv.config();


const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty'
    } : undefined
  },
  bodyLimit: 1024 * 1024,
  trustProxy: true,
  keepAliveTimeout: 72000,
  connectionTimeout: 10000 
});

async function registerRoutes() {
  await fastify.register(router, { prefix: '/api/v1' });
}
async function start() {
  try {
    await registerRoutes();
    
    const PORT = parseInt(process.env.PORT || '3000', 10);
    const HOST = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Fastify server running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
