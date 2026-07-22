# Ship-Readiness Decisions (Phase 6)

Standing rule **SR-6** (see `bloom-plan.md` § Phase 6, logged in
`engine-decisions.md` as ED-6.0): every decision in ship-readiness that makes
the app *look* more like a real product must also make it *behave* more like
one. No cosmetic-only work.

This log tracks the decisions and open TODOs surfaced while shipping Phase 6.

---

## 6.2 — Legal foundation

Routes authored: `/privacy`, `/terms`, `/refunds` (both consumer and gyms apps,
so footer links resolve in both — a footer linking to a 404 would itself violate
SR-6). A shared `Footer` component links all three plus a support-email
`mailto:`.

### Truthful claims encoded in the privacy policy (verified against code)

- **Pose analysis runs client-side.** The app uses
  `@tensorflow-models/pose-detection` + `@tensorflow/tfjs` (root
  `package.json`). Keypoint inference happens in the browser; posture photos are
  never uploaded to a server.
- **Account data is stored in a hosted PostgreSQL database.** The app talks to
  Postgres via `pg` (root `package.json`); production runs on Neon (see
  bloom-plan parallel track). Training state, program state, and account records
  live there.
- **Payments handled by Stripe.** Billing/subscription API routes integrate
  Stripe; card data is handled by Stripe, not stored by Praxis.
- **No third-party ad networks.** No ad SDKs are present in the dependency tree.
- **Decision-log export is genuinely available.** Every recommendation carries a
  `decisionTrace`; the export claim is honest, not aspirational.

### Open TODOs (flagged inline as `TODO(sotirios): ...`)

| ID | Location | Decision needed |
|----|----------|-----------------|
| SRD-6.2-a | `/privacy` — Data retention | How long is account/training data retained after cancellation/deletion request? Draft assumption in copy: deleted within 30 days of request. Ratify before launch. |
| SRD-6.2-b | `/privacy` — Cookie/EU-UK consent scope | Confirm whether any consent banner is required. Plausible (§6.8) is cookieless; auth uses a first-party session cookie only. Draft position: no consent banner required for essential first-party session cookie + cookieless analytics. Ratify with counsel before EU/UK marketing. |
| SRD-6.2-c | Support email address | Placeholder `support@praxis.app` used across footer + legal docs. Replace with the real decided address (parallel track: "probably `support@` domain"). |
| SRD-6.2-d | `/terms` — Governing jurisdiction | Copy reflects Motion Care's Ontario, Canada base. Confirm the operating legal entity name for the final terms. |

---

## 6.8 — Analytics

See `docs/engine-decisions.md` § ED-6.8 for the Plausible ratification (Path A).
