import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import { buildApp } from './server.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /health', () => {
  it('returns 200 with { status: "ok" }', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});

describe('GET /documentation/json', () => {
  it('returns a valid OpenAPI 3.0 document', async () => {
    const res = await app.inject({ method: 'GET', url: '/documentation/json' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.openapi).toBe('3.0.0');
    expect(body.info.title).toBe('bmad-experiment API');
  });
});

describe('Security headers', () => {
  it('includes x-content-type-options from @fastify/helmet', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});

describe('Rate limiting (AC #8)', () => {
  it('configures the app default rate limit to 1000 requests per minute', async () => {
    const rateLimitApp = await buildApp();
    await rateLimitApp.ready();

    try {
      expect(rateLimitApp.config.RATE_LIMIT_MAX).toBe('1000');
    } finally {
      await rateLimitApp.close();
    }
  });

  it('returns 429 after exceeding the configured request limit', async () => {
    const rateLimitApp = fastify({ logger: false });
    await rateLimitApp.register(fastifyRateLimit, {
      max: 3,
      timeWindow: '1 minute',
    });
    rateLimitApp.get('/health', async () => ({ status: 'ok' }));
    await rateLimitApp.ready();

    try {
      for (let i = 0; i < 3; i++) {
        const res = await rateLimitApp.inject({
          method: 'GET',
          url: '/health',
        });
        expect(res.statusCode).toBe(200);
      }

      const res = await rateLimitApp.inject({ method: 'GET', url: '/health' });
      expect(res.statusCode).toBe(429);
    } finally {
      await rateLimitApp.close();
    }
  });
});

describe('Environment validation (AC #6)', () => {
  it('fails fast if DATABASE_URL is missing', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      await expect(buildApp({ dotenv: false })).rejects.toThrow(/DATABASE_URL/);
    } finally {
      if (previous === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previous;
      }
    }
  });
});

describe('CORS headers (AC #9)', () => {
  it('returns CORS headers for requests from the configured origin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://localhost:5173' },
    });
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });

  it('returns CORS headers on OPTIONS preflight from configured origin', async () => {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'GET',
      },
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });
});

describe('Global error handler', () => {
  it('returns 500 with error envelope and no stack trace for unexpected errors', async () => {
    // Register a route that throws an unexpected error for testing
    const testApp = await buildApp();
    testApp.get('/test-error', async () => {
      throw new Error('Unexpected failure');
    });
    await testApp.ready();

    try {
      const res = await testApp.inject({ method: 'GET', url: '/test-error' });
      expect(res.statusCode).toBe(500);
      const body = res.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code', 'INTERNAL_ERROR');
      expect(body.error).toHaveProperty('message');
      expect(typeof body.error.message).toBe('string');

      // Ensure no stack trace exposed
      expect(body.error).not.toHaveProperty('stack');
      expect(body).not.toHaveProperty('stack');
      expect(body).not.toHaveProperty('statusCode');
      expect(JSON.stringify(body)).not.toContain('Unexpected failure');
    } finally {
      await testApp.close();
    }
  });
});
