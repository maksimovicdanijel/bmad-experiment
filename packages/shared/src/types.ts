export interface Todo {
  id: string; // UUID v4
  text: string; // 1–255 characters
  isCompleted: boolean;
  createdAt: string; // ISO 8601 — "2026-03-09T12:00:00.000Z"
}

export interface CreateTodoRequest {
  text: string;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean; // Note: request uses 'completed', response uses 'isCompleted'
}

// API envelope types
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string; // SCREAMING_SNAKE_CASE: NOT_FOUND, VALIDATION_ERROR, INTERNAL_ERROR
    message: string;
  };
}
