# Program Quality V2 — Phase 7B Pain / Swap Trace

Generated: 2026-08-05

Relational vocabulary: `system input → giver → output → UI receiver → persistence effect`.

## Trace A — Questionnaire pain → adaptation presentation

| Step | Value |
|------|-------|
| System input | `QuestionnaireData.painAreas` (e.g. Lower back, Shoulders) |
| Giver | `resolvePainAdaptationSummary` / `resolveProgramPresentation` |
| Output | `PresentationMessage` with reason `reportedPain` |
| UI receiver | Program overview adaptation trend; session pain adaptation note |
| Persistence effect | Questionnaire stored; program generation already pain-aware |

**Honesty:** Copy uses “discomfort” / “accounts for”, never raw gate codes.

## Trace B — In-session discomfort → valid swap

| Step | Value |
|------|-------|
| System input | Session pain modal level `moderate`/`severe` + current exercise |
| Giver | `previewPainSubstitutionChoices` + SessionClient role-lane filter |
| Output | Ranked swap candidates preserving equipment / pain / role |
| UI receiver | Active workout substitution (`sessionSwapByItemId`) |
| Persistence effect | Exercise log `substitutedExerciseId` + session draft prefs |

**Role-truth:** Hinge mains (e.g. `db-rdl`) only offer hinge / posterior-chain adjacent candidates (validated in `programPresentationPainSwap.test.ts`).

## Trace C — Blocked exercises excluded from swaps

| Step | Value |
|------|-------|
| System input | `LogPrefs.blockedExerciseIds` |
| Giver | `buildSelectionContext({ blockedExerciseIds })` via `previewPainSubstitutionChoices` |
| Output | Candidates hard-filtered before ranking |
| UI receiver | Pain swap / block-menu auto-swap paths (consumer + gyms) |
| Persistence effect | Blocks survive regenerate / quality recovery (Phase 7 Completion) |

## Trace D — No-valid-swap honesty

| Step | Value |
|------|-------|
| System input | Empty candidate set after equipment / pain / role / block filters |
| Giver | `resolveNoValidSwapMessage` |
| Output | Safety copy: skip safely or stop; feedback still saved |
| UI receiver | Pain modal message (both apps) — empty picker never shown |
| Persistence effect | Pain report still logged via `handleSavePainReportOnly` |

## Trace E — Feedback contract plain labels

| Internal action | UI label | Description |
|-----------------|----------|-------------|
| `sacrifice` | Skip for now | Remove for now; Praxis can retest later |
| `test` | Keep and retest | Keep and try again this session |
| `modify` | Make it easier | Switch to an easier variation |
| `dismiss` | Keep and retest | Same as test for UI |

Enums remain internal for persistence (`contractStateByExercise`).

## Tests

- `packages/engine/tests/unit/programPresentationPainSwap.test.ts` — PASS
- Gyms reachability: block menu + `resolveNoValidSwapMessage` wired — PASS
