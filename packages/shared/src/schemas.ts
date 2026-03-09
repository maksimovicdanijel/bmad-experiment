import { z } from 'zod';

export const createTodoSchema = z.object({
  text: z.string().min(1).max(255),
});

export const updateTodoSchema = z.object({
  text: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});
