import type { FastifyPluginAsync } from 'fastify';
import { listTodos } from './todos.service.js';
import { todoJsonSchema } from './todos.schema.js';
import { errorResponseSchema } from '../schemas.js';

/**
 * todosRoutes — Fastify plugin for the /todos resource.
 * Do NOT wrap with fastify-plugin — route encapsulation is intentional.
 */
const todosRoutes: FastifyPluginAsync = async (fastify) => {
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

export default todosRoutes;
