import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globalSetup: ['./src/test/global-setup.ts'],
    // All test files share a single testcontainers PostgreSQL instance.
    // Parallel file execution causes cross-file DB state interference.
    fileParallelism: false,
  },
});
