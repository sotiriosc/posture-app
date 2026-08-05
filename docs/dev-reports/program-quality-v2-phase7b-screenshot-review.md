# Program Quality V2 — Phase 7B Screenshot Review

Generated: 2026-08-05

Capture policy: review against **current live UI surfaces**. Owner confirmed the latest screenshot batch is closer to the product that exists today; older marketing/mock shots are ignored as stale. Browser tooling supplements when the apps are running; otherwise structural evidence is used. No Phase 8 redesign during this review.

## Current UI receivers (source of truth)

Owner-confirmed current surfaces:

| Surface | What it shows today | Presentation contract role |
|---------|---------------------|----------------------------|
| Marketing home | Praxis hero, Start assessment / Answer profile | Onboarding entry (not program data) |
| How Praxis builds your plan | 3-step plan build story | Explains loop at a high level |
| Praxis Dashboard | Phase label, week progress, readiness/week pills, phase goal, Start Today's Session, assessment status | `programOverview` — equipment/frequency/adaptation via resolver |
| Selected day details | Day title, MAIN/ACCESSORY cards, dose, tempo, rest, RPE, rationale | `sessionOverview` / exercise list |
| Active workout (existing session UI) | Focus cue, exercise card, Report pain, Guidance, contract prompts | `activeWorkout` / `painFeedback` / `preSessionAdaptation` |
| Progress Summary | Workouts/days in phase, consistency, completion, pain & quality trends | `progressHistory` / `phaseTransition` |
| When does Phase 2 start? | Phase purpose, requirements, Move to Phase 2 / Upload photos / Edit profile | `phaseTransition` |
| Search history | Completed sessions with coach read + next session note | `progressHistory` |
| Training insights | Usage frequency, sessions/week, streak, trend | `progressHistory` |
| Day history exercise cards | Next target, prescription, coach notes, session/previous pills, why next step | `exerciseDetails` / progression |
| Movement patterns / Stability / Compensation | Plan focus + watched patterns from assessment | `assessmentResults` / photo-informed emphasis |

## Modes covered (structural + audit smoke)

`audit:program-presentation` resolved clean models for Gym, Dumbbells, Anchored bands, No-anchor bands, Loop-only bands, Bodyweight, Mixed Home — **0** model findings.

## State review

| State | System input | Giver | Output | UI receiver (current) | Persistence | Captured? | Release-blocking gap? |
|-------|--------------|-------|--------|------------------------|-------------|-----------|------------------------|
| Dashboard identity | Equipment + frequency + phase | `resolveProgramPresentation` | Setup bullet (e.g. Gym · 3 days/week), phase/week labels | Praxis Dashboard | Questionnaire / program | Owner screenshot + code | No |
| Selected day details | Program day + routine | Stored program + rationale | Dose/tempo/rest/RPE + why chosen | Selected day details cards | Stored program | Owner screenshot | No |
| Session purpose/duration | Day + equipment | Resolver session model | Purpose + meta under day title | SessionProgressHeader in active session | Derived | Structural | No |
| Active workout | Routine item | Phase 6 coaching VM | Cue / dose / Guidance | Active workout card | Stored program | Structural (existing) | No |
| Questionnaire-pain adaptation | `painAreas` | Pain adaptation summary | Caution adaptation copy | Dashboard adaptation + session note | Questionnaire | Structural + unit | No |
| Photo-informed emphasis | High-confidence tags | Assessment focus summary | Focus message or omit | Movement patterns / Stability cards | Assessment | Owner screenshot + unit | No |
| Discomfort modal | User pain report | SessionClient modal | Level / location / actions | Pain feedback overlay | Exercise log | Structural | No |
| Pre-session adaptation | Contract triggers | Plain labels (Skip / Keep and retest / Make it easier) | User action | SessionClient prompt | Feedback prefs | Structural | No |
| Substitution / no-valid-swap | Ranked swaps or empty | Swap policy + `resolveNoValidSwapMessage` | Alternatives or safety copy | Active workout | Session draft / log | Structural + unit | No |
| Progress summary | Progress + trends | Existing progress UI | Bars + status labels | Progress Summary | Progress state | Owner screenshot | No |
| Phase transition | Gate readiness | Existing phase UI | Requirements + Move to Phase 2 | When does Phase 2 start? | Progress / phaseHistory | Owner screenshot | No |
| History / insights | Completed sessions | Session + coach read | History cards + insights | Search history / Training insights | Logs | Owner screenshot | No |
| Personal blocks (gyms) | Block menu / settings | `blockedExerciseIds` | Blocked list + unblock | Session + Settings | Prefs | Structural + gyms unit | No |

## Accessibility / mobile (structural)

Reviewed against guide §20 using existing session compression:

- Report discomfort remains reachable in the session pain flow.
- Guidance remains via coaching details (Phase 6).
- Contract actions use full-width buttons (existing targets).
- Bottom Menu / info bar does not replace pain modal actions (full-screen overlay).
- Long equipment / setup labels wrap in Setup and session meta strings.

**Uncaptured in this agent pass as live instrumented screenshots:** automated 360×740 / 390×844 / desktop captures. Owner-provided current screenshots cover the primary receivers above. No release-blocking information gap identified.

## Verdict

**PASS** — current UI receivers are mapped; presentation contract wires into Dashboard / session / day details without redesign. Remaining plan-reveal hierarchy and marketing polish belong to Phase 8.
