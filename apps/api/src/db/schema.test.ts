import { describe, it, expect } from 'vitest';
import { todos } from './schema.js';

describe('todos Drizzle schema', () => {
  it('has the expected column keys', () => {
    const columns = Object.keys(todos);
    expect(columns).toContain('id');
    expect(columns).toContain('text');
    expect(columns).toContain('isCompleted');
    expect(columns).toContain('createdAt');
  });
});
