# Program Quality V2 — Phase 7 Reason-Code Severity Policy

Canonical owner: `packages/engine/src/program/qualityGate/programQualityPolicy.ts`.

## Severity classes

| Severity | Production effect | Notes |
|----------|-------------------|-------|
| `hardFailure` | Blocks approval; triggers recovery → fallback → structured failure | Mode contracts + unresolved coaching + identity/equipment illegality |
| `warning` | Logged; does not block | Uncommon family, setup complexity, terminal progression notes |
| `capabilityLimitation` | Counted; does not block | Physically unavailable roles (e.g. true vertical without equipment) |
| `deferredContent` | Counted; does not block | Planned demos, cue metadata gaps, progression-link placeholders |

## Mapping rules

1. Explicit capability-limitation codes and codes matching `/CAPABILITY_LIMIT/` → `capabilityLimitation`.
2. Explicit deferred codes and `DEFERRED_*` → `deferredContent`.
3. Explicit warning codes and `WARN_*` → `warning`.
4. Prefixes `GYM_`, `DUMBBELL_`, `BAND_`, `BODYWEIGHT_`, `MIXED_HOME_`, `QUALITY_`, `COACHING_` → `hardFailure` unless overridden above.
5. Everything else → `warning` (conservative default for unknown diagnostics).

## Explicit capability limitations

- `BODYWEIGHT_TRUE_VERTICAL_UNAVAILABLE`
- `BODYWEIGHT_LOADED_PULL_UNAVAILABLE`
- `BAND_HIGH_ANCHOR_UNAVAILABLE`
- `BAND_LONG_BAND_UNAVAILABLE_LOOP_ONLY`
- `DUMBBELL_TRUE_VERTICAL_UNAVAILABLE`
- `MIXED_HOME_TRUE_VERTICAL_UNAVAILABLE`

## Explicit deferred codes

- `COACHING_DEMO_PLANNED`
- `DEFERRED_DEMO`
- `DEFERRED_CUES`
- `DEFERRED_PROGRESSION_LINK`
- `DEFERRED_ANCHOR_SAFETY_NOTE`

## Explicit warnings

- `QUALITY_UNCOMMON_FAMILY`
- `QUALITY_HIGH_SETUP_COMPLEXITY`
- `QUALITY_TERMINAL_PROGRESSION`

## User-facing copy

Hard failures expose only:

> We could not build a safe plan for your current equipment and preferences. Please adjust your equipment or pain answers and try again.

Raw reason codes stay internal (observability + audit reports).
