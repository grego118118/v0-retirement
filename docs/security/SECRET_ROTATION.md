# Secret Rotation Runbook — July 2026 credential leak

Two env files (`.1env.local` and `env.local.temp`) were tracked in git with live
credentials. They have been removed from the working tree and gitignored, but
**the values remain in git history** and must be treated as compromised.
Rotate everything below, in this order. No code changes are required for any
rotation — all of these are read from environment variables at runtime.

After rotating each value, update it in Vercel (Project → Settings →
Environment Variables) and redeploy.

## 1. Supabase database password (`DATABASE_URL`) — highest priority

The connection string contained the Postgres password in plaintext.

1. Supabase dashboard → Project Settings → Database → **Reset database password**.
2. Rebuild `DATABASE_URL` with the new password and update it in Vercel.
3. Update any other consumers (local `.env.local`, n8n workflows, backup scripts
   in `scripts_app/`).

## 2. Google OAuth client secret (`GOOGLE_CLIENT_SECRET`)

1. Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client.
2. **Add a new client secret**, update `GOOGLE_CLIENT_SECRET` in Vercel, redeploy,
   then **delete the old secret** once the new deployment is confirmed working.
3. `GOOGLE_CLIENT_ID` is not sensitive and does not need to change.

## 3. GitHub OAuth app secret (`GITHUB_SECRET`)

1. GitHub → Settings → Developer settings → OAuth Apps → your app →
   **Generate a new client secret**, then delete the old one.
2. Update `GITHUB_SECRET` in Vercel. (`GITHUB_ID` is public, no change needed.)
3. Note: no GitHub provider is currently wired into `lib/auth/auth-config.ts` —
   if this OAuth app is unused, delete it entirely instead of rotating.

## 4. Gemini API key (`GEMINI_API_KEY`)

1. Google AI Studio (aistudio.google.com) → API keys → create a new key.
2. Update `GEMINI_API_KEY` in Vercel, redeploy, then delete the old key.
3. Check the billing dashboard for unexpected usage since the leak.

## 5. `NEXTAUTH_SECRET`

Generate a fresh value locally and set it in Vercel:

```bash
openssl rand -base64 32
```

Rotating this **invalidates all active sessions** — every signed-in user will
need to sign in again. Do it during a low-traffic window.

## 6. `CRON_SECRET`

Generate a fresh value the same way (`openssl rand -base64 32`) and set it in
Vercel. Then update every caller that presents it as a bearer token:

- Vercel Cron sends the project's `CRON_SECRET` automatically — no change needed there.
- Any n8n workflows (see `n8n-workflows/`) or external schedulers that call
  `/api/admin/blog/generate*` or `/api/debug/gemini-test` with
  `Authorization: Bearer <CRON_SECRET>` must be updated manually.

## 7. Supabase anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) — lower priority

The anon key is designed to be shipped to browsers and is safe only insofar as
Row Level Security is correct. It was leaked alongside everything else; rotate
it via Supabase → Project Settings → API (JWT secret rotation) if you want a
clean slate, and audit RLS policies either way.

## Follow-up: scrub git history (optional but recommended)

Removing the files from tracking does not remove them from history. To fully
purge them:

1. Rewrite history with `git filter-repo` (or BFG) removing `.1env.local` and
   `env.local.temp` from all commits.
2. Force-push all branches/tags.
3. If the repository is or was ever public, also contact GitHub Support to
   purge cached views/forks — and assume the values were harvested the moment
   they were pushed. Rotation (steps 1–6) is what actually closes the hole;
   history scrubbing is hygiene.

## Sign-off checklist

- [ ] Supabase DB password reset; `DATABASE_URL` updated everywhere
- [ ] `GOOGLE_CLIENT_SECRET` rotated, old secret deleted
- [ ] `GITHUB_SECRET` rotated (or unused OAuth app deleted)
- [ ] `GEMINI_API_KEY` rotated, old key deleted, billing checked
- [ ] `NEXTAUTH_SECRET` regenerated
- [ ] `CRON_SECRET` regenerated; n8n/external callers updated
- [ ] Supabase RLS audited / anon key rotated
- [ ] Production redeployed and smoke-tested (sign-in, checkout, cron jobs)
- [ ] (Optional) history scrubbed with filter-repo + force-push
