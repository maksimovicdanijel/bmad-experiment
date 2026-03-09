import { describe, expect, it } from 'vitest';
import { resolveErrorBoundaryContent } from './root';

describe('resolveErrorBoundaryContent', () => {
  it('returns generic messaging for regular errors', () => {
    const content = resolveErrorBoundaryContent(new Error('kaboom'));

    expect(content.message).toBe('Something went wrong');
    expect(content.details).toContain('kaboom');
  });

  it('returns not-found messaging for 404 route responses', () => {
    const content = resolveErrorBoundaryContent({
      status: 404,
      statusText: 'Not Found',
      data: null,
      internal: false,
    });

    expect(content.message).toBe('Page not found');
    expect(content.details).toBe('The requested page could not be found.');
  });
});
