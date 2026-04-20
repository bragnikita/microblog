# Haji-no-Mura Blog

A Nuxt 4 blog application. See [Nuxt docs](https://nuxt.com/docs/getting-started/introduction) and [Nuxt UI docs](https://ui.nuxt.com) to learn more.

## Development Environment

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/)
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

Spin up the local PostgreSQL instance:

```bash
pnpm run db:start
```

This starts a PostgreSQL 17 container on port `5432` (configurable via `.env`).
Default credentials: user `postgres`, password `postgres`, database `microblog`.

To stop the database:

```bash
pnpm run db:stop
```

### 3. Configure environment variables

Copy or create a `.env` file in the project root if you want to override defaults:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=microblog
POSTGRES_PORT=5432
```

### 4. Run migrations

```bash
pnpm run db:migrate
```

### 5. Start the dev server

```bash
pnpm run sst:dev
```

The app will be available at `http://localhost:3000`.

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

## Database & Drizzle ORM

The project uses [Drizzle ORM](https://orm.drizzle.team) with two target databases:

| Target | When used |
|--------|-----------|
| **Local PostgreSQL** (Docker) | Day-to-day local development |
| **Aurora DSQL** (AWS) | Production and staging (via SST) |

The same schema and migrations run against both targets. Because Aurora DSQL does not support foreign-key or CHECK constraints, those are omitted from the schema and enforced at the application layer instead.

### Schema

The schema is defined in [server/db/schema.ts](server/db/schema.ts).  
The Drizzle config file is [drizzle.config.ts](drizzle.config.ts).  
Generated migration SQL files live in [drizzle/migrations/](drizzle/migrations/).

---

### Local PostgreSQL workflow

#### Environment variables

All variables have defaults that match the Docker Compose file, so a `.env` is optional for purely local work. Override as needed:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```

#### Start / stop the database

```bash
pnpm run db:start   # docker compose up -d
pnpm run db:stop    # docker compose down
pnpm run db:login   # open psql inside the container
```

#### Generate a migration after changing the schema

```bash
pnpm run db:generate
```

This runs `drizzle-kit generate` and writes a new SQL file to `drizzle/migrations/`.

#### Apply migrations to local Postgres

```bash
pnpm run db:migrate
# or equivalently:
tsx migration.ts
```

#### Push schema directly (skips migration files — use for quick experiments only)

```bash
pnpm run db:push
```

#### Open Drizzle Studio (visual DB browser)

```bash
pnpm run db:studio
```

---

### Aurora DSQL workflow

DSQL is accessed through an SST-linked resource. The connection is IAM-authenticated — no password is needed; the `@aws/aurora-dsql-node-postgres-connector` handles token generation automatically.

#### Prerequisites

- Valid AWS credentials with access to the DSQL cluster (profile `private` by default, or set `AWS_PROFILE` / standard AWS env vars).
- The SST stack must be deployed or running (`pnpm run sst:dev`) so that `Resource.dsql.endpoint` is available.

#### Environment variables

DSQL connectivity is resolved from the SST resource — no extra `.env` variables are required for the connection itself. Standard AWS credential env vars are respected if you are not using named profiles:

```env
AWS_REGION=ap-northeast-1       # defaults to ap-northeast-1 if unset
AWS_PROFILE=private             # used in non-CI environments
# or
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...           # if using temporary credentials
```

#### Apply migrations to DSQL

```bash
pnpm run db:migrate:dsql
# or equivalently:
tsx migration.ts --dsql
```

The migration script ([migration.ts](migration.ts)) detects the `--dsql` flag, opens a DSQL connection via `getDsqlDb()`, and runs all pending migrations from `drizzle/migrations/`.

> **Note:** `drizzle-kit push` and `drizzle-kit studio` are not supported against DSQL. Use the migration file workflow instead.

---

### Typical development cycle

1. Edit `server/db/schema.ts`.
2. Generate a migration: `pnpm run db:generate`.
3. Review the generated SQL in `drizzle/migrations/`.
4. Apply locally: `pnpm run db:migrate`.
5. Test with the dev server: `pnpm run sst:dev`.
6. When ready to deploy, apply to DSQL: `pnpm run db:migrate:dsql`.
