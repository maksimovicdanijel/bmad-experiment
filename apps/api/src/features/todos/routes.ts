import type { FastifyPluginAsync } from 'fastify';
import deleteHandler from './handlers/delete.route.js';
import getHandler from './handlers/get.route.js';
import patchHandler from './handlers/patch.route.js';
import postHandler from './handlers/post.route.js';

/**
 * todosRoutes — Aggregator plugin for the /todos resource.
 * Registers all HTTP verb handlers from the handlers/ directory.
 *
 * To add a new endpoint:
 * 1. Create a new handler file in handlers/ (e.g., post.route.ts)
 * 2. Import and register it here
 *
 * Do NOT wrap with fastify-plugin — route encapsulation is intentional.
 */
const todosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(deleteHandler);
  fastify.register(getHandler);
  fastify.register(patchHandler);
  fastify.register(postHandler);
};

export default todosRoutes;
