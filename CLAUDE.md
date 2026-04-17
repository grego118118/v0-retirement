# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MassPension.com — a Massachusetts public employee pension calculator implementing official MSRB (Massachusetts State Retirement Board) formulas. The app is a full-stack Next.js 15 application deployed on Vercel with Supabase/PostgreSQL as the database.

**The repository root is the application root.** Legacy folders (`archive_root/`, `archive_flatten_backup/`) exist from a 2025 flattening migration — do not touch them.

## Commands

All commands run from the repository root.

```bash
# Development
npm run dev                    # Start dev server at localhost:3000
npm run build                  # Prisma generate + Next.js build
npm run type-check             # TypeScript strict check (tsconfig.build.json)
npm run lint                   # ESLint

# Testing
npm test                       # Run Jest (jsdom)
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test:integration       # Integration tests only

# Pension math validation
npm run validate-calculations  # Validate pension math against known outputs
npm run validate:msrb          # Run MSRB audit script

# Database
npm run db:generate            # Regenerate Prisma client after schema changes
npm run db:migrate             # Deploy pending migrations (production)
npm run db:studio              # Prisma Studio GUI
```

Running a single test file:
```bash
npx jest __tests__/unit/pension-calculations.test.ts
```

## Architecture

### Data flow

1. User input → `components/pension-calculator.tsx` (136 KB, primary UI)
2. Calculator state managed by `hooks/use-retirement-data.ts` (40 KB, central hook)
3. State shared via `contexts/retirement-data-context.tsx`
4. Pension math in `lib/pension-calculations.ts` (MSRB formulas) + `lib/standardized-pension-calculator.ts`
5. Results rendered in `components/pension-results.tsx`
6. Optional persistence via API routes → Prisma → Supabase PostgreSQL

### Key directories

- `app/` — Next.js App Router. Pages at `app/[feature]/page.tsx`, API at `app/api/[feature]/route.ts`
- `components/` — React components. `components/ui/` holds Shadcn/Radix primitives
- `lib/` — Business logic. Domain-specific subfolders: `lib/ai/`, `lib/pension/`, `lib/email/`, `lib/database/`
- `hooks/` — Custom React hooks
- `contexts/` — React Context providers
- `prisma/` — Schema, migrations. Uses `multiSchema` preview feature (schemas: `auth` + `public`)
- `__tests__/` — Jest test suite
- `scripts_app/` — Deploy, backup, and validation scripts

### Pension calculation domain

This is the core of the product. Key files:
- `lib/pension-calculations.ts` — MSRB factor tables and calculation engine for Groups 1–4, pre/post April 2, 2012 hire date rules, Options A/B/C
- `lib/option-c-systematic.ts` — Option C (survivor benefit) calculations
- `lib/healthcare-calculator.ts` — GIC healthcare cost projections
- `lib/standardized-pension-calculator.ts` — Unified calculation interface

The pension math must match MSRB published tables exactly. Use `npm run validate:msrb` to verify correctness after any changes to calculation logic.

### Authentication & subscriptions

- NextAuth.js 4 with Google OAuth + Prisma adapter
- Session provider wraps the root layout (`app/layout.tsx`)
- `hooks/use-subscription.ts` tracks premium tier; gated features check subscription status
- Stripe handles payment; webhook handlers in `app/api/subscription/`

### Embed widget

`/embed/*` routes are served with permissive CSP headers (`frame-ancestors *`) to allow third-party iframe embedding. All other routes use strict `X-Frame-Options: SAMEORIGIN`. Do not relax the non-embed CSP without careful review.

### AI content generation

`lib/ai/` uses Google Gemini API for automated blog post generation, triggered by cron jobs at `app/api/cron/`.

## Database

Prisma schema uses `multiSchema` with two schemas:
- `auth` — Supabase-managed authentication tables (do not migrate manually)
- `public` — Application tables (`pension_calculations`, `user_subscriptions`, etc.)

Model names use `snake_case`. After schema changes: `npm run db:generate`, then `npm run db:migrate` for production deployments.

## Path aliases

`@/*` resolves to the repository root. Examples:
```ts
import { foo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
```

## Testing notes

Several test suites are intentionally ignored in `jest.config.js` (Phase 2 features not yet implemented: E2E, social security calculations, scenario modeling, accessibility, performance). Do not un-ignore these unless the underlying features are implemented. Focus tests on `__tests__/unit/` and the pension calculation validation scripts.

## Environment variables

Required for local development (`.env.local`):
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
GEMINI_API_KEY=<key>
CRON_SECRET=<secret>
```

## Production / Vercel

- Project Root Directory in Vercel must be `.` (repository root)
- `vercel.json` at the root contains function/runtime overrides
- `tsconfig.production.json` is used for production builds (excludes dev pages)
- `/dev/*` routes are redirected to 404 in production via `next.config.js` rewrites
- `components/wizard/wizard-v2-dev.tsx` is aliased to its `.production.tsx` stub in production builds

## Task management

This project uses Task Master AI (`.taskmaster/`). Tasks are tracked in `.taskmaster/tasks/tasks.json`. Use `task-master list` / `task-master next` to navigate work items. See `.cursor/rules/dev_workflow.mdc` for the full workflow.
