import { describe, expect, it } from 'vitest';
import { createTodoSchema, updateTodoSchema } from './index';

describe('@bmad/shared exports', () => {
  it('exposes core todo schemas', () => {
    expect(createTodoSchema).toBeDefined();
    expect(updateTodoSchema).toBeDefined();
  });
});
