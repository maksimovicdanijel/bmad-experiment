# bmad-experiment

Monorepo for a Fastify API and React Router v7 SSR web app.

## Prerequisites

- Node.js 24+
- npm 10+
- Docker Desktop (Docker Compose v2)

## Quickstart (under 10 minutes)

1. Install dependencies:
   - `npm install`
2. Create local env file:
   - `cp .env.example .env`
3. Start local PostgreSQL:
   - `npm run db:up`
4. Verify database health:
   - `npm run db:verify`
5. Apply migrations:
   - `npm run db:migrate`
6. Start web + api dev servers:
   - `npm run dev`

## Verify Local Runtime

- API health: http://localhost:3000/health
- API OpenAPI JSON: http://localhost:3000/documentation/json
- Web app: http://localhost:5173

## Quality Gates

- Lint: `npm run lint`
- Tests: `npm run test`
- Build: `npm run build`

## Container Builds

Build API image:

- `docker build -t bmad-api -f apps/api/Dockerfile .`

Run API image:

- `docker run --rm -p 3000:3000 -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/bmad_experiment" bmad-api`

Build web image:

- `docker build -t bmad-web -f apps/web/Dockerfile .`

Run web image:

- `docker run --rm -p 3000:3000 bmad-web`

## Troubleshooting

- Port 5432 busy: stop local postgres service or remap compose port.
- Port 3000 or 5173 busy: stop conflicting processes and retry.
- Docker networking on macOS: use `host.docker.internal` from containers to reach host services.
- Migration errors: confirm `DATABASE_URL` and that postgres is healthy (`npm run db:verify`).
