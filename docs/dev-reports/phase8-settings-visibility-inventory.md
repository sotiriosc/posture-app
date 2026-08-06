# Phase 8 — Settings, Visibility & Receiver Inventory

- Branch: `phase8/plan-reveal-experience`
- Base: `921bd35bf17eeaaf32c0decd2638a45671687354` (`checkpoint/equipment-experience-phase4`)
- Generated: 2026-08-06
- Relational vocabulary: `system input → giver → output → UI receiver → persistence effect → recovery / restore path`
- Companion JSON: `docs/dev-reports/phase8-settings-visibility-inventory.json`

Do not begin visual implementation until this audit exists (Phase 8 §0). Visual work proceeds only with this inventory and §J classifications recorded.

---

## A. Settings surfaces

| App | Route | File | Audience |
| --- | --- | --- | --- |
| Consumer | `/account/settings` | `apps/consumer/src/app/account/settings/page.tsx` | Regular user |
| Consumer | `/settings` | `apps/consumer/src/app/settings/page.tsx` | Admin (`bac_admin`) |
| Gyms | `/account/settings` | `apps/gyms/src/app/account/settings/page.tsx` | Regular member |
| Gyms | `/settings` | `apps/gyms/src/app/settings/page.tsx` | Admin |

### Consumer account settings capabilities

Sign-in credentials · Exports · Reset progress · Sound · Session prompts (`suppressIncompleteContractPrompts`) · Nutrition link · Feedback link · **Interface (`sectionVisibility`)** · Erase local data

### Consumer admin settings capabilities

Backup & restore · Movement profile · Download/restore JSON · **Interface** · **Blocked exercises** · Danger zone · System status · Lock Admin

### Gyms account settings capabilities

Sound · Exports · Reset progress · Erase — **no Interface, no incomplete-prompt toggle, no credentials/nutrition/feedback links**

### Gyms admin settings capabilities

Backup/restore/profile/danger/system · **Blocked exercises** — **no Interface section**

Intentional differences are preserved unless Phase 8 explicitly requires parity.

---

## B. Canonical section registry

Source: `packages/engine/src/ui/sectionVisibility.ts`

| ID | Screen | Default | Label |
| --- | --- | ---: | --- |
| `results.headline` | results | true | Headline metric |
| `results.ladders` | results | true | Your progression |
| `results.sacrificeRetest` | results | true | Exercises ready to try again |
| `results.posture` | results | true | Posture check results |
| `results.retiredTags` | results | true | Areas you've improved |
| `results.phaseHistory` | results | false | Phase history timeline |
| `results.provenanceFooter` | results | false | Provenance footer |
| `session.ladderPill` | session | true | Level indicator |
| `day.correctiveSource` | day | false | Corrective-source annotations |
| `day.warmupBreakdown` | day | false | Warmup four-block breakdown |

Rules in force for Phase 8: no rename/delete; unknown IDs fail open; reset + show-all remain; persisted overrides must continue to work.

**Phase 8 mapping when absorbing components:**

| Stable ID | Pre-Phase-8 receiver | Phase 8 receiver |
| --- | --- | --- |
| `results.ladders` | ResultsView `LaddersSection` | Unchanged on `/results/view`; Plan Reveal `ProgressionPreview` is progressive disclosure (not user-hidden) |
| `results.posture` | ResultsView posture section | Unchanged on analytical results; first reveal uses confidence-qualified adaptation summary only |
| `results.phaseHistory` | ResultsView `PhaseHistorySection` | Unchanged |
| `results.provenanceFooter` | ResultsView `ProvenanceFooter` | Unchanged |
| `day.warmupBreakdown` | WeekViewPanel prep filter | Unchanged |
| `day.correctiveSource` | `CorrectiveSourceLine` | Unchanged |
| `session.ladderPill` | `SessionLadderPill` | Unchanged |

---

## C. Visibility React layer (consumer-only)

Implementation: `apps/consumer/src/components/visibility/SectionVisibility.tsx`

| Export | Role |
| --- | --- |
| `SectionVisibilityProvider` | Load/persist `LogPrefs.sectionVisibility` |
| `useSectionVisibility` | Toggle + read |
| `useSectionVisiblePref` | Read-only mount load |
| `VisibilityGate` | Conditional render |
| `SectionEyeButton` | In-header hide |
| `HiddenSectionsBar` | Show-all recovery (results screen) |

Gyms has **no** visibility React layer and **no** `/results/view` ResultsView gates.

---

## D. Registry → receiver chains

Format: system input → giver → output → UI receiver → persistence → recovery

### `results.headline`

User Interface toggle / Settings → Settings `handleToggleSection` → `LogPrefs.sectionVisibility["results.headline"]` → ResultsView `VisibilityGate` → `HeadlineMetric` → IndexedDB prefs → Settings reset / HiddenSectionsBar show-all (Settings-only hide; no EyeButton)

