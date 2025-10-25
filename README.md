# MassPension.com Repository

This repository contains the Mass Pension Next.js application. The application now lives at the repository root (flattened from `v0-retirement/` on 2025-10-25).

## Repository layout

- Repository root ← Application root (use this for all dev, build, and deploy commands)
  - package.json, next.config.js, app/, components/, lib/, prisma/, public/, styles/
  - tsconfig.json, tsconfig.build.json, tsconfig.production.json
  - vercel.json (function/runtime overrides for the app)
  - scripts_app/ (migrated from v0-retirement/scripts)
- archive_root/   ← Quarantined legacy folders from the original repository root (not used)
  - app_legacy/, components_legacy/, lib_legacy/, public_legacy/
- archive_flatten_backup/ ← Backup from flattening step (not used)

Rationale: the legacy root-level app/, components/, lib/, public/ folders caused editor path resolution confusion and potential deployment misconfiguration. They have been moved to `archive_root/`.

## Development

From the repository root:

```bash
npm ci
npm run dev
```

Useful scripts (run at repository root):

- Type check: `npm run type-check`
- Build: `npm run build`
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Prisma: `npx prisma generate`, `npm run db:migrate`

Path aliases:
- `@/*` resolves relative to the repository root. Example: `import { foo } from '@/lib/utils'`.

## Prisma & Database

- Prisma schema: `prisma/schema.prisma`
- Datasource uses `DATABASE_URL` (PostgreSQL/Supabase). Configure in Vercel Environment Variables.
- `binaryTargets` includes `rhel-openssl-3.0.x` for Vercel Linux compatibility.

Common commands (run at repository root):

```bash
npx prisma generate
npm run db:migrate
npx prisma studio
```

## Deployment (Vercel)

- Ensure Project Root Directory is the repository root (.) in Vercel Dashboard → Settings → General.
- Use defaults for install/build unless overridden by `vercel.json`.
- Required env vars (Production):
  - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (if using Google OAuth)
  - Optional: `SEED_SECRET` (temporary admin seeding)

## Notes about quarantine (2025-10-25)

Performed actions to eliminate ambiguity:
- Moved root `app/` → `archive_root/app_legacy/`
- Moved root `components/` → `archive_root/components_legacy/`
- Moved root `lib/` → `archive_root/lib_legacy/`
- Moved root `public/` → `archive_root/public_legacy/`
- Renamed root `vercel.json` → `vercel.root.ignore.json`
- Renamed root `tsconfig.json` → `tsconfig.workspace.json`

If you need to restore any legacy files, copy from `archive_root/*_legacy/` back to the repository root, but note this is not recommended.

## Optional: Editor tips

Open the repository root in your editor. If you have a previous workspace pinned to `v0-retirement/`, update it to the repository root.

