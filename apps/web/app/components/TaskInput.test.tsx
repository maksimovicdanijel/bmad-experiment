import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { TaskInput } from './TaskInput';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TaskInput', () => {
  it('auto-focuses the input on render', () => {
    const onSubmit = vi.fn();

    renderWithProviders(<TaskInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Add a task...');
    expect(input).toHaveFocus();
  });

  it('submits entered text when Enter triggers form submit', () => {
    const onSubmit = vi.fn();

    renderWithProviders(<TaskInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Add a task...');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'Buy milk' } });
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(onSubmit).toHaveBeenCalledWith('Buy milk');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits entered text when button is clicked', () => {
    const onSubmit = vi.fn();

    renderWithProviders(<TaskInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Add a task...');
    const button = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(input, { target: { value: 'Walk dog' } });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith('Walk dog');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows validation error and blocks submit when text exceeds 255 characters', () => {
    const onSubmit = vi.fn();

    renderWithProviders(<TaskInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Add a task...');
    const button = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(input, { target: { value: 'x'.repeat(256) } });
    fireEvent.click(button);

    expect(
      screen.getByText('text must be between 1 and 255 characters'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears input after successful submit', () => {
    const onSubmit = vi.fn();

    renderWithProviders(<TaskInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      'Add a task...',
    ) as HTMLInputElement;
    const button = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(input, { target: { value: 'Read book' } });
    fireEvent.click(button);

    expect(input.value).toBe('');
  });

  it('renders submit button with a minimum 44x44 touch target', () => {
    const onSubmit = vi.fn();

    renderWithProviders(<TaskInput onSubmit={onSubmit} />);

    const button = screen.getByRole('button', { name: 'Add' });

    expect(button).toHaveAttribute('data-touch-target', '44');
  });

  it('displays server error when errorMessage prop is provided', () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <TaskInput onSubmit={onSubmit} errorMessage="Server error occurred" />,
    );

    expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('clears errorMessage via onErrorClear when user starts typing after a server error', () => {
    const onSubmit = vi.fn();
    const onErrorClear = vi.fn();

    renderWithProviders(
      <TaskInput
        onSubmit={onSubmit}
        errorMessage="Server error occurred"
        onErrorClear={onErrorClear}
      />,
    );

    expect(screen.getByText('Server error occurred')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Add a task...');
    fireEvent.change(input, { target: { value: 'B' } });

    expect(onErrorClear).toHaveBeenCalledTimes(1);
  });

  it('does not call onErrorClear when typing with no server error present', () => {
    const onSubmit = vi.fn();
    const onErrorClear = vi.fn();

    renderWithProviders(
      <TaskInput onSubmit={onSubmit} onErrorClear={onErrorClear} />,
    );

    const input = screen.getByPlaceholderText('Add a task...');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(onErrorClear).not.toHaveBeenCalled();
  });
});
