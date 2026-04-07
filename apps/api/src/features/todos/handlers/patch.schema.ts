import { todoJsonSchema, updateTodoJsonSchema } from '../schema.js';

/**
 * Fastify JSON Schema for PATCH /todos/:id request body.
 * Derived from the shared Zod updateTodoSchema.
 */
export { updateTodoJsonSchema as patchTodoBodySchema };

/**
 * Fastify JSON Schema for the :id URL parameter.
 */
export const patchTodoParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
} as const;

/**
 * Fastify JSON Schema for the 200 response envelope: { data: Todo }.
 */
export const patchTodoResponseSchema = {
  type: 'object',
  properties: {
    data: todoJsonSchema,
  },
  required: ['data'],
} as const;
