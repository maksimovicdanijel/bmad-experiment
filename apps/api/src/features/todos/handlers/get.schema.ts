/**
 * JSON Schema for Todo response shapes (used in OpenAPI spec generation).
 * Co-located with the GET handler that consumes it.
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
