/**
 * Common JSON Schema definitions shared across all route handlers.
 * Used for OpenAPI spec generation and Fastify response serialisation.
 */

/**
 * Standard API error envelope: `{ error: { code, message } }`
 * Applied to 4xx and 5xx response schemas.
 */
export const errorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['code', 'message'],
    },
  },
  required: ['error'],
} as const;
