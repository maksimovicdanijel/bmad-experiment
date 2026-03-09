import Fastify from 'fastify';

export const app = Fastify({ logger: true });

app.get('/health', async () => {
  return { status: 'ok' };
});

// Start server only when run directly (not during tests)
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';

  app.listen({ port, host }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}
