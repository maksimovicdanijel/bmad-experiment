import { desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';
import type { TodoRow } from '../db/schema.js';

/**
 * Retrieve all todos ordered by creation date descending (newest first).
 */
export async function getAllTodos(): Promise<TodoRow[]> {
  return db.select().from(todos).orderBy(desc(todos.createdAt));
}
