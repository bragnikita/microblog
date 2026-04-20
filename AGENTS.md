# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Nuxt 4 project with a modular structure: `app/` (frontend), `server/` (backend logic), and `shared/` (utilities, types, constants).
- Uses TypeScript throughout, with Vue SFCs for UI and composables for logic reuse.
- Backend logic (API, services, middleware) is in `server/`. Shared code is in `shared/`.
- Follows Nuxt conventions for routing, layouts, and middleware, but has custom service and utility layers.

## Key Patterns & Conventions
- **Frontend:**
  - Pages: `app/pages/` (auto-routed by Nuxt)
  - Components: `app/components/` (organized by feature)
  - Layouts: `app/layouts/`
  - Middleware: `app/middleware/` (client-side), `server/middleware/` (server-side)
  - Use TailwindCSS for styling as much as possible (utility classes preferred over custom CSS).
  - Use NuxtUI components for buttons and forms for consistency and accessibility.
- **Backend:**
  - API/serverless functions: `server/functions/`
  - Services (DB, S3, etc): `server/services/`
  - Utilities: `server/utils/`, `shared/utils.ts`
- **Types/constants:**
  - Shared types/constants: `shared/`
  - Feature-specific models: e.g., `app/components/image/model.ts`

## Developer Workflows
- **Install dependencies:** `pnpm install`
- **Dev server:** `pnpm sst:dev` (frontend + server)
- **Lint:** (see `eslint.config.mjs`)
- **Type-check:** `tsc --noEmit`
- **Nuxt build:** `pnpm nuxt:build`

## Integration & Data Flow
- Frontend calls backend via Nuxt server routes (see `server/functions/`).
- Services (e.g., DB, S3) are abstracted in `server/services/`.
- Shared logic/types are imported from `shared/`.
- Middleware is split: client logic in `app/middleware/`, server logic in `server/middleware/`.

## Project-Specific Notes
- Use feature folders for components/models (e.g., `app/components/image/`).
- Prefer composables and utility functions for logic reuse.
- Error handling is centralized in `server/utils/error-handler.ts`.
- Date/time formatting is in `server/utils/dateTimeFormatter.ts` and `shared/formatters.ts`.
- Static assets are in `public/`.

## Examples
- To add a new API: create a file in `server/functions/`.
- To add a shared type: update `shared/types.d.ts`.
- To add a new frontend page: add a Vue file to `app/pages/`.

Refer to this file and the project structure for guidance. When in doubt, follow existing patterns and check related feature folders.