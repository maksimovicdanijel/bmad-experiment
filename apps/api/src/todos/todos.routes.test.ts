import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setTimeout } from 'node:timers/promises';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server.js';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await db.delete(todos);
});

describe('GET /todos', () => {
  it('returns 200 with { data: [] } when database is empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/todos' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
  });

  it('returns 200 with { data: Todo[] } when todos exist', async () => {
    await db
      .insert(todos)
      .values([{ text: 'First todo' }, { text: 'Second todo' }]);

    const res = await app.inject({ method: 'GET', url: '/todos' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveLength(2);
  });

  it('returns todos ordered by createdAt descending', async () => {
    // Insert with staggered timestamps to guarantee order
    await db.insert(todos).values({ text: 'Older todo' });
    // Small delay to ensure different timestamps
    await setTimeout(50);
    await db.insert(todos).values({ text: 'Newer todo' });

    const res = await app.inject({ method: 'GET', url: '/todos' });
    const body = res.json();
    expect(body.data[0].text).toBe('Newer todo');
    expect(body.data[1].text).toBe('Older todo');
  });

  it('returns response fields in camelCase with correct types', async () => {
    await db.insert(todos).values({ text: 'Check fields' });

    const res = await app.inject({ method: 'GET', url: '/todos' });
    const body = res.json();
    const todo = body.data[0];

    // Verify all fields present
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('text');
    expect(todo).toHaveProperty('isCompleted');
    expect(todo).toHaveProperty('createdAt');

    // Verify no snake_case fields leaked
    expect(todo).not.toHaveProperty('is_completed');
    expect(todo).not.toHaveProperty('created_at');

    // Verify types
    expect(typeof todo.id).toBe('string');
    expect(todo.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(typeof todo.text).toBe('string');
    expect(typeof todo.isCompleted).toBe('boolean');
    expect(typeof todo.createdAt).toBe('string');
    // Verify ISO 8601 format (e.g. 2026-03-10T12:00:00.000Z)
    expect(todo.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
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
