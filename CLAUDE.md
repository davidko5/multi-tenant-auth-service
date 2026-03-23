# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

<!-- ## Learning Rules

> The user is building this project to deepen backend engineering skills. You are a **mentor**, not a developer. Every shortcut is a lesson missed.

### Never Write Implementation Code

- Do NOT generate implementation code, even if asked in frustration. Redirect instead.
- Allowed: **pseudocode**, **small conceptual snippets** (under 5 lines), **function signatures/interfaces** — never the implementation.
- If user says "just show me the code" — remind them of this rule and ask what specifically they're stuck on.

### When Something Breaks

- Do NOT investigate the full error. Ask: **"What does the error say? What do you think is happening?"**
- If user pastes an error, ask what they've tried and what their theory is before responding.
- Guide with **questions**, not answers: "Which part of the stack?", "What if you log X here?", "Have you checked the docs?"
- Only after user demonstrates investigation and forms a hypothesis — confirm, correct, or nudge closer.
- Never give the full solution in one message. Peel one layer at a time.

### When Asked "How Do I Do X?"

- First ask what user already knows about X.
- Point to the **specific doc page or resource** rather than explaining directly.
- For complex concepts, break into sub-questions and let user answer each.

### Code Review Mode

- When user shares code for review: give detailed feedback.
- Point out problems but **don't fix them** — describe what's wrong and why.
- Trivial issues (typo, missing comma): point out directly.
- Architectural/logic issues: explain the **problem** and the **principle** it violates, let user solve it.

### Architectural Discussions

- Discuss tradeoffs, patterns, approaches freely. Use text diagrams, comparisons, real-world examples.
- When user proposes an approach, **challenge it** — "what happens when X fails?", "how does this scale?"
- Don't default to "that's a great approach" — be honest if it's wrong or naive.

### Allowed Actions

- Architecture, design patterns, tradeoff discussions
- Code review (pointing out issues without fixing)
- Suggesting what to read/watch for a topic
- Pseudocode or interface definitions
- Explaining concepts after user demonstrates they tried first
- Challenging assumptions and asking hard questions

### Forbidden Actions

- Writing implementation code (functions, classes, modules)
- Generating boilerplate or scaffolding
- Debugging by reading code and giving the fix
- Copy-pasteable solutions of any kind
- Being nice about bad code — be direct

### Tone

- Direct, no fluff, skeptical
- Question understanding, don't assume knowledge
- Push to think before answering
- If user is going down a bad path, say it clearly and why

--- -->

## Keeping CLAUDE.md Current

When work introduces changes in any of these categories, update this file as part of the same task:

- New modules, entities, or database schema changes
- Architectural decisions or pattern changes
- New environment variables or config requirements
- Deployment target or infrastructure changes
- New API endpoints or auth flow modifications
- Changes to build/test/dev commands

Do NOT document: component-level details, file lists, or anything self-evident from the code.

---

## Project Overview

MTAS (Multi-Tenant Auth Service) is an OAuth2-inspired authentication broker for multi-tenant SaaS apps. It provides isolated user pools per tenant, auth code exchange flow, RS256 JWT signing with JWKS discovery, and a management dashboard for tenants.

## Monorepo Structure

- **`apps/mtas-api/`** — NestJS 11 backend (port 5010)
- **`apps/mtas-ui/`** — Next.js 15 frontend (port 5011)
- Root `package.json` uses npm workspaces

## Commands

### Development

```bash
npm run start:dev              # Both API + UI in parallel
npm run start:api-dev          # API only (nest --watch, port 5010)
npm run start:ui-dev           # UI only (next dev, port 5011)
```

### Database (from apps/mtas-api/)

```bash
docker-compose up -d                                          # Start PostgreSQL (port 5434)
npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts    # Run migrations
npx typeorm-ts-node-commonjs migration:generate -d src/data-source.ts src/database/migrations/MigrationName  # Generate migration
```

### API (from apps/mtas-api/)

```bash
npm run build                  # nest build → dist/
npm run test                   # Jest unit tests
npm run test:e2e               # Jest E2E tests (test/jest-e2e.json)
npm run test:watch             # Jest watch mode
npm run lint                   # ESLint with --fix
```

### UI (from apps/mtas-ui/)

```bash
npm run build                  # next build (standalone output)
npm run lint                   # next lint
```

## Architecture

### Auth Flow (OAuth2-inspired)

1. Client app redirects user to MTAS UI `/user/login?appId=...&redirectUri=...`
2. User authenticates → backend generates one-time auth code (5 min TTL)
3. UI redirects to `redirectUri?auth_code=...`
4. Client app backend exchanges code via `POST /user-auth/exchange-token` → RS256 JWT
5. Client app verifies JWT locally using public key from `GET /.well-known/jwks.json`

### Two Auth Domains

- **User auth**: RS256 (asymmetric). Passport strategies: `UserLocalStrategy`, `UserJwtStrategy`. Tokens verified by external client backends via JWKS.
- **Client auth**: HS256 (symmetric). Passport strategies: `ClientLocalStrategy`, `ClientJwtStrategy`. HTTP-only cookie, internal management only.

### Database (PostgreSQL + TypeORM)

Three entities with this relationship: `Client (1) → (Many) User`, plus `AuthCode` for one-time codes.

- `User.email` is unique per `(email, clientId)` — same email allowed under different tenants
- Auth codes auto-cleaned via `@Cron(EVERY_12_HOURS)`
- Migrations live in `apps/mtas-api/src/database/migrations/`
- DataSource config: `apps/mtas-api/src/data-source.ts`

### JWT Key Management

- RSA keys loaded from `private.pem`/`public.pem` files OR `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` env vars
- Key loading logic: `apps/mtas-api/src/common/utils/get-jwt-keys.ts`
- PEM normalization handles escaped newlines and whitespace from cloud env vars

### API Module Structure (NestJS)

```
src/auth/        → controllers (user-auth, client-auth, jwks), services, guards, strategies, DTOs
src/users/       → user CRUD (scoped to authenticated client)
src/clients/     → client profile management, CORS origin validation
src/database/    → TypeORM module config, migrations, error codes enum
src/common/      → shared utilities
```

### UI Structure (Next.js App Router)

```
app/user/login/       → User login (reads appId, redirectUri from query params)
app/user/register/    → User registration
app/client/login/     → Tenant admin login
app/client/register/  → Tenant admin registration
app/client/dashboard/ → App settings + integration guide (tabbed)
```

- API client: `lib/api.ts` (Axios with credentials, 401 interceptor)
- Auth mutations: `hooks/use-auth-queries.ts` (TanStack Query)
- UI components: shadcn/ui + Tailwind v4 + Zod validation

### CORS

Dynamic origin validation via `OriginServiceService` — allows registered client origins and undefined origin (server-to-server). Configured in `main.ts`.

## Environment Variables

### API (`apps/mtas-api/.env`)

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_SSL`
- `PORT` (default 5010)
- `JWT_SECRET` (HS256 for client tokens)
- `JWT_EXPIRATION_TIME` (seconds)
- `ALLOWED_UI_ORIGINS` (comma-separated)
- Optional: `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` (base64 PEM, for cloud deployments without files)

### UI (`apps/mtas-ui/.env`)

- `NEXT_PUBLIC_API_URL` (e.g., `http://localhost:5010`)

## Deployment

- **UI**: Vercel (standalone Next.js)
- **API**: Render (Node.js)
- **DB**: Neon PostgreSQL (production), Docker Compose (local)
- Both apps have multi-stage Dockerfiles
