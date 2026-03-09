import { writeFile } from 'node:fs/promises';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/bmad_experiment';

const { buildApp } = await import('./server.js');

const app = await buildApp();

try {
  await app.ready();
  const openapi = app.swagger();
  const outputPath = new URL('../openapi.json', import.meta.url);

  await writeFile(outputPath, JSON.stringify(openapi, null, 2), 'utf8');
} finally {
  await app.close();
}
