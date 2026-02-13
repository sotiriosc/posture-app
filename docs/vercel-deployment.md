# Vercel Deployment Strategy (Staging + Production)

This app already supports Vercel environment separation. Use Vercel's built-in environments as follows:

- `Development`: local `.env.local`
- `Preview`: staging (keep Stripe in test mode)
- `Production`: live app

## Recommended setup

1. Use one Vercel project with `Preview` for staging and `Production` for live.
2. Add a stable staging domain (example: `staging.yourdomain.com`) that points to Preview.
3. Keep staging and production on separate databases.
4. Keep staging on Stripe test keys and test products.

## Environment variable matrix

Set these in Vercel Project Settings -> Environment Variables.

### Preview (staging)

- `USER_STORE_DRIVER=db`
- `DATABASE_URL=<staging postgres url>`
- `AUTH_SECRET=<staging secret>`
- `APP_URL=https://staging.yourdomain.com`
- `ADMIN_ACCESS_KEY=<staging admin key>`
- `AUTH_USER_EMAIL=<staging bootstrap user email>`
- `AUTH_USER_PASSWORD=<staging bootstrap user password>`
- `AUTH_USER_PLAN=free`
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_PRICE_ID=price_...` (test mode price)
- `STRIPE_WEBHOOK_SECRET=whsec_...` (from Stripe test webhook endpoint)

### Production

- `USER_STORE_DRIVER=db`
- `DATABASE_URL=<production postgres url>`
- `AUTH_SECRET=<production secret>`
- `APP_URL=https://yourdomain.com`
- `ADMIN_ACCESS_KEY=<production admin key>`
- `AUTH_USER_EMAIL=<production bootstrap user email>`
- `AUTH_USER_PASSWORD=<production bootstrap user password>`
- `AUTH_USER_PLAN=free` (or `pro` if you want initial account unlocked)
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_PRICE_ID=price_...` (live mode price)
- `STRIPE_WEBHOOK_SECRET=whsec_...` (from Stripe live webhook endpoint)

## Stripe dashboard setup

Create and maintain two Stripe webhook endpoints:

1. Test mode endpoint -> `https://staging.yourdomain.com/api/billing/webhook`
2. Live mode endpoint -> `https://yourdomain.com/api/billing/webhook`

Subscribe both endpoints to the same billing lifecycle events your app expects.

## Validation checklist

1. Deploy Preview and confirm `/api/billing/status` returns Stripe configured.
2. Run a test checkout on Preview and verify webhook updates user plan in staging DB.
3. Open billing portal from `/account/billing` in Preview and verify return URL.
4. Deploy Production and repeat with a real (or restricted) live Stripe flow.
5. Confirm `Day 2+` paywall behavior still matches plan on both environments.
