/**
 * Fastify JSON Schema for DELETE /todos/:id URL parameter.
 */
export const deleteTodoParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
} as const;

/**
 * Fastify JSON Schema for 204 No Content response.
 */
export const deleteTodoNoContentResponseSchema = {
  type: 'null',
} as const;
