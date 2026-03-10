import { db, closeDb } from './index.js';
import { todos } from './schema.js';

const sampleTodos = [
  { text: 'Buy groceries' },
  { text: 'Read a book', isCompleted: true },
  { text: 'Walk the dog' },
  { text: 'Write unit tests', isCompleted: true },
  { text: 'Deploy to staging' },
];

// Truncate and re-insert for idempotency
await db.delete(todos);
await db.insert(todos).values(sampleTodos);

const inserted = await db.select().from(todos);
// eslint-disable-next-line no-console
console.log(`✅ Seeded ${inserted.length} todos`);

await closeDb();
