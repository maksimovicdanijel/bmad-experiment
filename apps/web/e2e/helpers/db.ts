import pg from 'pg';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/bmad_experiment';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

export const TEST_TODOS = [
  { text: 'Buy groceries', isCompleted: false },
  { text: 'Read a book', isCompleted: true },
  { text: 'Walk the dog', isCompleted: false },
];

export async function truncateTodos(): Promise<void> {
  await pool.query('DELETE FROM todos');
}

export async function seedTodos(
  todos: Array<{ text: string; isCompleted: boolean }>,
): Promise<void> {
  for (const todo of todos) {
    await pool.query('INSERT INTO todos (text, is_completed) VALUES ($1, $2)', [
      todo.text,
      todo.isCompleted,
    ]);
  }
}

export async function closeDbConnection(): Promise<void> {
  await pool.end();
}
