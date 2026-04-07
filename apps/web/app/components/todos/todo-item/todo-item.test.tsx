import { it, expect, afterEach, vi, describe } from 'vitest';
import { screen, cleanup, fireEvent } from '@testing-library/react';
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

const noop = () => {};

function renderTodoItem(
  todo: Todo,
  props: {
    onToggle?: (id: string) => void;
    onDelete?: (id: string) => void;
    isMutating?: boolean;
  } = {},
) {
  return renderWithProviders(
    <List.Root as="ul">
      <TodoItem
        todo={todo}
        onToggle={props.onToggle ?? noop}
        onDelete={props.onDelete ?? noop}
        isMutating={props.isMutating}
      />
    </List.Root>,
  );
}

describe('TodoItem display', () => {
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

  it('renders completed todo with line-through and completed color token', () => {
    renderTodoItem(makeTodo({ isCompleted: true }));

    const text = screen.getByText('Test todo');
    expect(text).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('renders as a list item', () => {
    renderTodoItem(makeTodo());

    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});

describe('TodoItem checkbox', () => {
  it('renders a checkbox that is unchecked for active todo', () => {
    renderTodoItem(makeTodo({ isCompleted: false }));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders a checkbox that is checked for completed todo', () => {
    renderTodoItem(makeTodo({ isCompleted: true }));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onToggle with todo id when checkbox is clicked', () => {
    const onToggle = vi.fn();
    renderTodoItem(makeTodo({ id: 'todo-123' }), { onToggle });

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledWith('todo-123');
  });

  it('has aria-label "Mark [task text] as complete" for active todo', () => {
    renderTodoItem(makeTodo({ text: 'Buy milk', isCompleted: false }));

    expect(
      screen.getByRole('checkbox', { name: 'Mark Buy milk as complete' }),
    ).toBeInTheDocument();
  });

  it('has aria-label "Mark [task text] as active" for completed todo', () => {
    renderTodoItem(makeTodo({ text: 'Buy milk', isCompleted: true }));

    expect(
      screen.getByRole('checkbox', { name: 'Mark Buy milk as active' }),
    ).toBeInTheDocument();
  });

  it('has minimum 44×44px touch target', () => {
    renderTodoItem(makeTodo());

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
  });
});

describe('TodoItem delete button', () => {
  it('renders a delete button with aria-label "Delete [task text]"', () => {
    renderTodoItem(makeTodo({ text: 'Buy milk' }));

    expect(
      screen.getByRole('button', { name: 'Delete Buy milk' }),
    ).toBeInTheDocument();
  });

  it('calls onDelete with todo id when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderTodoItem(makeTodo({ id: 'todo-456' }), { onDelete });

    fireEvent.click(screen.getByRole('button', { name: 'Delete Test todo' }));

    expect(onDelete).toHaveBeenCalledWith('todo-456');
  });

  it('has minimum 44×44px touch target', () => {
    renderTodoItem(makeTodo());

    const deleteButton = screen.getByRole('button', {
      name: 'Delete Test todo',
    });
    expect(deleteButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
  });
});

describe('TodoItem loading indicator', () => {
  it('shows a loading overlay when isMutating is true', () => {
    renderTodoItem(makeTodo(), { isMutating: true });

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('does not show a loading overlay when isMutating is false', () => {
    renderTodoItem(makeTodo());

    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
  });
});
