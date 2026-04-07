import type { FastifyPluginAsync } from 'fastify';
import type { UpdateTodoRequest } from '@bmad/shared';
import { updateTodo } from '../service.js';
import {
  patchTodoBodySchema,
  patchTodoParamsSchema,
  patchTodoResponseSchema,
} from './patch.schema.js';
import { errorResponseSchema } from '../../../schemas.js';

/**
 * PATCH /:id — Updates an existing todo and returns { data: Todo }.
 * Registered by the parent routes.ts plugin with prefix '/todos'.
 *
 * Uses attachValidation so validation errors can be formatted
 * with the application-specific message before responding.
 */
const patchHandler: FastifyPluginAsync = async (fastify) => {
  fastify.patch<{ Params: { id: string }; Body: UpdateTodoRequest }>(
    '/:id',
    {
      schema: {
        params: patchTodoParamsSchema,
        body: patchTodoBodySchema,
        response: {
          200: patchTodoResponseSchema,
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
          }) => err.instancePath === '/text',
        );

        const isMissingOrInvalidBody = request.validationError.validation?.some(
          (err: {
            instancePath?: string;
            keyword?: string;
            params?: Record<string, string>;
          }) => err.instancePath === '' && err.keyword === 'type',
        );

        if (isMissingOrInvalidBody) {
          return reply.status(400).send({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'At least one field (text or completed) is required',
            },
          });
        }

        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: isTextError
              ? 'text must be between 1 and 255 characters'
              : request.validationError.message,
          },
        });
      }

      const { id } = request.params;
      const body = request.body;

      // Check for empty body — at least one field is required
      if (!body.text && body.completed === undefined) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field (text or completed) is required',
          },
        });
      }

      const todo = await updateTodo(id, body);

      if (!todo) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Todo not found',
          },
        });
      }

      return reply.status(200).send({ data: todo });
    },
  );
};

export default patchHandler;
