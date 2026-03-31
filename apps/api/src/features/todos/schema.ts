import { zodToJsonSchema } from 'zod-to-json-schema';
import { createTodoSchema, updateTodoSchema } from '@bmad/shared';

/**
 * JSON Schema objects for Fastify route validation, derived from shared Zod schemas.
 * These are consumed by Fastify's built-in schema validation (ajv under the hood).
 */
export const createTodoJsonSchema = zodToJsonSchema(createTodoSchema, {
  target: 'jsonSchema7',
});
export const updateTodoJsonSchema = zodToJsonSchema(updateTodoSchema, {
  target: 'jsonSchema7',
});

/**
 * JSON Schema for Todo response shapes (used in OpenAPI spec generation).
 */
export const todoJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    text: { type: 'string', minLength: 1, maxLength: 255 },
    isCompleted: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'text', 'isCompleted', 'createdAt'],
} as const;
