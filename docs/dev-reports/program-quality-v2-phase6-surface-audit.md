# Program Quality V2 — Phase 6 Surface Audit

## Existing exercise data fields

| Field | Location | Displayed today? | Notes |
|-------|----------|------------------|-------|
| `cues[]` | catalog `exercises.ts` | Yes — session card (first cue), exercise detail list | Becomes secondary; registry `primaryCue` is canonical for cards |
| `mistakes[]` | catalog | Yes — exercise detail; rationale uses `[0]` | Registry `commonMistake` + `correction` are canonical for expanded guidance |
| `contraindications` | catalog | Exercise detail warning box | Engine/eligibility data — not interchangeable with stop signals |
| `painContraindications` | catalog | Not user-facing copy | Eligibility only |
| `videoUrl` / `demoStatus` (`none`\|`url`) | catalog | Detail page video or large “Video coming soon” | Phase 6 evolves presentation to `available`\|`planned`\|`notRequired` |
| `durationOrReps` | catalog | Detail header | Dose still comes primarily from prescription |
| `progressionOf` / `regressionOf` | catalog | Via rationale easier/harder names | Ladder semantics preserved; registry links same IDs |
| `swapOptions` | catalog | Substitution flows | Unchanged |
| Equipment / band / anchor / support | catalog + `bandExerciseRequirements` | Partially via eligibility | Coaching must state setup truthfully |
| Movement-role metadata | catalog `slotRoles` etc. | Internal / day titles | Internal |
| Prescription rationale | `prescriptionRationale.ts` | Coach notes (why/cue/easier/harder/stop) | Dynamic “why selected”; keep separate from static coaching |
| Centration cues | `centrationCues.ts` (~57 IDs) | Session tips | Seed for registry setup/during |

## Consumer surfaces

| Surface | Path | Pre-Phase-6 coaching | Phase 6 role |
|---------|------|----------------------|--------------|
| Active session card | `apps/consumer/.../ExerciseCard.tsx` via `SessionClient` | Name, targets, reps/tempo, one cue, set tracking | Add setup summary, progression target, Guidance control |
| Exercise detail | `apps/consumer/.../exercise/[id]/page.tsx` | Video-or-coming-soon, cues, mistakes, contraindications, history | Full written contract; graceful no-video |
| Results / program listing | `RoutineItemCoachingDetails.tsx` | Why/cue/easier/harder/stop | Align with resolver (mistake/correction) |
| Substitution / pain / history | Session flows | Existing | Preserve; stop language stays user-facing |
| Onboarding guide | Existing Phase 6 UI docs | Unrelated terminology cards | Do not regress |

## Gyms surfaces

Parallel copies of `ExerciseCard`, `RoutineItemCoachingDetails`, and `exercise/[id]/page.tsx` under `apps/gyms`. Content must resolve from the same engine registry/resolver; layout may differ.

## Field placement decisions

| Information | Collapsed card | Expanded / detail | Internal |
|-------------|----------------|-------------------|----------|
| Name, sets/reps, rest | Yes | Yes | |
| Equipment / setup summary | Yes (one line) | Full setup steps | |
| Primary cue | Yes (one) | Yes | |
| Progression target | Yes (one) | Yes | |
| Purpose, why selected | No | Yes | |
| Execution steps, expected feel, mistake/correction, stop | No | Yes | |
| Demo player | Only if available (detail) | Yes when available | |
| “Demonstration planned” | No | Small optional label | |
| Candidate scores / traces / fuzz codes | No | No | Yes |

## Missing user-required fields (pre-Phase-6)

- shortPurpose / setupSteps / executionSteps as structured coaching
- expectedFeel / avoidFeeling distinct from contraindications
- common mistake **with** correction on expanded surfaces
- stop signals as execution guidance
- accurate demo status without dominant empty video chrome
- capability-conditioned band/support copy
- one shared resolver consumed by consumer + gyms

## Overload risk

Active workout must stay compact (preserve one-active-set mobile session). Full encyclopedia belongs on `/exercise/[id]` opened via Guidance — not inline on the set card.
