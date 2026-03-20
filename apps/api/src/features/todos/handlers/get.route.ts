import type { FastifyPluginAsync } from 'fastify';
import { listTodos } from '../service.js';
import { todoJsonSchema } from './get.schema.js';
import { errorResponseSchema } from '../../../schemas.js';

/**
 * GET / — Returns all todos ordered by createdAt descending.
 * Registered by the parent routes.ts plugin with prefix '/todos'.
 */
const getHandler: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              data: { type: 'array', items: todoJsonSchema },
            },
            required: ['data'],
          },
          '4xx': errorResponseSchema,
          '5xx': errorResponseSchema,
        },
      },
    },
    async () => {
      const todos = await listTodos();
      return { data: todos };
    },
  );
};

export default getHandler;
