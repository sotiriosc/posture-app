# Backlog (deferred, ticketed)

Consciously deferred work. Each item records why it is safe to defer and the
condition that should force it back to the top of the queue.

## Distributed rate limiting (pre-scale)

- **Source:** Bloom Plan Phase 0.6
- **Status:** Deferred — acceptable for pilot.
- **Problem:** `src/lib/rateLimit.ts` uses an in-memory `Map`. On Vercel this is
  per-lambda-instance, so limits reset per cold start and are not shared across
  concurrent instances — decorative under real traffic.
- **Fix when triggered:** Move rate limiting to Upstash Redis / Vercel KV behind
  the existing `takeRateLimit` interface (keep the call sites unchanged:
  `login:${ip}`, `admin:${ip}`, billing endpoints).
- **Trigger:** Before scaling past the pilot / first real traffic spike, or when
  abuse of a rate-limited endpoint is observed.
