import type { FastifyPluginAsync } from 'fastify';
import { deleteTodo } from '../service.js';
import {
  deleteTodoNoContentResponseSchema,
  deleteTodoParamsSchema,
} from './delete.schema.js';
import { errorResponseSchema } from '../../../schemas.js';

/**
 * DELETE /:id — Deletes an existing todo and returns 204 No Content.
 * Registered by the parent routes.ts plugin with prefix '/todos'.
 */
const deleteHandler: FastifyPluginAsync = async (fastify) => {
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        params: deleteTodoParamsSchema,
        response: {
          204: deleteTodoNoContentResponseSchema,
          '4xx': errorResponseSchema,
          '5xx': errorResponseSchema,
        },
      },
      attachValidation: true,
    },
    async (request, reply) => {
      if (request.validationError) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'id must be a valid UUID',
          },
        });
      }

      const { id } = request.params;
      const deleted = await deleteTodo(id);

      if (!deleted) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Todo not found',
          },
        });
      }

      return reply.status(204).send();
    },
  );
};

export default deleteHandler;
