import { it, expect } from 'vitest';
import { formatTimestamp } from './format-timestamp';

it('formats an ISO date string into a readable short date with time', () => {
  const result = formatTimestamp('2026-03-10T15:00:00.000Z');

  // Intl.DateTimeFormat output varies by timezone, so check structure
  expect(result).toMatch(/Mar\s+10/);
});

it('handles midnight timestamps', () => {
  const result = formatTimestamp('2026-01-01T00:00:00.000Z');

  expect(result).toMatch(/Jan\s+1/);
});

it('handles end-of-year timestamps', () => {
  // UTC 23:59 may roll to Jan 1 depending on local timezone
  const result = formatTimestamp('2026-12-31T12:00:00.000Z');

  expect(result).toMatch(/Dec\s+31/);
});
