import type { FastifyPluginAsync } from 'fastify';
import type { CreateTodoRequest } from '@bmad/shared';
import { createTodo } from '../service.js';
import {
  createTodoBodySchema,
  createTodoResponseSchema,
} from './post.schema.js';
import { errorResponseSchema } from '../../../schemas.js';

/**
 * POST / — Creates a new todo and returns { data: Todo }.
 * Registered by the parent routes.ts plugin with prefix '/todos'.
 *
 * Uses attachValidation so validation errors can be formatted
 * with the application-specific message before responding.
 */
const postHandler: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: CreateTodoRequest }>(
    '/',
    {
      schema: {
        body: createTodoBodySchema,
        response: {
          201: createTodoResponseSchema,
          '4xx': errorResponseSchema,
          '5xx': errorResponseSchema,
        },
      },
      attachValidation: true,
    },
    async (request, reply) => {
      if (request.validationError) {
        const isTextError = request.validationError.validation?.some(
          (err: {
            instancePath?: string;
            keyword?: string;
            params?: Record<string, string>;
          }) =>
            err.instancePath === '/text' ||
            (err.keyword === 'required' &&
              err.params?.missingProperty === 'text'),
        );

        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: isTextError
              ? 'text must be between 1 and 255 characters'
              : request.validationError.message,
          },
        });
      }

      const { text } = request.body;
      const todo = await createTodo(text);
      return reply.status(201).send({ data: todo });
    },
  );
};

export default postHandler;
