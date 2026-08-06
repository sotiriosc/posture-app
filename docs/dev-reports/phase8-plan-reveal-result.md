# Phase 8 — Plan Reveal Result

- Branch: `phase8/plan-reveal-experience`
- Base: `921bd35bf17eeaaf32c0decd2638a45671687354` (`checkpoint/equipment-experience-phase4`)
- Final tip: `69e21a9` (docs result commit; branch tip after Phase 8 delivery)
- `PROGRAM_TEMPLATE_VERSION`: **18** (unchanged)
- Engine generation / eligibility / pain policy / substitution / quality / mode contracts / fuzz / progression composition / template composition: **not modified**

## Changed surfaces

| Surface | Change |
| --- | --- |
| `/results` first reveal (`dashboardLevel === 1`) | `PlanRevealExperience` replaces first viewport of `DashboardHero` |
| `/results` returning users | `DashboardHero` preserved |
| `/session` pre-begin | `SessionStartSummary` + richer header fields; Begin session scrolls to focus |
| `/dev/body-map` | Body-map prototype (demo only, no persistence) |
| `/dev/plan-reveal-preview` | QA fixture mounting real React Plan Reveal |
| Engine presentation | `buildPlanRevealModel` thin reshape helpers (React-free) |

## Canonical resolver fields used

`phaseLabel`, `phasePurpose`, `frequencyLabel`, `expectedDuration` (session[0]), `equipmentIdentity`, `capabilityNotes`, `adaptationSummary`, `sessions[]`, plus progression preview reshaped from phase meta (no UI-invented rules).

## First-viewport hierarchy

Phase identity → purpose → setup rail (days/week, duration, equipment) → capability honesty → primary CTA `Start Day 1` → secondary `See why Praxis chose this`.

## Settings / visibility (§0 / §I)

- Inventory: `phase8-settings-visibility-inventory.md` + `.json`
- Registry IDs unchanged; unknown IDs fail open
- Critical controls not registered as hideable sections
- LogPrefs writes remain load → merge one field → save complete
- Consumer Interface preserved; gyms intentionally without Interface UI

## Tests run

- `npm run audit:program-presentation` — PASS
- `npm run audit:exercise-coaching` — PASS
- `npm run test:critical` — PASS (326)
- `npm run lint` — PASS (0 errors; pre-existing warnings)
- `npm run build --workspace=apps/consumer` — PASS
- `npm run build --workspace=apps/gyms` — PASS
- Focused Phase 8 unit tests — PASS
- Existing `sectionVisibility` unit tests — PASS

## Screenshots

See `phase8-plan-reveal-screenshot-review.md` and `docs/dev-reports/phase8-screenshots/`.

## Accessibility / motion

- 180ms transitions with `motion-reduce:transition-none`
- 44px min targets on pills/CTAs
- Keyboard focus rings; drawer Escape + focus return
- SR labels on setup rail / day nodes / body regions

## Body-map

See `phase8-body-map-prototype-review.md` — **FAIL for production**; keep pills.

## Deferred (§J)

Consumer/gyms component mirrors (intentional `DUPLICATE_IMPLEMENTATION`); gyms Interface absence; body-map production wiring; opportunistic dead-code cleanup. No deletions performed.

## Engine-generation changes

**None.**
