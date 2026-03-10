import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';

const apiRoot = new URL('../..', import.meta.url).pathname;

export default async function setup() {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withStartupTimeout(120_000)
    .start();

  const connectionUri = container.getConnectionUri();
  process.env.DATABASE_URL = connectionUri;

  // Run Drizzle migrations against the ephemeral container
  try {
    execSync('npx drizzle-kit migrate', {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL: connectionUri },
      stdio: 'pipe',
    });
  } catch (error: unknown) {
    const execError = error as { stderr?: Buffer };
    const stderr = execError.stderr?.toString() ?? '';
    throw new Error(
      `Drizzle migration failed against testcontainers PostgreSQL:\n${stderr}`,
    );
  }

  // Return teardown function — Vitest calls this after all tests complete
  return async function teardown() {
    await container.stop();
  };
}
