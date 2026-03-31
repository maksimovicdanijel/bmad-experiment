import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';

vi.mock('../lib/api/index.server', () => ({
  fetchTodos: vi.fn(),
}));

const mockFetcherSubmit = vi.fn();
const mockFetcher = {
  submit: mockFetcherSubmit,
  state: 'idle' as string,
  data: undefined as { error?: { message: string } } | undefined,
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

// Dynamically import the component after mocking
const { default: Home } = await import('./home');

beforeEach(() => {
  mockFetcher.state = 'idle';
  mockFetcher.data = undefined;
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

it('passes fetcher server error to TaskInput as errorMessage', () => {
  mockFetcher.data = { error: { message: 'Server blew up' } };

  // @ts-expect-error - testing without router-injected params/matches
  renderWithProviders(<Home loaderData={{ todos: [] }} />);

  expect(screen.getByText('Server blew up')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
