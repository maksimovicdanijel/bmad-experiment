import { it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import { EmptyState } from './empty-state';

afterEach(cleanup);

it('first-use variant renders clipboard icon, headline, and copy', () => {
  renderWithProviders(<EmptyState variant="first-use" />);

  expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  expect(
    screen.getByText('Type above to capture your first task.'),
  ).toBeInTheDocument();
});

it('all-done variant renders checkmark icon, headline, and copy', () => {
  renderWithProviders(<EmptyState variant="all-done" />);

  expect(screen.getByText('All done!')).toBeInTheDocument();
  expect(screen.getByText('Your active list is clear.')).toBeInTheDocument();
});

it('has role="status" and aria-live="polite"', () => {
  renderWithProviders(<EmptyState variant="first-use" />);

  const statusElement = screen.getByRole('status');
  expect(statusElement).toBeInTheDocument();
  expect(statusElement).toHaveAttribute('aria-live', 'polite');
});
