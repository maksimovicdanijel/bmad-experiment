import fastify, { type FastifyInstance } from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import todosRoutes from './todos/todos.routes.js';

const envSchema = {
  type: 'object' as const,
  required: ['DATABASE_URL'],
  properties: {
    DATABASE_URL: { type: 'string' },
    PORT: { type: 'string', default: '3000' },
    HOST: { type: 'string', default: '0.0.0.0' },
    CORS_ORIGIN: { type: 'string', default: 'http://localhost:5173' },
    RATE_LIMIT_MAX: { type: 'string', default: '1000' },
    NODE_ENV: { type: 'string', default: 'development' },
  },
};

// Augment FastifyInstance with config property
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      PORT: string;
      HOST: string;
      CORS_ORIGIN: string;
      RATE_LIMIT_MAX: string;
      NODE_ENV: string;
    };
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({ logger: true });

  // @fastify/env MUST be awaited first — other plugins read app.config
  // dotenv: false ensures DATABASE_URL must be provided in the runtime environment;
  // it must not be silently satisfied by a .env file in production/staging contexts.
  await app.register(fastifyEnv, { schema: envSchema, dotenv: false });

  app.register(fastifyHelmet);
  app.register(fastifyCors, { origin: app.config.CORS_ORIGIN });
  app.register(fastifyRateLimit, {
    max: Number(app.config.RATE_LIMIT_MAX),
    timeWindow: '1 minute',
  });
  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: { title: 'bmad-experiment API', version: '1.0.0' },
    },
  });
  app.register(todosRoutes, { prefix: '/todos' });
  app.register(fastifySwaggerUi, { routePrefix: '/documentation' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

// Start server only when NOT in test mode
if (process.env.NODE_ENV !== 'test') {
  const app = await buildApp();
  await app.listen({
    port: Number(app.config.PORT),
    host: app.config.HOST,
  });
}
