import fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import todosRoutes from './features/todos/routes.js';

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

interface BuildAppOptions {
  dotenv?: boolean | { path: string };
}

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<FastifyInstance> {
  const { dotenv = true } = options;
  const app = fastify({ logger: true });

  // @fastify/env MUST be awaited first — other plugins read app.config
  // dotenv: true loads .env in local dev; in production/staging containers
  // DATABASE_URL is injected via platform secrets (Fly.io, CI) and no .env exists.
  await app.register(fastifyEnv, { schema: envSchema, dotenv });

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

  app.setErrorHandler<FastifyError>((error, request, reply) => {
    // Let Fastify's built-in validation errors pass through with their status code
    if (error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    const statusCode = error.statusCode ?? 500;

    // 4xx errors: preserve status code, expose error message in envelope
    if (statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({
        error: {
          code: error.code ?? 'CLIENT_ERROR',
          message: error.message,
        },
      });
    }

    // 5xx errors: log full error, return generic envelope — never expose internals
    request.log.error(error);

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

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
