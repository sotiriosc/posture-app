# Deploy — two Vercel projects from one repo

This is an npm-workspaces monorepo (`apps/*`, `packages/*`; the only
lockfile is the root `package-lock.json`). There is no Next.js app at the
repo root — the deployable apps live in `apps/consumer` and `apps/gyms`,
each with its own `next.config.ts` and `vercel.json`. Vercel supports this
natively via the **Root Directory** project setting, with one Vercel
project per app.

The consumer project (`apps/consumer`) is already live. This doc is the
exact, verified-working recipe — corrected against two real deploy
failures hit while setting it up — so setting up the second project for
`apps/gyms` is a repeat of the same steps, not a fresh investigation.

## Project setup — do this once per app

### 1. New Project

Vercel dashboard → **New Project** → **Import** → pick
`sotiriosc/posture-app` (same GitHub repo for both apps; Vercel lets you
import the same repo more than once as separate projects).

### 2. Name it

Give it a name that's clearly distinct from the other project, e.g.
`praxis-gyms` for the gyms app (the consumer project is `praxis-consumer` or
similar — whatever it's currently named, just don't reuse it).

### 3. Root Directory — the setting that actually matters here

**Settings → General → Root Directory** →

```
apps/gyms
```

(`apps/consumer` for the consumer project.)

Directly below the Root Directory field there is a toggle: **"Include
source files outside of the Root Directory in the Build Step."** This
**must be ON**. Both apps import `@praxis/engine` (`packages/engine`), a
workspace package that lives outside `apps/gyms`; Vercel also needs the
repo-root `package-lock.json` to resolve the hoisted dependencies. Without
this toggle, the build fails to resolve those imports. It defaults to on
when Vercel detects a workspace root, but confirm it explicitly — this is
exactly the setting that broke the consumer deploy the first time (see
"What actually went wrong" below).

### 4. Framework Preset, Build/Install/Output Command

Leave Framework Preset on **Next.js** (auto-detected) and leave **Build
Command**, **Install Command**, and **Output Directory** all on their
defaults (blank/auto). With Root Directory set correctly and the
outside-source-files toggle on, Vercel's own `next build`/`npm install`
defaults are enough — no custom command is needed, and no `vercel.json`
build overrides exist in this repo (the `vercel.json` in each app only
restricts which branch deploys to production; see step 6).

### 5. Environment Variables

Copy these from the consumer project's **Settings → Environment
Variables**, adjusting the ones called out below:

```
ADMIN_ACCESS_KEY=...
AUTH_SECRET=...                (separate value — session cookies must not be interchangeable between the two products)
AUTH_USER_EMAIL=...
AUTH_USER_PASSWORD=...
AUTH_USER_PLAN=...
DATABASE_URL=...               (shared is fine unless gyms gets its own DB/schema)
USER_STORE_DRIVER=...
TRAINING_STORE_DRIVER=...
STRIPE_SECRET_KEY=...          (separate if gyms bills through a different Stripe account/product)
STRIPE_PRICE_ID=...            (separate — gyms pricing is not the same product as consumer Pro)
STRIPE_WEBHOOK_SECRET=...      (separate — each Stripe webhook endpoint gets its own signing secret)
APP_URL=...                    (gyms's own production URL, e.g. https://gyms.praxisapp.ca)
NEXT_PUBLIC_APP_URL=...        (same value as APP_URL)
NEXT_PUBLIC_SITE_URL=...       (gyms's own production URL)
NEXT_PUBLIC_PLAUSIBLE_SRC=...  (separate — must point at a distinct Plausible site so analytics don't mix the two products)
```

`ADMIN_ACCESS_KEY`, `DATABASE_URL`, `USER_STORE_DRIVER`, and
`TRAINING_STORE_DRIVER` can be copied verbatim from the consumer project
unless there's a specific reason to split them. Everything else that's
product-identity-shaped (auth secret, Stripe keys, URLs, analytics) needs
its own value — reusing the consumer project's would either fail (wrong
Stripe webhook secret) or silently cross-contaminate data (shared auth
sessions/analytics between two different products).

### 6. Deploy

Click **Deploy**. The first deploy builds from `main`. `apps/gyms/vercel.json`
already restricts production deploys to the `main` branch — that only takes
effect once Root Directory points at `apps/gyms`, which is why the file
lives inside the app folder rather than at the repo root.

## What actually went wrong setting up the first project (read before repeating)

Two real failures were hit and fixed getting `apps/consumer` live. Both are
config/dependency issues, not app bugs, and both apply equally to
`apps/gyms`:

1. **`Error: The Next.js output directory ".next" was not found at
   "/vercel/path0/.next"`.** Root Directory was left at the repo root, so
   Vercel looked for `.next` at the repo root while the actual build output
   landed at `apps/consumer/.next`. Fix: Root Directory = `apps/consumer`
   (step 3 above).

2. **`Error: No Next.js version detected...`** and, after that,
   **`Module not found: pg`** (and other workspace-package imports).
   `next`, `react`, `react-dom`, `pg`, `@tensorflow/tfjs`, and
   `@tensorflow-models/pose-detection` were only declared as dependencies in
   the **root** `package.json` and resolved via hoisting locally — but
   `apps/consumer/package.json` and `packages/engine/package.json` didn't
   declare them themselves, so Vercel's per-package dependency detection
   couldn't see them. Fix was a repo change (already applied, not something
   to redo): both `apps/consumer/package.json` and
   `apps/gyms/package.json` declare `next`, `react`, `react-dom` directly;
   `packages/engine/package.json` declares `pg`, `@tensorflow/tfjs`,
   `@tensorflow-models/pose-detection`, `next`, `react` directly. If a
   similar "module not found" error shows up for `apps/gyms`, the fix is
   the same shape: add the missing package as an explicit dependency in
   whichever `package.json` actually imports it, matching the version
   already pinned at the repo root.

## Both projects build on every PR by default

This is Vercel's standard behavior for a GitHub-connected project and needs
no extra configuration: every pull request against the repo gets its own
preview deployment (comment posted on the PR with a preview URL), and every
push to the production branch (`main`, per each app's `vercel.json`)
triggers a production deploy. Because `praxis-consumer` and `praxis-gyms`
are two separate Vercel projects pointed at the same GitHub repo, **both**
run independently on every PR to `main` — a consumer-only PR still triggers
a gyms preview build (and vice versa), which is the desired behavior: it
catches a shared-package (`packages/engine`) change breaking the other
app before merge, without either app's deploy pipeline blocking the other.

## Pre-merge checklist (setting up the second project)

- [ ] Create the `praxis-gyms` Vercel project pointing at `apps/gyms`
- [ ] Root Directory = `apps/gyms`, "include source files outside root" ON
- [ ] Leave Build/Install/Output Command on defaults
- [ ] Set gyms env vars (copy shared ones, use distinct values for the
      product-identity ones listed in step 5)
- [ ] Trigger a preview deploy — confirm build green
- [ ] Confirm the preview app actually loads (`/`, `/results`, login)
- [ ] Merge/push to `main` — confirm the production deploy completes
- [ ] Confirm a PR against `main` produces preview deployments for **both**
      projects, not just the one whose files changed
