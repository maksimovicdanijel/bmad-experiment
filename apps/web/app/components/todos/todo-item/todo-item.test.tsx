import { it, expect, afterEach, vi } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { List } from '@chakra-ui/react';
import { renderWithProviders } from '../../../test-utils';
import { TodoItem } from './todo-item';
import type { Todo } from '@bmad/shared';

vi.mock('~/lib/format-timestamp', () => ({
  formatTimestamp: (iso: string) => `formatted:${iso}`,
}));

afterEach(cleanup);

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  text: 'Test todo',
  isCompleted: false,
  createdAt: '2026-03-10T15:00:00.000Z',
  ...overrides,
});

function renderTodoItem(todo: Todo) {
  return renderWithProviders(
    <List.Root as="ul">
      <TodoItem todo={todo} />
    </List.Root>,
  );
}

it('renders todo text and formatted timestamp', () => {
  renderTodoItem(makeTodo({ text: 'Buy milk' }));

  expect(screen.getByText('Buy milk')).toBeInTheDocument();
  expect(
    screen.getByText('formatted:2026-03-10T15:00:00.000Z'),
  ).toBeInTheDocument();
});

it('renders active todo with default text color and no line-through', () => {
  renderTodoItem(makeTodo({ isCompleted: false }));

  const text = screen.getByText('Test todo');
  expect(text).not.toHaveStyle({ textDecoration: 'line-through' });
});

it('renders completed todo with line-through and reduced opacity', () => {
  renderTodoItem(makeTodo({ isCompleted: true }));

  const text = screen.getByText('Test todo');
  expect(text).toHaveStyle({ textDecoration: 'line-through' });
});

it('renders as a list item', () => {
  renderTodoItem(makeTodo());

  expect(screen.getByRole('listitem')).toBeInTheDocument();
});
