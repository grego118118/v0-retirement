# MassPension.com Repository

This repository contains the Mass Pension Next.js application. The authoritative app root lives in the `v0-retirement/` subdirectory.

## Repository layout

- v0-retirement/  ← Application root (use this for all dev, build, and deploy commands)
  - package.json, next.config.js, app/, components/, lib/, prisma/, public/, scripts/
  - tsconfig.json, tsconfig.build.json, tsconfig.production.json
  - vercel.json (function/runtime overrides for the app)
- archive_root/   ← Quarantined legacy folders from the repository root (not used)
  - app_legacy/, components_legacy/, lib_legacy/, public_legacy/
- vercel.root.ignore.json (renamed from root vercel.json; not used)
- tsconfig.workspace.json (renamed from root tsconfig.json; not used by the app)

Rationale: the legacy root-level app/, components/, lib/, public/ folders caused editor path resolution confusion and potential deployment misconfiguration. They have been moved to `archive_root/`.

## Development

From the repository root:

```bash
cd v0-retirement
npm ci
npm run dev
```

Useful scripts (run inside v0-retirement):

- Type check: `npm run type-check`
- Build: `npm run build`
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Prisma: `npx prisma generate`, `npm run db:migrate`

Path aliases:
- `@/*` resolves relative to `v0-retirement/`. Example: `import { foo } from '@/lib/utils'`.

## Prisma & Database

- Prisma schema: `v0-retirement/prisma/schema.prisma`
- Datasource uses `DATABASE_URL` (PostgreSQL/Supabase). Configure in Vercel Environment Variables.
- `binaryTargets` includes `rhel-openssl-3.0.x` for Vercel Linux compatibility.

Common commands (run inside v0-retirement):

```bash
npx prisma generate
npm run db:migrate
npx prisma studio
```

## Deployment (Vercel)

- Set Project Root Directory to `v0-retirement/` in Vercel Dashboard → Settings → General.
- Use defaults for install/build unless overridden by `v0-retirement/vercel.json`.
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

To reduce TypeScript multi-root confusion, consider opening the `v0-retirement/` folder directly in your editor, or configure workspace settings to prefer that folder.