### `results.ladders`

User hide/show → EyeButton or Settings → same key → ResultsView gate → `LaddersSection` → prefs → Eye / show-all / Settings

### `results.sacrificeRetest` / `results.posture` / `results.retiredTags`

Same pattern as ladders → respective ResultsView sections

### `results.phaseHistory` (default off)

Settings enable → prefs → ResultsView `PhaseHistorySection` → Settings / show-all / Eye

### `results.provenanceFooter` (default off)

Settings → prefs → ResultsView `ProvenanceFooter` → Settings / show-all (no EyeButton)

### `session.ladderPill`

Settings Interface › Session → prefs → `useSectionVisiblePref` in `SessionLadderPill` → consumer SessionClient → Settings only (no HiddenSectionsBar on session)

### `day.correctiveSource` (default off)

Settings Interface › Day → prefs → `CorrectiveSourceLine` in ResultsRoutine → Settings only

### `day.warmupBreakdown` (default off)

Settings Interface › Day → prefs → WeekViewPanel filters warmup detail → Settings only

### Sound

Account settings → `soundPrefs` → SessionClient audio → prefs → Settings re-enable

### Blocked exercises

Session block / admin Settings → `blockedExerciseIds` → engine hard-filter → admin unblock/reset

### Incomplete prompts

Consumer Settings or session link → `suppressIncompleteContractPrompts` → SessionClient → consumer Settings checkbox

---

## E. LogPrefs field scope

Defined in `packages/engine/src/types.ts`; persistence via `packages/engine/src/logStore.ts`.

| Field | Scope | Primary writers |
| --- | --- | --- |
| `sectionVisibility` | **consumer-only UI** (shared type) | Consumer Settings + ResultsView toggles |
| `soundPrefs` | shared | Both account settings |
| `timerPrefs` / `timerPrefsByExercise` | shared | SessionClient |
| `loadPrefsByExercise` | shared | SessionClient |
| `feedbackByExercise` | shared | SessionClient |
| `substitutionByExercise` | shared | SessionClient / history |
| `contractStateByExercise` | shared | SessionClient |
| `blockedExerciseIds` | shared | Session + admin Settings |
| `suppressIncompleteContractPrompts` | shared runtime; Settings **consumer-only** | Settings / session |
| `hasCompletedFirstWeek` | shared freemium latch | freemiumSync |
| `wakeLockNoticeSeen` | shared | SessionClient |

Phase 8 writes must load → merge one field → save complete prefs (§E).

---

## F. Phase 8 reveal integration decision (§G)

| Reveal element | Classification |
| --- | --- |
| Phase identity, purpose, days/week, duration, equipment, critical capability honesty, primary CTA | **Always required** first-reveal content |
| Why Praxis chose this / technical detail / full rationale / exact progression conditions | **Progressive disclosure** (not user-hidden) |
| Progression detail | Existing `results.ladders` where semantic meaning matches on `/results/view`; Plan Reveal progression preview is progressive disclosure on first reveal |
| Posture/focus detail | Existing `results.posture` on analytical results; first reveal uses confidence-qualified adaptation summary only |
| Phase timeline | Existing `results.phaseHistory` |
| Provenance | Existing `results.provenanceFooter` |
| Warmup breakdown / corrective source / ladder pill | Existing day/session IDs unchanged |

Critical actions (Start Day 1, Begin session, Report discomfort, Save discomfort, Make it easier, Swap, Skip, End session, capability warnings, settings recovery) are **never hideable** via sectionVisibility.

---

## G. No-loss surface matrix

