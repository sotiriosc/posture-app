# Phase 8 — Consumer / Gyms Parity

## Shared presentation truth

Both apps consume:

- `resolveProgramPresentation`
- `buildPlanRevealModel`
- Phase 7B adaptation / coaching helpers

No second copy system was introduced.

## Semantic parity covered

| Field | Consumer | Gyms |
| --- | --- | --- |
| phaseLabel / phasePurpose | shared engine | shared engine |
| frequencyLabel / expectedDuration | shared engine | shared engine |
| equipmentIdentity | shared engine | shared engine |
| capabilityNotes / adaptations | shared engine | shared engine |
| weekly pathway nodes | shared engine → WeeklyPath | mirrored WeeklyPath |
| progression preview | shared engine | mirrored |
| session-start purpose/duration/equipment/focus/capability/count | SessionStartSummary | mirrored |
| Start Day 1 / Begin session | required, not hideable | same |

Tests: `apps/consumer/tests/unit/phase8PlanRevealParity.test.ts`, `apps/gyms/tests/unit/phase8PlanRevealParity.test.ts`.

## Intentional differences (preserved)

| Area | Consumer | Gyms |
| --- | --- | --- |
| Interface / `sectionVisibility` UI | Yes (`/account/settings`, `/settings`) | **No** |
| ResultsView analytical gates | Yes (`/results/view`) | No equivalent |
| Maintain-mode prompt | Present | Absent |
| Plan-reveal React components | Canonical for this phase | `DUPLICATE_IMPLEMENTATION` mirror (no packages/ui yet) |

## Settings / visibility (§I)

- Consumer registry → receiver chains intact; show-all / reset preserved
- Gyms: registry type may exist in LogPrefs JSON but has no UI receivers — documented `DORMANT_INTENDED`, fail-open, do not strip fields
- Critical controls never hideable in either app

## §J note

Consumer/gyms plan-reveal and session-start mirrors are intentional Phase 8 duplicates. Consolidation deferred until a shared UI package exists.
