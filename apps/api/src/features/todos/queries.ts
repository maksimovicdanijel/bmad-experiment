import { desc, eq } from 'drizzle-orm';
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

/**
 * Update an existing todo by ID and return the updated row.
 * Returns undefined if no row matched (id not found).
 */
export async function updateTodoById(
  id: string,
  data: { text?: string; isCompleted?: boolean },
): Promise<TodoRow | undefined> {
  const [row] = await db
    .update(todos)
    .set(data)
    .where(eq(todos.id, id))
    .returning();
  return row;
}

/**
 * Delete a todo by ID.
 * Returns true if a row was deleted, false if no row matched.
 */
export async function deleteTodoById(id: string): Promise<boolean> {
  const rows = await db
    .delete(todos)
    .where(eq(todos.id, id))
    .returning({ id: todos.id });

  return rows.length > 0;
}
