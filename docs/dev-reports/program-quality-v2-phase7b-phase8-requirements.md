# Program Quality V2 — Phase 8 Starting Requirements

Generated: 2026-08-05 from Phase 7B completion.

Phase 7B intentionally stopped before plan-reveal / dashboard redesign. Start Phase 8 from these requirements only after explicit instruction.

## Goal

Make quality visible immediately on first program reveal and first session without inventing a second presentation source of truth.

## Canonical sources (do not fork)

- Inventory + types: `packages/engine/src/program/presentation/`
- Resolver: `resolveProgramPresentation` / `resolveAdaptationPresentation` / Phase 6 `resolveExerciseCoachingViewModel`
- Audit: `npm run audit:program-presentation`

## Required Phase 8 UI work

1. **Plan reveal composition** — first post-questionnaire reveal should show, as one coherent composition:
   - brand-safe equipment identity (from resolver)
   - phase purpose
   - weekly structure / day titles
   - first-session purpose + expected duration + equipment needed
   - capability honesty (especially bodyweight / no-anchor bands)
2. **Dashboard / ResultsRoutine layout** — promote Setup + adaptation summaries out of secondary bullets into the primary reveal hierarchy (without cards-as-decoration; follow product design rules).
3. **Weekly coverage summary** — user-facing coverage language derived from stored week + quotas, not raw matrix codes.
4. **Session duration + equipment-needed** — already resolved; elevate visually at week and day cards.
5. **Coaching-card improvements** — consume Phase 6 coaching VM consistently; fill planned/notRequired demo states honestly.
6. **Progression preview** — plain-language next rung / hold reasons (no ladder debug traces).
7. **Bodyweight limitation language** — reassuring, capability-true copy from capability notes.
8. **Mobile layout + a11y pass** — capture the screenshot matrix Phase 7B left structurally reviewed (360 / 390 / desktop) as visual QA for the redesigned reveal.
9. **Gyms / consumer parity** — keep one presentation contract; no divergent copy systems.

## Explicit non-goals for Phase 8 kickoff

- Template version bump unless composition truly changes
- Weekly adaptation-sharing product UI (`deferred.weeklyAdaptationRecord`)
- Knowledge portal
- Nutrition / wearables
- Broad component consolidation for its own sake
- Reopening generation unless a presentation defect cannot be fixed in UI/wiring

## Suggested first implementation slice

1. Wire `resolveProgramPresentation` into the dedicated first-reveal surface (both apps).
2. Replace ad-hoc equipment / duration strings with resolver fields.
3. Visual QA screenshots for all seven equipment modes on the reveal + session-start states.
4. Keep `PROGRAM_TEMPLATE_VERSION` at **18** unless composition changes.

## Exit criteria (Phase 8)

- First viewport of plan reveal passes the brand/composition rules
- All seven modes show honest identity + limitations
- No raw internal language
- Consumer/gyms parity on reveal + session start
- Screenshot review captured (not structural-only)
