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

/**
 * Helper: insert a todo directly into the DB and return its row.
 */
async function seedTodo(
  overrides: { text?: string; isCompleted?: boolean } = {},
) {
  const [row] = await db
    .insert(todos)
    .values({ text: overrides.text ?? 'Test todo', ...overrides })
    .returning();
  return row;
}

describe('PATCH /todos/:id', () => {
  // ── Happy path ────────────────────────────────────────────────────────────

  it('returns 200 with { data: Todo } when toggling completed: true', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: { completed: true },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('data');
    expect(body.data.id).toBe(todo.id);
    expect(body.data.isCompleted).toBe(true);
    expect(body.data.text).toBe(todo.text);
    expect(body.data.createdAt).toBeDefined();
  });

  it('returns 200 with { data: Todo } when toggling completed: false (reactivation)', async () => {
    const todo = await seedTodo({ isCompleted: true });

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: { completed: false },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.isCompleted).toBe(false);
  });

  it('preserves id, text, and createdAt when only completed changes', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: { completed: true },
    });

    const body = res.json();
    expect(body.data.id).toBe(todo.id);
    expect(body.data.text).toBe(todo.text);
    expect(body.data.createdAt).toBe(new Date(todo.createdAt).toISOString());
  });

  it('returns 200 when updating text field with valid value', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: { text: 'Updated text' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.text).toBe('Updated text');
    expect(body.data.isCompleted).toBe(todo.isCompleted);
  });

  it('returns 200 when updating both text and completed simultaneously', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: { text: 'New text', completed: true },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.text).toBe('New text');
    expect(body.data.isCompleted).toBe(true);
  });

  // ── Error cases ───────────────────────────────────────────────────────────

  it('returns 404 with NOT_FOUND for non-existent UUID', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/todos/00000000-0000-4000-a000-000000000000',
      payload: { completed: true },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Todo not found',
      },
    });
  });

  it('returns 400 with VALIDATION_ERROR for text exceeding 255 characters', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: { text: 'a'.repeat(256) },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'text must be between 1 and 255 characters',
      },
    });
  });

  it('returns 400 with VALIDATION_ERROR for empty text', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
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

  it('returns 400 for invalid UUID format in :id param', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/todos/not-a-uuid',
      payload: { completed: true },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 with VALIDATION_ERROR for empty body {}', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'At least one field (text or completed) is required',
      },
    });
  });

  it('returns 400 with VALIDATION_ERROR when request body is omitted', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'At least one field (text or completed) is required',
      },
    });
  });

  // ── Persistence ───────────────────────────────────────────────────────────

  it('persists update — GET /todos reflects the change after PATCH', async () => {
    const todo = await seedTodo();

    await app.inject({
      method: 'PATCH',
      url: `/todos/${todo.id}`,
      payload: { completed: true },
    });

    const listRes = await app.inject({ method: 'GET', url: '/todos' });
    const listBody = listRes.json();
    const updated = listBody.data.find((t: { id: string }) => t.id === todo.id);
    expect(updated.isCompleted).toBe(true);
  });
});
