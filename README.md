# MassPension.com

Massachusetts public employee pension calculator implementing official MSRB (Massachusetts State Retirement Board) formulas for Groups 1–4. Helps state employees model retirement scenarios, compare Options A/B/C, project COLA adjustments, and estimate healthcare costs.

**Stack:** Next.js 15 · React 19 · TypeScript · Prisma 6 · Supabase (PostgreSQL) · NextAuth.js · Stripe · Tailwind CSS · Radix UI

---

## Getting started

```bash
npm ci
cp .env.example .env.local   # fill in required values (see Environment Variables below)
npm run db:generate           # generate Prisma client
npm run dev                   # http://localhost:3000
```

## Development commands

```bash
npm run dev              # dev server
npm run build            # production build (Prisma generate + Next build)
npm run type-check       # TypeScript strict check
npm run lint             # ESLint

npm test                 # Jest
npm run test:watch       # watch mode
npm run test:coverage    # coverage report
npm run test:integration # integration tests only

# Pension math validation
npm run validate-calculations   # validate calc outputs against known values
npm run validate:msrb           # run full MSRB audit

# Database
npm run db:generate      # regenerate Prisma client after schema changes
npm run db:migrate       # deploy pending migrations
npm run db:studio        # Prisma Studio GUI
npm run db:seed          # seed initial data
```

Running a single test file:
```bash
npx jest __tests__/unit/pension-calculations.test.ts
```

## Environment variables

Required in `.env.local` for local development:

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

## Architecture

```
app/              Next.js App Router — pages and API routes
components/       React components; components/ui/ holds Shadcn/Radix primitives
lib/              Business logic — pension math, AI, email, database helpers
hooks/            Custom React hooks (use-retirement-data.ts is the central state hook)
contexts/         React Context providers
prisma/           Schema + migrations (multi-schema: auth + public)
__tests__/        Jest test suite
scripts_app/      Deploy, backup, and validation scripts
```

Path alias: `@/*` resolves to the repository root.

### Pension calculations

Core domain lives in `lib/pension-calculations.ts` (MSRB factor tables, Groups 1–4, pre/post April 2 2012 hire date rules, Options A/B/C) and `lib/standardized-pension-calculator.ts`. After any change to calculation logic, run `npm run validate:msrb` to verify correctness against MSRB published tables.

### Database

Prisma uses the `multiSchema` preview feature with two schemas:
- `auth` — Supabase-managed authentication tables (do not migrate manually)
- `public` — application tables

After schema changes: `npm run db:generate`, then `npm run db:migrate` for production.

## Deployment (Vercel)

- Set **Project Root Directory** to `.` in Vercel Dashboard → Settings → General
- `vercel.json` at the root contains function/runtime overrides
- Required production env vars: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Repository layout notes

The application was flattened to the repository root on 2025-10-25 (previously nested under `v0-retirement/`). Legacy folders are quarantined and unused:

- `archive_root/` — legacy `app/`, `components/`, `lib/`, `public/` from the old root
- `archive_flatten_backup/` — backup snapshot from the flattening step

Do not import from these directories.
