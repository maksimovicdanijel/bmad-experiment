import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import { ErrorBar } from './error-bar';

afterEach(cleanup);

describe('ErrorBar', () => {
  it('renders error message when message prop is provided', () => {
    renderWithProviders(
      <ErrorBar
        message="Network error. Please try again."
        onRetry={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Network error. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders a Retry button that calls onRetry callback when clicked', () => {
    const onRetry = vi.fn();

    renderWithProviders(
      <ErrorBar
        message="Something went wrong."
        onRetry={onRetry}
        onDismiss={vi.fn()}
      />,
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders a Dismiss (×) button that calls onDismiss callback when clicked', () => {
    const onDismiss = vi.fn();

    renderWithProviders(
      <ErrorBar
        message="Something went wrong."
        onRetry={vi.fn()}
        onDismiss={onDismiss}
      />,
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has role="alert" and aria-live="assertive" for screen reader support', () => {
    renderWithProviders(
      <ErrorBar
        message="Error occurred"
        onRetry={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveAttribute('aria-live', 'assertive');
  });

  it('Retry is the first focusable element when ErrorBar appears', () => {
    renderWithProviders(
      <ErrorBar
        message="Error occurred"
        onRetry={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });

    // Retry should appear before Dismiss in the DOM order
    const alertContainer = screen.getByRole('alert');
    const buttons = alertContainer.querySelectorAll('button');
    const retryIndex = Array.from(buttons).indexOf(
      retryButton as HTMLButtonElement,
    );
    const dismissIndex = Array.from(buttons).indexOf(
      dismissButton as HTMLButtonElement,
    );

    expect(retryIndex).toBeLessThan(dismissIndex);
  });

  it('does not render when message prop is undefined', () => {
    const { container } = renderWithProviders(
      <ErrorBar message={undefined} onRetry={vi.fn()} onDismiss={vi.fn()} />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });

  it('does not render when message prop is empty string', () => {
    const { container } = renderWithProviders(
      <ErrorBar message="" onRetry={vi.fn()} onDismiss={vi.fn()} />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });
});
