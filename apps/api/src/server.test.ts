import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './server.js';

// Ensure DATABASE_URL is set before @fastify/env validates it
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/bmad_experiment';

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
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });
});

describe('GET /documentation/json', () => {
  it('returns a valid OpenAPI 3.0 document', async () => {
    const res = await app.inject({ method: 'GET', url: '/documentation/json' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
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
