import type { Todo } from '@bmad/shared';
import { getAllTodos } from './queries.js';

/**
 * List all todos ordered by creation date descending.
 * Maps DB rows to the shared Todo type.
 */
export async function listTodos(): Promise<Todo[]> {
  const rows = await getAllTodos();
  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    isCompleted: row.isCompleted,
    createdAt: new Date(row.createdAt).toISOString(),
  }));
}
