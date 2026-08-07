# Phase 5B — Mixed-Home Programming Audit

Mixed-home structural audit. Phase 0–5 equipment reports were preserved.

## Step A — Initial baseline inventory

- `MIXED_HOME_GYM_TEMPLATE_INHERITANCE` — dumbbells+bands resolved to mixedHome but weeks used gym body-part titles (Back + Chest / Shoulders + Arms / Legs + Abs). _(source: Phase 5B Step A baseline)_
- `MIXED_HOME_DUMBBELL_TEMPLATE_ONLY` — No deliberate mixed-home policy; bands available via eligibility without justified authorship. _(source: Phase 5B Step A baseline)_
- `MIXED_HOME_RANDOM_EQUIPMENT_MIX` — Dual-tool eligibility under gym slots produced incoherent tool thrash. _(source: Phase 5B Step A baseline)_
- `MIXED_HOME_FALSE_VERTICAL_PULL` — Gym pull slots claimed vertical pulling without confirmed high anchor / pull-up bar. _(source: Phase 5B Step A baseline)_
- `MIXED_HOME_IDENTITY_COLLAPSE` — Identity label mixedHome without first-class template family. _(source: Phase 5B Step A baseline)_

## Results

- Flagship personas: 13
- Hard failures (flagship): 0
- Flagship personas with structural score ≥95 and zero hard failures: 13/13
- Fuzz cases: 10000
- Fuzz gym-template inheritance: 0
- Fuzz illegal equipment: 0
- Fuzz unconfirmed anchor: 0
- Fuzz unconfirmed band type: 0
- Fuzz false vertical pull: 0
- Fuzz prep-as-main: 0
- Fuzz identity collapse: 0
- Fuzz deterministic-repeat mismatches: 0
- Fuzz exceptions: 0
- Fuzz honest capability-limitation notes: 3925

## Hard failures by reason (flagship)

- none

## Artifact paths

- docs/dev-reports/equipment-program-audit-phase5b.md
- docs/dev-reports/equipment-program-audit-phase5b.json
- docs/dev-reports/equipment-program-audit-phase5b-mixed-home-personas.md
- docs/dev-reports/equipment-program-audit-phase5b-hard-failures-initial-vs-final.md
- docs/dev-reports/equipment-program-audit-phase5b-mixed-home-fuzz-10k.md
- docs/dev-reports/equipment-program-audit-phase5b-equipment-rationale.md
- docs/dev-reports/equipment-program-audit-phase5b-setup-transitions.md