| Route | Surface | Current component | Information / actions | Settings | Persistence | Phase 8 status | Test evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/questionnaire` | questionnaire completion | `QuestionnaireForm` | goals, equipment, pain, days | — | questionnaire storage | preserved unchanged | existing e2e |
| `/results` first visit | first plan reveal | `ResultsRoutine` + `DashboardHero` → `PlanRevealExperience` | phase, purpose, frequency, duration, equipment, Start Day 1 | `day.correctiveSource` (consumer) | program + prefs | **restyled → Plan Reveal** (level 1) | phase8 unit + e2e |
| `/results` returning | dashboard | `ResultsRoutine` + `DashboardHero` | greeting, phase progress, CTA | freemium locks | local unlock level | preserved + progressive disclosure | dashboard e2e |
| `/results` `#week-view` | week view | `WeekViewPanel` (+ path on reveal) | day nodes, start selected day | `day.warmupBreakdown` | program progress | restyled → Weekly pathway on reveal; panel preserved | week e2e |
| `/program/.../day/...` | selected-day detail | day page | routine detail | — | — | preserved unchanged | nav e2e |
| `/session` | session start | `SessionClient` / `SessionProgressHeader` / `SessionStartSummary` | purpose, duration, equipment, focus, capability, Begin | wakeLock, sound, suppress | drafts | restyled presentation only | session e2e |
| `/session` | active exercise | `SessionClient` | dose, cue, timers, next | ladder pill, timers, load | drafts/logs | preserved; coaching progressive disclosure | session e2e |
| `/session` | pain/discomfort | SessionClient modals | report/save/swap/skip | — | drafts | preserved; body-map **prototype only** | pain unit |
| `/progress` | progress summary | progress page | metrics | — | sessions | preserved unchanged | progress e2e |
| `/results` Phase | phase transition | `PhaseProgressionSection` | advance / later | — | progress | preserved unchanged | phase e2e |
| `/results` History | history | history panel | past sessions | unlock level | sessions | preserved unchanged | history e2e |
| `/results` Insights | training insights | `InsightsPanel` | insight cards | unlock level | — | preserved unchanged | insights e2e |
| `/results/view` | movement-pattern results | `ResultsView` | gated analytical sections | all `results.*` | sectionVisibility | preserved + visibility-controlled | settings e2e |
| `/account/settings` | account settings | settings pages | sound/interface/exports | self | LogPrefs | preserved; Interface consumer-only | settings e2e |
| `/settings` | admin settings | admin pages | backup/blocks | admin | LogPrefs/exports | preserved unchanged | admin e2e |
| `/dev/body-map` | body-map prototype | `BodyMapPrototype` | region/sensation/severity preview | — | none (demo) | **new demo route** | body-map unit |

Acceptance targets for §0:

- 0 registry entries without real receivers (**consumer**)
- Gyms: registry IDs intentionally have no UI receivers (documented difference)
- 0 settings toggles without effects (consumer Interface)
- 0 gated receivers without recovery paths
- Critical controls not registered as hideable sections

---

## H. §J classifications (summary)

Canonical active paths:

- `ACTIVE_CANONICAL`: engine presentation (`packages/engine/src/program/presentation/*`), `sectionVisibility.ts`, consumer Settings Interface, ResultsView gates, ResultsRoutine, SessionClient, WeekViewPanel, LogPrefs load/save

Intentional duplicates (do **not** consolidate in Phase 8):

- `DUPLICATE_IMPLEMENTATION`: consumer/gyms `plan-reveal/*`, `SessionProgressHeader`, `SessionStartSummary`, `BodyMapPrototype`, `DashboardHero`, `ResultsRoutine`, `WeekViewPanel` — document only; no packages/ui yet

Compatibility / dormant / deferred:

- `ACTIVE_COMPATIBILITY`: `DashboardHero` remains for returning users (`dashboardLevel > 1`)
- `DORMANT_INTENDED`: gyms `sectionVisibility` type field without UI — `PRESERVE_AND_DEFER`
- `DISCONNECTED_UNKNOWN`: see deferred findings (do not auto-connect)
- `SUPERSEDED_RESIDUAL`: none proven safe to delete
- `TEST_ONLY`: engine/app presentation unit tests, e2e settings Interface
- `ADMIN_ONLY`: `/settings` admin pages (both apps)

Full structured records for every non-`ACTIVE_CANONICAL` item: see JSON companion.

---

## I. Deferred findings (cleanup — do not delete)

| Finding | Classification | Recommended action | Confidence |
| --- | --- | --- | --- |
| Consumer/gyms duplicated ResultsRoutine (~4k LOC each) | DUPLICATE_IMPLEMENTATION | PRESERVE_AND_DEFER — no packages/ui | high |
| Consumer/gyms duplicated plan-reveal components | DUPLICATE_IMPLEMENTATION | PRESERVE_AND_DEFER (intentional Phase 8) | high |
| Gyms lacks Interface / sectionVisibility UI | DORMANT_INTENDED | PRESERVE_AND_DEFER — intentional scope difference | high |
| `SHOW_PHASE_PREVIEW_REFERENCE = false` flag in ResultsRoutine | DORMANT_INTENDED | PRESERVE_AND_DEFER | medium |
| Body-map prototype not wired to production pain | TEST_ONLY / demo | Keep demo-only until Phase 9+ gate PASS | high |
| Possible unused dashboard decorative cards | DISCONNECTED_UNKNOWN | PRESERVE_AND_DEFER — inventory only | low |
| Opportunistic dead-code deletion candidates | SUPERSEDED_RESIDUAL (unproven) | Do not delete in Phase 8 | medium |

---

## J. Required regression coverage

Retain: `packages/engine/tests/unit/sectionVisibility.test.ts`, `apps/consumer/tests/e2e/settingsInterfaceSectionVisible.spec.ts`

Add: LogPrefs merge preservation, first-viewport content, 7 mode identities, forbidden tokens, progression preview, consumer/gyms parity labels, critical controls not in SECTION_REGISTRY, body-map keyboard + fallback, registry-to-receiver parity / duplicate section IDs, Playwright plan-reveal continuity where practical.
