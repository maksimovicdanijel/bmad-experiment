import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../../server.js';
import { db } from '../../../db/index.js';
import { todos } from '../../../db/schema.js';

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

describe('POST /todos', () => {
  it('returns 201 with { data: Todo } on valid input', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { text: 'Buy milk' },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('text', 'Buy milk');
    expect(body.data).toHaveProperty('isCompleted', false);
    expect(body.data).toHaveProperty('createdAt');
  });

  it('returns a UUID v4 id', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { text: 'UUID test' },
    });

    const { data } = res.json();
    expect(data.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('returns createdAt as ISO 8601 string', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { text: 'ISO date test' },
    });

    const { data } = res.json();
    expect(typeof data.createdAt).toBe('string');
    expect(data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('returns isCompleted as false', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { text: 'Completed test' },
    });

    const { data } = res.json();
    expect(data.isCompleted).toBe(false);
  });

  it('returns 400 with validation error for empty text', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { text: '' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'text must be between 1 and 255 characters',
      },
    });
  });

  it('returns 400 with validation error for text exceeding 255 characters', async () => {
    const longText = 'a'.repeat(256);
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { text: longText },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'text must be between 1 and 255 characters',
      },
    });
  });

  it('returns 400 with validation error when text property is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(body.error).toHaveProperty(
      'message',
      'text must be between 1 and 255 characters',
    );
  });

  it('returns 400 when request body is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/todos',
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('persists the created todo (GET returns it)', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/todos',
      payload: { text: 'Persisted todo' },
    });

    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({ method: 'GET', url: '/todos' });
    const listBody = listRes.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.data[0].text).toBe('Persisted todo');
  });
});
