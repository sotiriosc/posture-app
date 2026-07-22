# Guide-card content refresh — Phase 6b, Commit 2

Every onboarding guide card in both apps (`apps/consumer` and `apps/gyms` share
an identical `onboardingConfig.ts`) was read against the feature it explains and
rewritten in Sotirios's coach voice (SR-6a). Verdict per card below.

The six features the spec asked to confirm are covered are tracked in the
coverage table after the per-card verdicts.

## Per-card verdict

| Card | Verdict | Notes |
|------|---------|-------|
| `home` | **updated** | Tightened to one paragraph + three bullets. Same promise (fix movement first, then build), current voice. Dropped the redundant closing sentence. |
| `assessment` | **updated** | Was a long "for best results" checklist. Rewrote lead in coach voice, trimmed the capture checklist, and **added** the phase-transition retest behaviour (fresh photos → baseline updates → plan adapts). |
| `questionnaire` | **updated** | Rewrote lead. **Added** training-intent coverage (Build / Maintain / Recover) and how to change it later via "Edit profile" on the dashboard. |
| `results` | **updated** | Kept the dashboard bullet list (relabelled to match current UI: Phase / Week view / This week's focus / Plan adjustments). **Added** ladder-progression coverage ("two clean sessions at the top of your rep range"). |
| `session` | **updated** | Rewrote the flow. **Added** the Sacrifice / Test / Modify pre-session prompt and the personal equipment block ("Tap the ⋯ … Block until I reset"). Removed the stale "Press Next until the session completes" line (superseded by Phase 6a's "Next" copy). |

## Feature coverage confirmation

| Feature (spec) | Covered in | Verified mechanic |
|----------------|-----------|-------------------|
| Ladder progression / how sessions earn the next level | `results` | Default `requiredForAdvance = 2` clean sessions (`packages/engine/src/program/ladderAdvancement.ts`; 3 after a regression, 5 in rehab). Copy states "two clean sessions." |
| Sacrifice / Test / Modify on flagged exercises | `session` | Pre-session `activeContractTrigger` prompt with three buttons (`SessionClient.tsx` ~L2446), shown when an exercise was flagged (pain / incomplete / maximal effort) last session. |
| Training intent (Build / Maintain / Recover) + how to change | `questionnaire` | Intent set in the questionnaire; engine consumes `build`/`maintain`/`rehab`. Changed later via the **"Edit profile"** button on `/results` → `/questionnaire`. |
| Personal equipment blocks (permanently remove exercises) | `session` | `···` "Exercise options" → "Remove from my program" → **"Block until I reset"** (`SessionClient.tsx` ~L2760–2814), persists via `handleBlockExercise(…, "personal_preference")`. |
| Assessment retest prompts at phase transitions | `assessment` | Retest-at-phase-transition behaviour; fresh photos re-baseline the plan. |
| Per-section visibility (hide/show sections) | **NOT covered — gap logged below** | Feature exists but is **admin-gated**. |

## Gap: per-section visibility is not user-reachable (do not advertise)

The per-section visibility controls (the "Interface" panel) live at `/settings`,
which the consumer middleware **admin-gates**: `/settings` requires a valid
`bac_admin` cookie derived from `ADMIN_ACCESS_KEY`, otherwise it redirects to
`/`. The app's own navigation exposes only `/account/settings` ("Data Settings")
to regular users; `/settings` appears as "Admin Settings" and only when
`isAdmin`.

Consequently the spec's suggested copy — "Settings → Interface lets you hide
anything you don't want to see" — would be a **false instruction** for an
ordinary paying user, who cannot reach that panel. Per the phase boundary ("No
new features"), exposing the Interface panel to end users is out of scope for
6b, so the guide cards deliberately **do not mention** per-section visibility.

Recommendation (future, needs Sotirios's call): either surface a user-facing
"Interface" section under `/account/settings`, or move the visibility controls
there, then add a one-line guide-card mention. Tracked here rather than silently
writing copy for a control users can't open.
