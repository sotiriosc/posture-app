# Program Quality V2 — Phase 7B Input Continuity

Generated: 2026-08-05

## End-to-end chain (validated)

```text
questionnaire + optional assessment tags
→ generateWeeklyProgram (template v18)
→ resolveProgramPresentation
→ UI receivers (ResultsRoutine Setup/adaptation; SessionProgressHeader purpose/meta)
→ LogPrefs.blockedExerciseIds / contractStateByExercise shape for future cycles
```

Covered by `programPresentationContinuity.test.ts`.

## Continuity matrix

| Material input | Giver | Presentation effect | Persistence | Future effect |
|----------------|-------|---------------------|-------------|---------------|
| Equipment list | `resolvePrimaryProgramEquipmentMode` | Equipment identity label (Gym / Dumbbells / Bands / Bodyweight / Mixed home) | Questionnaire | Mode-specific generation |
| Band setup | `deriveProgramCapabilities` | Capability notes + session setup requirements | Questionnaire | Anchor eligibility |
| Days / week | Program + questionnaire | Frequency label on program overview | Stored program | Week structure |
| Pain areas | Pain policy + presentation | Adaptation summary on program + sessions | Questionnaire | Selection contraindications |
| Photo focus (high confidence only) | Assessment focus summary | Adaptation message when confidence qualifies | Assessment | Emphasis / support selection |
| Photo focus (low confidence) | same | **Omitted** (no false claim) | Assessment | No forced presentation |
| Session discomfort | Session UI + substitution | Swap / skip / no-valid-swap copy | Exercise log + session draft | Future adaptation inputs |
| Personal block | Session menu + settings | Blocked list; excluded from selection/swaps | `LogPrefs.blockedExerciseIds` | Hard-filter next generate |
| Feedback contract choice | `applyFeedbackContractAction` | Plain labels in pre-session prompt | `contractStateByExercise` | Probation / sacrifice / modify paths |
| Phase / week | Phases + program | Phase label + week label via resolver | Stored program / progress | Gate readiness UI |

## Consumer / gyms parity

| Capability | Consumer | Gyms |
|------------|----------|------|
| Feedback-contract plain labels | Yes | Yes |
| No-valid-swap message | Yes | Yes |
| Personal block in session | Yes | Yes (Phase 7B port) |
| Settings unblock / reset | Yes | Yes (Phase 7B port) |
| `resolveProgramPresentation` on results | Yes | Yes |
| Session purpose / duration / equipment meta | Yes | Yes |
| Blocks honored in swap preview | Yes | Yes |

## Photo confidence rule

`resolveAssessmentFocusSummary` returns `null` unless `highConfidence === true` **and** focus tags exist. Low-confidence observations must not claim program emphasis.

## Unresolved (deferred to Phase 8 — named)

- Richer weekly adaptation record UI (`deferred.weeklyAdaptationRecord`)
- Planned exercise videos (`deferred.plannedExerciseVideos`)
- Knowledge portal surface (`deferred.knowledgePortal`)
