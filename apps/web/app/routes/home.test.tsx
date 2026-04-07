import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { screen, cleanup, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';

vi.mock('../lib/api/index.server', () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

const mockFetcherSubmit = vi.fn();
const mockFetcher = {
  submit: mockFetcherSubmit,
  state: 'idle' as string,
  data: undefined as
    | { error?: { message: string; type: 'validation' | 'server' } }
    | undefined,
  load: vi.fn(),
};

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');

  return {
    ...actual,
    useFetcher: () => mockFetcher,
  };
});

import type { Todo } from '@bmad/shared';
import { createTodo, updateTodo, deleteTodo } from '../lib/api/index.server';

// Dynamically import the component after mocking
const {
  action,
  applyOptimisticTodoUpdate,
  default: Home,
} = await import('./home');

const mockedCreateTodo = vi.mocked(createTodo);
const mockedUpdateTodo = vi.mocked(updateTodo);
const mockedDeleteTodo = vi.mocked(deleteTodo);

beforeEach(() => {
  mockFetcher.state = 'idle';
  mockFetcher.data = undefined;
  mockedCreateTodo.mockReset();
  mockedUpdateTodo.mockReset();
  mockedDeleteTodo.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: crypto.randomUUID(),
  text: 'Test todo',
  isCompleted: false,
  createdAt: '2026-03-10T15:00:00.000Z',
  ...overrides,
});

it('renders EmptyState first-use variant when loader returns empty array', () => {
  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home />);

  expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  expect(
    screen.getByText('Type above to capture your first task.'),
  ).toBeInTheDocument();
});

it('renders each todo text and formatted createdAt when todos exist', () => {
  const todos = [
    makeTodo({ text: 'Buy groceries', createdAt: '2026-03-10T15:00:00.000Z' }),
    makeTodo({ text: 'Walk the dog', createdAt: '2026-03-09T10:30:00.000Z' }),
  ];

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos }} />);

  expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  expect(screen.getByText('Walk the dog')).toBeInTheDocument();
});

it('renders todos within a max-width container', () => {
  const todos = [makeTodo({ text: 'A todo' })];

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos }} />);

  const todoText = screen.getByText('A todo');
  // Walk up to find the Container element with max-width style
  const container = todoText.closest('[style*="max-width"], [class]');
  expect(container).toBeInTheDocument();
});

it('renders EmptyState all-done variant when all todos are completed', () => {
  const todos = [makeTodo({ text: 'Done task', isCompleted: true })];

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos }} />);

  expect(screen.getByText('All done!')).toBeInTheDocument();
  expect(screen.getByText('Your active list is clear.')).toBeInTheDocument();
});

it('renders active and completed section headers with correct counts', () => {
  const todos = [
    makeTodo({ text: 'Active task', isCompleted: false }),
    makeTodo({ text: 'Active task 2', isCompleted: false }),
    makeTodo({ text: 'Done task', isCompleted: true }),
  ];

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos }} />);

  expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  expect(screen.getByText('COMPLETED')).toBeInTheDocument();

  const liveRegions = screen.getAllByText(/^—\s\d+$/, {
    selector: '[aria-live="polite"]',
  });
  expect(liveRegions).toHaveLength(2);
});

it('renders TaskInput for creating todos', () => {
  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos: [] }} />);

  expect(screen.getByPlaceholderText('Add a task...')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
});

it('passes validation error to TaskInput as errorMessage', () => {
  mockFetcher.data = {
    error: {
      message: 'text must be between 1 and 255 characters',
      type: 'validation',
    },
  };

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos: [] }} />);

  expect(
    screen.getByText('text must be between 1 and 255 characters'),
  ).toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

it('passes server error to ErrorBar instead of TaskInput', () => {
  mockFetcher.data = {
    error: { message: 'Server blew up', type: 'server' },
  };

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos: [] }} />);

  expect(screen.getByText('Server blew up')).toBeInTheDocument();
  const alert = screen.getByRole('alert');
  expect(alert).toBeInTheDocument();
  // ErrorBar has retry and dismiss buttons
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
});

it('retries the last failed create action when Retry is clicked', () => {
  // @ts-expect-error - testing without router-injected params/matches
  const { rerender } = renderWithProviders(<Home loaderData={{ todos: [] }} />);

  const input = screen.getByPlaceholderText('Add a task...');
  const addButton = screen.getByRole('button', { name: 'Add' });

  fireEvent.change(input, { target: { value: 'Retry me' } });
  fireEvent.click(addButton);

  expect(mockFetcherSubmit).toHaveBeenCalledTimes(1);

  mockFetcher.data = {
    error: { message: 'Server blew up', type: 'server' },
  };

  // @ts-expect-error - testing without router-injected params/matches
  rerender(<Home loaderData={{ todos: [] }} />);

  fireEvent.click(screen.getByRole('button', { name: /retry/i }));

  expect(mockFetcherSubmit).toHaveBeenCalledTimes(2);
  const [retryFormData, retryOptions] = mockFetcherSubmit.mock.calls[1] as [
    FormData,
    { method: string },
  ];
  expect(retryFormData).toBeInstanceOf(FormData);
  expect(retryFormData.get('text')).toBe('Retry me');
  expect(retryOptions).toEqual({ method: 'post' });
});

