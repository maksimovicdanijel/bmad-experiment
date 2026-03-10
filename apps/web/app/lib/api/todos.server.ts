import type { Todo } from '@bmad/shared';
import { getTodos } from '../api-client/api.client.mjs';
import './setup.server';

export async function fetchTodos(): Promise<Todo[]> {
  const response = await getTodos({});
  if (response.statusCode !== 200) {
    throw new Error(`API error: ${response.statusCode}`);
  }
  return response.body.data;
}
