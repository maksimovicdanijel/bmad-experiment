import { randomUUID } from 'node:crypto';
import type { Todo } from '@bmad/shared';
import type { TodoRow } from '../../db/schema.js';
import {
  deleteTodoById,
  getAllTodos,
  insertTodo,
  updateTodoById,
} from './queries.js';

/**
 * Map a DB row to the shared Todo type.
 * Single source of truth for snake_case → camelCase + date serialisation.
 */
function mapRowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    isCompleted: row.isCompleted,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

/**
 * List all todos ordered by creation date descending.
 * Maps DB rows to the shared Todo type.
 */
export async function listTodos(): Promise<Todo[]> {
  const rows = await getAllTodos();
  return rows.map(mapRowToTodo);
}

/**
 * Create a new todo with a service-generated UUID v4.
 * Maps the DB row to the shared Todo type.
 */
export async function createTodo(text: string): Promise<Todo> {
  const id = randomUUID();
  const row = await insertTodo(id, text);
  return mapRowToTodo(row);
}

/**
 * Update an existing todo by ID.
 * Maps request field 'completed' → DB field 'isCompleted'.
 * Returns null if the todo is not found.
 */
export async function updateTodo(
  id: string,
  data: { text?: string; completed?: boolean },
): Promise<Todo | null> {
  const dbData: { text?: string; isCompleted?: boolean } = {};
  if (data.text !== undefined) dbData.text = data.text;
  if (data.completed !== undefined) dbData.isCompleted = data.completed;

  const row = await updateTodoById(id, dbData);
  if (!row) return null;
  return mapRowToTodo(row);
}

/**
 * Delete an existing todo by ID.
 * Returns true when a row was deleted, false when not found.
 */
export async function deleteTodo(id: string): Promise<boolean> {
  return deleteTodoById(id);
}
