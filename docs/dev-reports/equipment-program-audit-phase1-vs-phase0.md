# Phase 1 vs Phase 0 — Equipment Identity Comparison

Phase 0 artifacts were not rewritten. This file summarizes the intentional Phase 1 identity change.

## Intentional behavior changes

- Added `PrimaryProgramEquipmentMode` and deterministic `resolvePrimaryProgramEquipmentMode`.
- Added `ProgramCapabilities` via `deriveProgramCapabilities` (unknown anchors remain false).
- `ProgramIntentProfile.equipment` now stores the first-class primary mode.
- Selection context carries `primaryEquipmentMode` and `programCapabilities`.
- `hasLoad` no longer maps dumbbells/mixedHome to gym program identity.

## Identity proof points

| Slice | Cases | Intent=resolved | Legacy would be gym | Template mismatch |
|---|---:|---:|---:|---:|
| dumbbells | 32 | 32 | 32 | 14 |
| mixedHome | 32 | 32 | 32 | 14 |

## Remaining Phase 2–5 work (not repaired here)

- Legacy gym-shaped 3-day titles still appear for non-gym modes.
- Band pulldowns still schedule without confirmed high-anchor capability.
- Surrogate/support-only vertical-pull mains remain in home modes.
- Pre-existing coverage-matrix / phase-matrix FAIL cases remain untouched.
