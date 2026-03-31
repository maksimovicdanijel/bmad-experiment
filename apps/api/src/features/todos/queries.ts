import { desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { todos } from '../../db/schema.js';
import type { TodoRow } from '../../db/schema.js';

/**
 * Retrieve all todos ordered by creation date descending (newest first).
 */
export async function getAllTodos(): Promise<TodoRow[]> {
  return db.select().from(todos).orderBy(desc(todos.createdAt));
}

/**
 * Insert a new todo and return the created row.
 */
export async function insertTodo(id: string, text: string): Promise<TodoRow> {
  const [row] = await db.insert(todos).values({ id, text }).returning();
  return row;
}
