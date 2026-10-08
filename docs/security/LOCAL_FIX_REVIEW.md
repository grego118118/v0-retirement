# Mass Pension security fix — 2026-10-08

Base: `dc6d616783f2f0defee44c5ea265a1e951c37280` (reported production commit).
Local branch: `fix/security-subscription-20261008`.

The original laptop checkout has unrelated edits and is unchanged. This isolated
checkout reconciles the relevant prepared PR30 fixes without merging its broad
changes, cancellation fallback regression, or unrelated regex changes.

## Changes

- Remove `.1env.local` and `env.local.temp` from current tracked source. Ignore
  credential filename variants and reject tracked environment files in CI.
- Require development mode, explicit `ENABLE_DEMO_SUBSCRIPTIONS=true`, no Vercel
  runtime, and no configured Stripe key for demo grants or demo entitlements.
  The completion route rejects other runtimes before authentication or writes.
- Disable hardcoded and in-memory premium fallbacks outside that demo mode;
  retain persisted active and trialing entitlements.
- Return checkout unavailable instead of directing hosted users into demo checkout.
- Cancel verified Stripe subscriptions at period end. Missing billing configuration
  or ownership mismatch returns an error without mutating entitlements. Stripe
  failures do not update the database. Database failure after Stripe success is
  reported as failure; Stripe's webhook must reconcile, or the customer can retry
  the idempotent period-end update.
- Read subscription period dates from Stripe Basil subscription items, with a
  fallback for older responses, preserving valid access-end dates.

## Verification

Final checks: 20 offline regression checks passed; credential filename check
passed; `npm run type-check` passed; staged `git diff --check` passed.

`node scripts/test-subscription-security.cjs` runs offline with mocked authentication,
database and Stripe dependencies. It tests blocked runtime/demo combinations,
production allowlist rejection, active/trial cancellation, ownership mismatch,
missing configuration, Stripe and database failures, and Basil period dates.

`node scripts/check-credential-files.cjs` reports only filenames and never reads
credential contents. It checks the current Git index, not public history or every
possible secret format. `git diff --check` checks patch whitespace.

## Owner action and approvals still needed

Deleting files from a new commit does not revoke exposed credentials or remove
them from public Git history, existing clones, or the original local checkout.
Treat credentials in the two removed files as compromised. The owner must inventory
their variable names privately, rotate/revoke each affected provider credential,
update authorized deployment secrets, and verify services. No secret values should
be put in tickets, logs, PRs or messages. Rotation, account settings, production
deployment, or history rewriting were not authorized and were not performed.

Variable names inspected without printing values identify the rotation scope:
`NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `GITHUB_SECRET`, database credentials
embedded in `DATABASE_URL`, `GEMINI_API_KEY`, and `CRON_SECRET`. Confirm privately
which values are real versus placeholders and whether they remain in use. Public
Supabase URLs/anonymous keys and OAuth client IDs are not equivalent to private
server credentials; review Supabase row-level security and key type before deciding
whether rotation is needed. No Stripe secret variable appears in these two files;
this does not establish that other repository history is free of Stripe credentials.

Audit persisted active/trialing accounts against Stripe records and grant history
for unpaid demo grants. Do not bulk downgrade accounts from database status alone;
verify paid access and grandfathered access first. That audit/remediation requires
separate approval for production data or billing changes.

Publishing this branch and creating a draft PR were approved. Separate approval
is required to merge or deploy it. Production remains unchanged until an approved
deployment contains these changes. Existing PR30 remains unmerged.
