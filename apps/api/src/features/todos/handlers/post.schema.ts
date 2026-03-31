import { todoJsonSchema, createTodoJsonSchema } from '../schema.js';

/**
 * Fastify JSON Schema for POST /todos request body.
 * Derived from the shared Zod createTodoSchema.
 */
export { createTodoJsonSchema as createTodoBodySchema };

/**
 * Fastify JSON Schema for the 201 response envelope: { data: Todo }.
 */
export const createTodoResponseSchema = {
  type: 'object',
  properties: {
    data: todoJsonSchema,
  },
  required: ['data'],
} as const;
