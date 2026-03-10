import { it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import { SectionHeader } from './section-header';

afterEach(cleanup);

it('renders label text and count', () => {
  renderWithProviders(<SectionHeader label="ACTIVE" count={3} />);

  expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  expect(screen.getByText('— 3')).toBeInTheDocument();
});

it('shows — 0 when count is 0', () => {
  renderWithProviders(<SectionHeader label="COMPLETED" count={0} />);

  expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  expect(screen.getByText('— 0')).toBeInTheDocument();
});

it('has role="heading" and aria-level="2"', () => {
  renderWithProviders(<SectionHeader label="ACTIVE" count={1} />);

  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toBeInTheDocument();
});

it('wraps count in aria-live="polite"', () => {
  renderWithProviders(<SectionHeader label="ACTIVE" count={5} />);

  const liveRegion = screen.getByText('— 5');
  expect(liveRegion).toHaveAttribute('aria-live', 'polite');
});
