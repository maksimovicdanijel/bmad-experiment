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

async function seedTodo(text = 'Delete me') {
  const [row] = await db.insert(todos).values({ text }).returning();
  return row;
}

describe('DELETE /todos/:id', () => {
  it('returns 204 with empty body for an existing todo', async () => {
    const todo = await seedTodo();

    const res = await app.inject({
      method: 'DELETE',
      url: `/todos/${todo.id}`,
    });

    expect(res.statusCode).toBe(204);
    expect(res.body).toBe('');
  });

  it('removes the todo from persistence (GET /todos no longer includes it)', async () => {
    const todo = await seedTodo('Will be removed');

    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/todos/${todo.id}`,
    });

    expect(deleteRes.statusCode).toBe(204);

    const listRes = await app.inject({ method: 'GET', url: '/todos' });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json();
    expect(
      body.data.find((t: { id: string }) => t.id === todo.id),
    ).toBeUndefined();
  });

  it('returns 404 with NOT_FOUND for a non-existent UUID', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/todos/00000000-0000-4000-a000-000000000000',
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Todo not found',
      },
    });
  });

  it('returns 400 with VALIDATION_ERROR for an invalid UUID', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/todos/not-a-uuid',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'id must be a valid UUID',
      },
    });
  });

  it('returns 404 when deleting an already-deleted todo', async () => {
    const todo = await seedTodo();

    const firstDelete = await app.inject({
      method: 'DELETE',
      url: `/todos/${todo.id}`,
    });
    expect(firstDelete.statusCode).toBe(204);

    const secondDelete = await app.inject({
      method: 'DELETE',
      url: `/todos/${todo.id}`,
    });

    expect(secondDelete.statusCode).toBe(404);
    expect(secondDelete.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Todo not found',
      },
    });
  });
});
