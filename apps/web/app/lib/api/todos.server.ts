import type { Todo } from '@bmad/shared';
import type { ApiSuccess } from '@bmad/shared';
import { API_BASE_URL } from './setup.server';

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_BASE_URL}/todos/`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const body: ApiSuccess<Todo[]> = await response.json();
  return body.data;
}
