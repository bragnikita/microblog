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
pnpm run app:migrate
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