it('clears error state when Dismiss is clicked', () => {
  mockFetcher.data = {
    error: { message: 'Server blew up', type: 'server' },
  };

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos: [] }} />);

  fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

  expect(mockFetcher.load).toHaveBeenCalledWith('.');
});

it('optimistic reducer toggles todo completion state by id', () => {
  const todos = [
    makeTodo({ id: 'todo-toggle', text: 'Toggle me', isCompleted: false }),
  ];

  const next = applyOptimisticTodoUpdate(todos, {
    type: 'toggle',
    id: 'todo-toggle',
  });

  expect(next[0]?.isCompleted).toBe(true);
  expect(next).toHaveLength(1);
});

it('optimistic reducer removes todo by id for delete action', () => {
  const todos = [
    makeTodo({ id: 'todo-delete', text: 'Delete me' }),
    makeTodo({ id: 'todo-keep', text: 'Keep me' }),
  ];

  const next = applyOptimisticTodoUpdate(todos, {
    type: 'delete',
    id: 'todo-delete',
  });

  expect(next).toHaveLength(1);
  expect(next[0]?.id).toBe('todo-keep');
});

it('action returns network error message for network-like failures', async () => {
  mockedCreateTodo.mockRejectedValueOnce(new Error('fetch failed'));

  const body = new URLSearchParams();
  body.set('text', 'Buy milk');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(result).toEqual({
    error: {
      message: 'Network error. Please try again.',
      type: 'server',
    },
  });
});

it('action returns generic server message for non-network failures', async () => {
  mockedCreateTodo.mockRejectedValueOnce(
    new Error('500 Internal Server Error'),
  );

  const body = new URLSearchParams();
  body.set('text', 'Buy milk');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(result).toEqual({
    error: {
      message: 'Something went wrong. Please try again.',
      type: 'server',
    },
  });
});

// ─── Toggle action tests ─────────────────────────────────────────────────────

it('action with intent=toggle calls updateTodo with correct id and toggled completed value', async () => {
  mockedUpdateTodo.mockResolvedValueOnce(
    makeTodo({ id: 'toggle-id', isCompleted: true }),
  );

  const body = new URLSearchParams();
  body.set('intent', 'toggle');
  body.set('id', 'toggle-id');
  body.set('completed', 'false');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(mockedUpdateTodo).toHaveBeenCalledWith('toggle-id', {
    completed: true,
  });
  expect(result).toEqual({});
});

it('action with intent=toggle returns network error on network failure', async () => {
  mockedUpdateTodo.mockRejectedValueOnce(new Error('fetch failed'));

  const body = new URLSearchParams();
  body.set('intent', 'toggle');
  body.set('id', 'toggle-id');
  body.set('completed', 'false');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(result).toEqual({
    error: {
      message: 'Network error. Please try again.',
      type: 'server',
    },
  });
});

it('action with intent=toggle returns server error on non-network failure', async () => {
  mockedUpdateTodo.mockRejectedValueOnce(
    new Error('500 Internal Server Error'),
  );

  const body = new URLSearchParams();
  body.set('intent', 'toggle');
  body.set('id', 'toggle-id');
  body.set('completed', 'true');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(result).toEqual({
    error: {
      message: 'Something went wrong. Please try again.',
      type: 'server',
    },
  });
});

// ─── Delete action tests ─────────────────────────────────────────────────────

it('action with intent=delete calls deleteTodo with correct id', async () => {
  mockedDeleteTodo.mockResolvedValueOnce(undefined);

  const body = new URLSearchParams();
  body.set('intent', 'delete');
  body.set('id', 'delete-id');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(mockedDeleteTodo).toHaveBeenCalledWith('delete-id');
  expect(result).toEqual({});
});

it('action with intent=delete returns network error on network failure', async () => {
  mockedDeleteTodo.mockRejectedValueOnce(new Error('fetch failed'));

  const body = new URLSearchParams();
  body.set('intent', 'delete');
  body.set('id', 'delete-id');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(result).toEqual({
    error: {
      message: 'Network error. Please try again.',
      type: 'server',
    },
  });
});

it('action with intent=delete returns server error on non-network failure', async () => {
  mockedDeleteTodo.mockRejectedValueOnce(
    new Error('500 Internal Server Error'),
  );

  const body = new URLSearchParams();
  body.set('intent', 'delete');
  body.set('id', 'delete-id');
  const request = new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const result = await action({ request } as never);

  expect(result).toEqual({
    error: {
      message: 'Something went wrong. Please try again.',
      type: 'server',
    },
  });
});
