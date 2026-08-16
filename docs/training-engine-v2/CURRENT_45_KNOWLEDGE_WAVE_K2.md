# Current 45 Knowledge Wave K2

Status: `WAVE_K2_KNOWLEDGE_CORE_COMPLETE`

## Boundary

This wave adds canonical teaching facts for the 15 lower-body and direct-accessory identities. It does not migrate catalog fallbacks, alter engine metadata, add Product behavior, or close Pre-G2K.

## Review Matrix

| Exercise | Facts | Six categories | Realization review | Compact fallback |
| --- | ---: | --- | --- | --- |
| goblet-squat | 11 | complete | current free-standing realization complete; future support/box metadata required | byte-equivalent |
| leg-press | 11 | complete | exact machine only | byte-equivalent |
| bodyweight-box-squat | 11 | complete | free bodyweight-squat boundary deferred | byte-equivalent |
| dumbbell-romanian-deadlift | 11 | complete | current dumbbell path complete | byte-equivalent |
| cable-pull-through | 11 | complete | current low-cable rope path complete | byte-equivalent |
| split-squat | 15 | complete | stable-support and dumbbell-load differences added; reverse lunge deferred | byte-equivalent |
| step-up | 15 | complete | stable-support and dumbbell-load differences added | byte-equivalent |
| lying-leg-curl | 11 | complete | exact machine only | byte-equivalent |
| glute-bridge | 15 | complete | dumbbell and loop-band differences added; unilateral boundary deferred | byte-equivalent |
| dumbbell-lateral-raise | 11 | complete | no override required | byte-equivalent |
| reverse-pec-deck | 11 | complete | exact machine only | byte-equivalent |
| band-face-pull | 11 | complete | exact anchored path retained | byte-equivalent |
| dumbbell-curl | 11 | complete | timing remains Prescription-owned | byte-equivalent |
| cable-triceps-pressdown | 11 | complete | attachment supremacy rejected | byte-equivalent |
| standing-calf-raise | 15 | complete | stable-support and dumbbell-load differences added; unilateral unadmitted | byte-equivalent |

## Evidence

- Entries: 15
- Accepted facts: 181
- Differences-only overrides: 8
- Missing mandatory categories: 0
- Missing provenance: 0
- Validation findings: 0
- Compact fallback mismatches: 0
- Engine decision changes: 0

The source is `packages/praxis-knowledge-core/src/entries/lowerBodyAndAccessories.ts`; executable proof is `packages/praxis-knowledge-core/tests/waveK2.test.ts`.
