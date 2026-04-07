import type {
  ApiError,
  ApiSuccess,
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest,
} from '@bmad/shared';
import { API_BASE_URL } from './setup.server';

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_BASE_URL}/todos`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const body: ApiSuccess<Todo[]> = await response.json();
  return body.data;
}

export async function createTodo(payload: CreateTodoRequest): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiSuccess<Todo> | ApiError;
  if (!response.ok || 'error' in body) {
    const message =
      'error' in body ? body.error.message : 'Failed to create todo';
    throw new Error(message);
  }

  return body.data;
}

export async function updateTodo(
  id: string,
  data: UpdateTodoRequest,
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const body = (await response.json()) as ApiSuccess<Todo> | ApiError;
  if (!response.ok || 'error' in body) {
    const message =
      'error' in body ? body.error.message : 'Failed to update todo';
    throw new Error(message);
  }

  return body.data;
}

export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    const message = body.error?.message ?? 'Failed to delete todo';
    throw new Error(message);
  }
}
