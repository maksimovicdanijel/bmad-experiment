import { z } from 'zod';
import { VALIDATION_ERROR_MESSAGE } from './constants';

export const createTodoSchema = z.object({
  text: z
    .string()
    .min(1, VALIDATION_ERROR_MESSAGE)
    .max(255, VALIDATION_ERROR_MESSAGE),
});

export const updateTodoSchema = z.object({
  text: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});
