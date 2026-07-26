# First-run calm audit — Phase 6L Commit 4

**Principle:** first run is dead simple. Complexity reveals itself after the
user completes their first session (`session_last_completed_at` latch).

Gate helper: `apps/consumer/src/firstRunCalm.ts` → `hasCompletedFirstSession()`.

| Surface | Prompt / interruption | Verdict | Notes |
|---|---|---|---|
| Home / Assessment / Questionnaire / Results / Session | One-time onboarding guide card (`OnboardingInfoButton`) | **keep** | Essential; auto-opens once per screen |
| Results | Plan ownership copy (Commit 1) | **keep** | Content, not a prompt |
| Results | Assessment status card | **keep** | Essential status |
| Results | Single Pro upgrade card (`UpgradePrompt` via `PlanUpsell`) | **keep** | Single paywall; no repeated Pro modals on first run |
| Results | Retest prompt card | **gate** | Requires `sessionCount >= 1` |
| Results | Feedback ask (5th session) | **gate** | Requires `sessionCount >= 5` (never first-run) |
| Results | Weekly completion nudge | **gate** | Requires first session complete |
| Results | Phase-ready / skip Phase 1 | **keep (implicit)** | Needs workouts in phase; can't fire on session 0 |
| Results | Session-complete notice | **keep** | Fires *after* first session — desired |
| Results | Training sync issue banner | **keep** | Error honesty, not a feature nudge |
| Session | Wake-lock first-session notice | **keep** | Essential device info (Phase 6k) |
| Session | Sacrifice / Test / Modify + incomplete skip-check | **gate** | `hasCompletedFirstSession()` before computing triggers |
| Session | Maintain-mode progression prompts | **gate** | Same latch |
| Session | Coach notes / cues / timer | **keep** | Reference content, user-driven |
| Layout | PWA install prompt (`InstallApp`) | **keep (already gated)** | Only after first-ever session complete |
| Phase 7 (future) | Corrective injection prompts | **gate (spec)** | Must require `sessionsCompleted >= 1` when built |
| Any | Self-adapting “want to turn off X?” beyond incomplete Stop asking | **gate** | Incomplete Stop asking only appears inside the gated contract UI |

## First-run flow (target)

1. Land → assess (or profile) → see plan → start first session  
2. During first session: exercise, cue, timer, log, next — plus at most the one-time guide card and wake-lock notice  
3. After first session: check-in, “nice work,” done  
4. Then deeper intelligence may surface  

## Guard test

`apps/consumer/tests/e2e/firstRunCalm.spec.ts` — brand-new user completes
onboarding + first session with zero non-essential prompts. Future features
that interrupt first run must update this test consciously.
