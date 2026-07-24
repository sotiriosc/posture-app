# Phase 6g Commit 1 — Term-clarification audit

**Branch:** `phase-6g-clarity`  
**Scope:** User-facing strings in `apps/consumer/src`, `apps/gyms/src`, and engine-generated copy from `packages/engine/src` that surfaces through the UI.  
**Excluded:** Internal identifiers/types/functions, code comments, test files, and dev-only panels gated behind `NODE_ENV !== "production"` (e.g. `SHOW_TECHNICAL_PROGRAM_REFERENCE` program snapshots that still contain `Cycle Index:`).

**ClarifyTerm API (already built, Commit 2):** `term`, `explanation`, optional `learnMoreHref` / `learnMoreLabel`, `children`, optional `className` / `testId` — at `apps/consumer/src/components/ui/ClarifyTerm.tsx` and `apps/gyms/src/components/ui/ClarifyTerm.tsx`.

**Plan cross-reference:** Draft explanations and “do NOT tooltip” rulings from `bloom-plan.md` Commit 3 are noted under each term. Locations below are verified in the current codebase so Sotirios can rule with real surfaces, not assumed ones.

---

## RPE

**Plan draft:** tooltip — *Rate of Perceived Exertion — a 1-10 scale…*

### Occurrences

**Consumer session tracking label + placeholder**

```3204:3233:apps/consumer/src/app/session/SessionClient.tsx
                <label className="text-xs font-semibold text-slate-700" htmlFor="rpe-input">
                  RPE (1-10)
                </label>
                ...
                  placeholder="RPE"
```

Context: large logging field beside reps/weight. Scale range is in the label (`1-10`); no expansion of what RPE means.

**Consumer session “about to record” summary**

```2060:2063:apps/consumer/src/app/session/SessionClient.tsx
  const aboutToRecordSummary =
    currentItem?.loadType === "timed"
      ? `${loadCaption} · ${previewSetsPlanned} ${previewSetsPlanned === 1 ? "set" : "sets"} · RPE ${previewRpe}`
      : `${loadCaption} · target ${previewReps} reps · ${previewSetsPlanned} ${previewSetsPlanned === 1 ? "set" : "sets"} · RPE ${previewRpe}`;
```

**Gyms session tracking + summary**

```2506:2508:apps/gyms/src/app/session/SessionClient.tsx
              <p data-testid="about-to-record-rpe">
                <span className="font-semibold text-white">RPE:</span> {previewRpe}
              </p>
```

```2660:2689:apps/gyms/src/app/session/SessionClient.tsx
              <label className="text-xs font-semibold text-slate-300" htmlFor="rpe-input">
                RPE (1-10)
              </label>
              ...
                placeholder="RPE"
```

**Prescription dose chips (both apps)** — engine `targetRPE` rendered as `RPE N`:

```30:36:apps/consumer/src/components/RoutineItemCoachingDetails.tsx
  const parts = [
    typeof prescription.sets === "number" ? formatSets(prescription.sets) : null,
    prescription.reps ? formatReps(prescription.reps) : null,
    prescription.tempo,
    typeof prescription.restSeconds === "number" ? `${prescription.restSeconds}s rest` : null,
    typeof prescription.targetRPE === "number" ? `RPE ${prescription.targetRPE}` : null,
  ].filter((part): part is string => Boolean(part));
```

(Same pattern in `apps/gyms/src/components/RoutineItemCoachingDetails.tsx`.)

**Engine → Insights “System Adjustments” / mastery checks**

```182:185:packages/engine/src/sessionAdaptation.ts
    movementProfile.painRisk >= 0.5
      ? "Symptoms remain stable or lower across the week."
      : "Session RPE remains productive without excessive fatigue carryover.",
```

Surfaces via `systemAdjustmentFocus` / knowledge chips in `ResultsRoutine.tsx` when session adaptation is present.

**Currently explained:** partially (scale `1-10` in the input label only; acronym never expanded).  
**Recommended action:** **add tooltip** (wrap label / first occurrence with `<ClarifyTerm term="RPE" explanation="…">` using the draft). Prefer the session input label as the primary attach point so gyms + consumer stay consistent.

---

## Phase (Activation / Skill / Growth sense)

**Plan draft:** tooltip explaining Praxis’s three phases.

### Occurrences

**Hero / session / phase card titles use numbered phase + profile label** (not Activation/Skill/Growth):

```356:363:packages/engine/src/phases.ts
export const getPhaseMetaByIndex = (phaseIndex: number) => {
  const index = clampPhaseIndex(phaseIndex);
  const profile = getPhaseProfile(index);
  return {
    phaseIndex: index,
    phaseName: `Phase ${index}: ${profile.label}`,
    goal: profile.description,
  };
};
```

Rendered as the dashboard H1:

```57:58:apps/consumer/src/components/dashboard/DashboardHero.tsx
          <p className="text-sm font-medium text-slate-300">{greeting}</p>
          <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">{phaseName}</h1>
```

Also: session header (`SessionProgressHeader`), `PhaseProgressCard`, gyms equivalents. Profile labels for phases 1–3 are **Control & Technique / Hypertrophy & Capacity / Strength Focus** — not Activation/Skill/Growth.

**Skip / advance copy uses “Phase 1 / Phase 2 / Phase 3”**

```4046:4048:apps/consumer/src/components/ResultsRoutine.tsx
            <h3 className="text-lg font-semibold text-white">Skip Phase 1?</h3>
            ...
              Phase 1 builds control and tolerance. Skipping can make Phase 2 feel sharper and less stable.
```

```98:98:apps/consumer/src/components/dashboard/PhaseProgressCard.tsx
            Skip Phase 1
```

Gate status chip: `"Phase 3 active"` (`PhaseProgressionSection` / `ResultsRoutine`).

**Curriculum names Activation / Skill / Growth leak in secondary UI**

```571:581:apps/consumer/src/app/settings/page.tsx
                    const phaseLabel = info.blockedAt.phase.charAt(0).toUpperCase() +
                      info.blockedAt.phase.slice(1);
                    ...
                            {reasonLabel} · blocked in {phaseLabel} phase
```

```231:232:apps/consumer/src/components/results-view/ResultsView.tsx
            <p className="mt-1 text-xs text-slate-500">
              Sacrificed during {item.sacrificedAtPhase} phase
```

```102:104:apps/gyms/src/components/member-progress/MemberDrillIn.tsx
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Session {climb.atSessionCount} · Phase {climb.atPhase === 0 ? "activation" : climb.atPhase === 1 ? "skill" : "growth"}
                </p>
```

**Onboarding** casually names “phase” without defining the three:

```75:75:apps/consumer/src/components/onboarding/onboardingConfig.ts
        text: "Every so often — usually when you move to a new phase — we'll ask for fresh photos. Your baseline updates and the plan adapts.",
```

```99:99:apps/consumer/src/components/onboarding/onboardingConfig.ts
          "Phase — where you are in your training",
```

**Currently explained:** partially (hero shows phase description via `phaseGoal` / `phaseDescription` nearby; Activation/Skill/Growth strings are unexplained and **diverge** from the “Phase N: …” naming).  
**Recommended action:** **add tooltip** on the hero/session phase name (use draft). Separately consider **rename to plainer word** for leaked curriculum labels (`activation` → match Phase 1 label, or capitalize + explain) so Settings / retest / gyms member drill-in don’t contradict the hero.

---

## Cycle

**Plan claim:** should be gone from user-facing copy after Phase 6f — **VERIFY**.

### Verification result: **PASS for production user-facing copy**

Hero chip and engine `phaseFocus` now use week vocabulary:

```2823:2831:apps/consumer/src/components/ResultsRoutine.tsx
  // Phase 6f, Commit 5.b: "cycle" is engine-internal vocabulary ...
  const weekOfCycle = ((Math.max(1, program.cycleIndex ?? cycleCurrent) - 1) % 4) + 1;
  const heroMetricChips = [
    `Training readiness: ${readinessScore}% (${readinessLabel})`,
    `Week: ${completedCount}/${activeDaysPerWeek} days`,
    `Week ${weekOfCycle} of 4`,
  ].filter((chip): chip is string => Boolean(chip));
```

```67:72:packages/engine/src/phaseObjectives.ts
  // Phase 6f, Commit 5.b: "cycle" is engine-internal vocabulary ...
  const weekOfCycle = ((Math.max(1, cycleIndex) - 1) % 4) + 1;
  const cycleLabel = `Week ${weekOfCycle} of 4`;
```

Ladder / progression messages also say “next week,” not “next cycle” (`getLadderProgressionMessage` in `ladderAdvancement.ts`).

**Still present but out of scope for tooltips (not user-facing):**

- Identifiers: `cycleIndex`, `cyclesCompletedInPhase`, `activeCycleIndex`, engine mode `"nextCycle"`, local `weekOfCycle` / `cycleLabel` variables.
- Dev-only snapshot lines `Cycle Index: …` inside `ResultsRoutine` builders gated by `SHOW_TECHNICAL_PROGRAM_REFERENCE` (`NODE_ENV !== "production"`) — excluded per audit rules.
- Internal gate traces mentioning “cycle” in `phaseGatingEvaluator.ts` (not rendered as coach copy).

**Currently explained:** n/a (term removed from user copy).  
**Recommended action:** **leave as-is** — claim verified. No tooltip. Do not flag remaining identifiers.

---

## Progression

**Plan ruling:** do NOT add tooltips (context carries).

### Occurrences

**Onboarding**

```107:107:apps/consumer/src/components/onboarding/onboardingConfig.ts
        text: "After each session Praxis updates the plan. You'll move up to the next progression after two clean sessions at the top of your rep range — no pushiness, your body tells us when.",
```

(Same in gyms onboarding.)

**Dashboard / insights / coach risk lines**

```2723:2726:apps/consumer/src/components/ResultsRoutine.tsx
      ? "Biggest risk: Missed sessions can slow progression and recovery."
      : "Biggest risk: Keep recovery habits steady to avoid regression.";
```

```2911:2911:apps/consumer/src/components/ResultsRoutine.tsx
      title: "Adaptation/progression",
```

```3360:3360:apps/consumer/src/components/ResultsRoutine.tsx
          Complete today&apos;s session to maintain progression.
```

```3702:3702:apps/consumer/src/components/ResultsRoutine.tsx
                            As your execution improves, the system will automatically increase complexity and progression.
```

**Progress page insights**

```479:479:apps/consumer/src/app/progress/page.tsx
      insights.push("Weekly training frequency is supporting steady progression.");
```

**Billing marketing**

```182:183:apps/consumer/src/app/account/billing/page.tsx
              <li>Structured corrective progression around movement quality.</li>
              <li>Weekly progression driven by performance and recovery data.</li>
```

**Engine recommendation reasons** (shown under History / day view as `recommendation.reason`):

```309:309:packages/engine/src/progression.ts
        reason: `You overshot the prescribed target (...). Next progression: increase weight from ${weight} to ${nextWeight}...`,
```

(Multiple similar `"Next progression…"` / `"Next progression step is regression…"` strings in the same file; rendered in `ExerciseHistory.tsx` and day page.)

**Settings section registry** labels the ladders gate as “Your progression” (`packages/engine/src/ui/sectionVisibility.ts`).

**Currently explained:** yes enough via surrounding coach sentences.  
**Recommended action:** **leave as-is** (matches plan). Optional later polish: soften `"Adaptation/progression"` card title if it feels jargony in Knowledge & Analysis.

---

## Ladder

### Occurrences

**Results headline + section (consumer)**

```31:35:apps/consumer/src/components/results-view/ResultsView.tsx
          <p className="text-5xl font-light tabular-nums text-white">{rungsCount}</p>
          <p className="mt-1 text-base text-slate-400">
            ladder rung{rungsCount === 1 ? "" : "s"} climbed across{" "}
            <span className="text-slate-200">{patternsCount} pattern{patternsCount === 1 ? "" : "s"}</span>
          </p>
```

```54:56:apps/consumer/src/components/results-view/ResultsView.tsx
        <h2 id="ladders-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Ladders
        </h2>
```

**Session ladder pill** — message from engine (does **not** say “ladder”; talks about clean sessions / advance / ceiling):

```603:620:packages/engine/src/program/ladderAdvancement.ts
export const getLadderProgressionMessage = (
  ...
    return "At ceiling for this movement — progressing via load and reps.";
  ...
    return `Ready to advance \u2192 ${nextEx.name} next week.`;
  ...
  return `${remaining} clean session${remaining === 1 ? "" : "s"} away from ${nextEx.name}.`;
```

Rendered via `SessionLadderPill` on consumer session. Settings labels this section **“Level indicator”** (friendlier than “ladder”).

**Gyms operator surfaces**

```69:70:apps/gyms/src/components/member-progress/MemberDrillIn.tsx
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
          Ladder Progress
        </h2>
```

```23:38:apps/gyms/src/app/gym-admin/members/page.tsx
            Ladder advancements, posture retirements, and session activity per member.
            ...
                  Ladders
```

**Currently explained:** no (section title assumes fitness-ladder literacy; visual rungs help somewhat).  
**Recommended action:** **rename to plainer word** on consumer Results heading (`Ladders` → `Your levels` / `Movement levels`, aligning with Settings “Level indicator”), **or add tooltip** if keeping “Ladder.” Gyms admin can keep “Ladder” if coaches are the audience.

---

## Regression (exercise sense)

**Plan draft:** tooltip — *An easier version of an exercise…*

### Occurrences

**Pre-session Modify subtitle (consumer only)** — explains the idea without the word “regression”:

```2587:2589:apps/consumer/src/app/session/SessionClient.tsx
                  {activeContractTrigger.atFloor
                    ? "Already at the easiest version"
                    : "Drop to an easier variation"}
```

**Word “regression” in coach risk / engine reasons**

```2726:2726:apps/consumer/src/components/ResultsRoutine.tsx
      : "Biggest risk: Keep recovery habits steady to avoid regression.";
```

```281:281:packages/engine/src/progression.ts
      reason: "Pain flagged last time—regressing to keep this smooth.",
```

```498:498:packages/engine/src/progression.ts
        reason: "Next progression step is regression for quality: reduce work time slightly and complete all sets with control.",
```

```108:108:packages/engine/src/phaseObjectives.ts
      ? "Avoid forcing range under pain; use regression when symptoms rise."
```

(`phaseObjective.riskWatchouts` / success copy can surface through dashboard selectors / insights.)

**Exercise catalog name** (surfaces as exercise title when programmed): `Hanging Windshield Wiper (Regression)` in `packages/engine/src/exercises.ts`.

**Note:** Gyms session UI has **no** Sacrifice/Test/Modify surface; regression word still appears via shared engine recommendation reasons if gyms day/history views use them.

**Currently explained:** partially (Modify path is clear; bare “regression” / “regressing” in reasons is not).  
**Recommended action:** **add tooltip** where the noun appears as a concept (Knowledge risk line / history reasons if kept), and/or **rename to plainer word** in engine recommendation strings (`regressing` → `easing to a simpler version`). Catalog suffix `(Regression)` → `(easier version)` if it shows often.

---

## Sacrifice / Test / Modify

**Plan ruling:** do NOT add tooltips (already labeled inline).

### Occurrences

**Consumer pre-session contract (primary surface)**

```2545:2590:apps/consumer/src/app/session/SessionClient.tsx
              {/* Sacrifice */}
              ...
                <span className="block text-base">Sacrifice</span>
                <span className="block text-xs font-normal text-rose-200 mt-0.5">
                  Skip this exercise for now — I&apos;ll retest it later
                </span>
              ...
                <span className="block text-base">Test</span>
                <span className="block text-xs font-normal text-slate-300 mt-0.5">
                  Keep it in — I&apos;ll try again this session
                </span>
              ...
                <span className="block text-base">Modify</span>
                ...
                    : "Drop to an easier variation"}
```

**Onboarding (both apps) names the trio without the inline subtitles**

```125:125:apps/consumer/src/components/onboarding/onboardingConfig.ts
        text: "If something felt off last time, you'll see three choices before we begin — Sacrifice, Test, or Modify. Yours to pick.",
```

**Results retest queue still says “Sacrificed” / “Keep sacrificed”**

```223:247:apps/consumer/src/components/results-view/ResultsView.tsx
          Ready to retest?
          ...
              Sacrificed during {item.sacrificedAtPhase} phase
          ...
                Keep sacrificed
```

**Gap:** `apps/gyms/src/app/session/` has **no** Sacrifice/Test/Modify UI (onboarding still promises it).

**Currently explained:** yes on the action buttons; partially elsewhere (onboarding + “Keep sacrificed”).  
**Recommended action:** **leave as-is** on the contract buttons (matches plan). Optional: rename Results “Keep sacrificed” → “Keep skipped” for consistency with the Sacrifice subtitle; fix gyms parity separately (product, not tooltip).

---

## Focus tag / focus area

**Plan draft:** tooltip for “Focus area.”

### Occurrences

**Day header uses “Focus:” + raw `focusTags`**

```265:265:apps/consumer/src/app/program/[programId]/day/[dayIndex]/page.tsx
              Focus: {day.focusTags.join(", ")} • Estimated 45–60 min
```

(Same in gyms day page.)

**Engine routine priorities**

```199:201:packages/engine/src/routine.ts
    data.painAreas.length
      ? `Focus area: ${data.painAreas[0]}`
      : "Balanced full-body support",
```

**Assessment engine / pose tags** surface as capitalized slug text (`scapular_control` → “scapular control”) in Results Posture section; retired copy:

```193:194:apps/consumer/src/components/results-view/ResultsView.tsx
            <p className="mt-1 text-xs text-slate-600">
              You&#39;ve retired: {tag.tag.replace(/_/g, " ")} focus. Your program is adjusting.
```

**Gyms member drill-in**

```115:115:apps/gyms/src/components/member-progress/MemberDrillIn.tsx
            Posture — Retired Focus Areas
```

**Dashboard coach “Focus” bullet** uses `coachFocus` (week intent / focus areas), not the words “focus tag.”

**Onboarding:** “This week's focus — what you're working on and why.”

**Currently explained:** partially (onboarding + retired-focus sentence; day `Focus:` tags and engine “Focus area:” are unexplained).  
**Recommended action:** **add tooltip** on Results “Posture” / first “focus” mention using draft “Focus area” copy; consider **rename** day header `Focus:` → `Today's emphasis:` if tags look cryptic (`upper-back`, `scapular`, etc.).

---

## Baseline

**Plan draft:** tooltip — starting posture measurements.

### Occurrences

**Assessment page eyebrow**

```15:16:apps/consumer/src/app/assessment/page.tsx
              <p className="text-xs font-semibold uppercase text-slate-300">
                Movement & Posture Baseline
```

**Retest prompt**

```254:263:apps/consumer/src/components/ResultsRoutine.tsx
      <p className="mt-1 text-sm leading-5 opacity-85">
        Quick 2-photo capture — compare to your baseline.
      </p>
      ...
          Take retest
```

**Progress PerformanceOverview**

```24:28:apps/consumer/src/components/progress/PerformanceOverview.tsx
function BaselineNotice() {
  return (
    <p className="mt-2 text-sm leading-5 text-slate-400">
      Building your baseline. Come back after a few sessions and this screen
      starts telling your story.
```

Also label “Since active baseline” (consumer + gyms PerformanceOverview).

**Settings / account**

```744:746:apps/consumer/src/app/settings/page.tsx
              Baseline start date:{" "}
```

```312:312:apps/consumer/src/app/account/settings/page.tsx
                  This resets the current baseline and active day only. It keeps workout history, logs, programs, photos, and exports.
```

**Onboarding** ties photos to baseline updates (see Phase section).  
**Results empty state:** “clean sessions building your baseline.”

**Note:** two senses appear — (1) posture photo baseline, (2) program/progress tracking baseline timestamp. Draft explanation is posture-measurement oriented.

**Currently explained:** partially (Progress notice explains the progress sense; posture sense is thin).  
**Recommended action:** **add tooltip** on assessment eyebrow / retest “baseline” using draft; optionally clarify Settings “Baseline start date” as “plan start” if the dual meaning confuses.

---

## Retest

**Plan draft:** tooltip — fresh posture photos / threshold clear.

### Occurrences

**Posture retest prompt (dashboard)** — CTA “Take retest” (see Baseline section).  
**Exercise sacrifice retest queue** — “Ready to retest?” (ResultsView).  
**Sacrifice subtitle** — “I'll retest it later.”  
**Provenance footer** can mention posture retest counts (`results.provenanceFooter` description in sectionVisibility).  
**Gyms member copy** references clearing focus on retest (`memberProgressData.ts`).

**Currently explained:** partially (posture card explains 2-photo capture; exercise retest vs posture retest are different concepts sharing one word).  
**Recommended action:** **add tooltip** on posture “Take retest” / “Ready to retest?” for posture sense using draft; consider **rename** exercise queue heading to “Ready to try again?” (Settings already uses that friendlier label for the section).

---

## Corrective / corrective slot

### Occurrences

**Progress trend label**

```429:467:apps/consumer/src/app/progress/page.tsx
    if (delta >= 0.35) return "Corrective strength trend";
    ...
      insights.push("Corrective strength trend is building steadily across recent sessions.");
```

**Billing / signup / assessment**

```182:182:apps/consumer/src/app/account/billing/page.tsx
              <li>Structured corrective progression around movement quality.</li>
```

```69:69:apps/consumer/src/app/auth/signup/SignupClient.tsx
            Start free. Upgrade anytime for full corrective performance access.
```

```22:22:apps/consumer/src/app/assessment/page.tsx
                These images help detect structural imbalances that influence movement mechanics and corrective focus.
```

**Settings interface** — section label “Corrective-source annotations” (`sectionVisibility.ts`), shown in Settings › Interface.  
**Dev snapshot** lines `Corrective: …` are behind technical reference gate (excluded).

**“Corrective slot”** as a phrase: **not found** in user-facing copy (engine traces only).

**Currently explained:** no.  
**Recommended action:** **rename to plainer word** in Progress/Billing (`Corrective strength trend` → `Posture-support strength` / `Targeted strength trend`), or **add tooltip** if keeping “corrective.” Settings label can stay for power users or become “Why this exercise was chosen.”

---

## Autoregulation

**Plan draft:** tooltip *if present*.

### Occurrences

**Not found** in consumer, gyms, or engine user-facing string literals.

**Currently explained:** n/a.  
**Recommended action:** **leave as-is** (absent). Keep draft on ice if the term is introduced later.

---

## Compensation

**Plan draft:** tooltip — one muscle picking up another’s work.

### Occurrences

**Knowledge & Analysis card (both apps’ ResultsRoutine)**

```2893:2906:apps/consumer/src/components/ResultsRoutine.tsx
      title: "Movement patterns",
      ...
      title: "Compensation tendencies",
      summary: compensationSummary,
```

Default summary from selectors:

```128:131:apps/consumer/src/components/results/programDashboardSelectors.ts
  const compensationPatternItems = buildObservationItems(
    assessmentReport,
    /forward|tilt|shift|asym|compens|flare|lean/i,
    "Compensation signals are monitored and adjusted through movement quality."
  );
```

**Mode blurb:** “Pattern, stability, compensation, and adaptation analysis.”  
**Day rationale example:** “without compensation” in some `buildWhyPicked`-style strings in ResultsRoutine.  
**Engine mastery prompt fragment:** `"no guarding or compensation"` in `sessionAdaptation.ts` (can surface in System Adjustments chips).

**Currently explained:** no (title assumes the term).  
**Recommended action:** **add tooltip** on “Compensation tendencies” using draft.

---

## Asymmetry

### Occurrences

**Engine session adaptation (user-visible when adaptation panel populated)**

```139:140:packages/engine/src/sessionAdaptation.ts
    reasons.push("Asymmetry markers raised priority for unilateral/balance quality.");
```

```177:177:packages/engine/src/sessionAdaptation.ts
    `Asymmetry ${toPercent(movementProfile.asymmetry)}`,
```

**Phase objective guardrail / pattern labels**

```104:104:packages/engine/src/phaseObjectives.ts
      ? "Asymmetry is elevated: slow tempo and strict side-to-side quality."
```

```30:30:packages/engine/src/phaseObjectives.ts
  balance: "balance and asymmetry control",
```

(Can appear in weekly focus sentence via priorities.)

**Pose / assessment observations** (Results posture `sourceObservation` / CorrectiveSourceLine when enabled):

```264:266:packages/engine/src/poseAnalyzer.ts
      `Shoulder height asymmetry measured ${metrics.shoulderHeightDelta.toFixed(3)} (threshold ${threshold.shoulder}).`
    ...
    priorities.push("Upper-back symmetry and scapular control");
```

```127:128:packages/engine/src/engine/poseFocus.ts
        reason: `Shoulder blade asymmetry measured ${toFixedMetric(
          metrics.scapularSymmetry
        )} (threshold ${POSE_THRESHOLDS.scapularSymmetry}).`,
```

**Currently explained:** no.  
**Recommended action:** **add tooltip** on first “Asymmetry” chip/reason, **or rename** data signal to “Left/right balance” while keeping the draft for technical observations.

---

## Movement pattern

**Plan ruling:** do NOT add tooltips (context carries).

### Occurrences

**Knowledge card title / empty state** — “Movement patterns” / “Movement patterns will populate…” (`ResultsRoutine` both apps).  
**Selector default:** “Plan movement patterns will populate as Praxis builds your week.”  
**Onboarding / engine practice options** mention pattern familiarity in non-UI comments/strings; AdaptiveProgramIntent strings are future-pass oriented.

**Currently explained:** yes enough in context.  
**Recommended action:** **leave as-is** (matches plan).

---

## Ramp / Mobilize / Activate / Prime (warmup block names)

**Plan ruling:** do NOT add tooltips (already labeled inline in warmup contract).

### Occurrences

**Engine still titles the four blocks**

```1233:1255:packages/engine/src/program/warmupPlanner.ts
    rampBlock: {
      ...
      title: "Ramp",
    ...
      title: "Mobilize",
    ...
      title: "Activate",
    ...
      title: "Prime",
```

Merged for display into legacy `warmup` / `activation` / `prime` fields (`program.ts`); week-view UI currently hardcodes section chips as **`warmup` / `activation` / `cooldown`**, not the four titles:

```2937:2946:apps/consumer/src/components/ResultsRoutine.tsx
      sectionLabel: "warmup",
      ...
      sectionLabel: "activation",
      ...
      rationale: item.cue ?? "Prime movement quality before main sets.",
```

**Settings › Interface description (user-facing)**

```108:113:packages/engine/src/ui/sectionVisibility.ts
    id: "day.warmupBreakdown",
    ...
    label: "Warmup four-block breakdown",
    description:
      "The detailed ramp / mobilize / activate / prime breakdown of your warmup.",
```

Rendered in consumer Settings interface list.

**Session** shows section tokens like `activation` / `warmup` on chips when those sections are in the routine.

**Important:** the plan’s “already labeled inline in warmup contract” assumption is only partly true in UI — the four names mainly appear in Settings help text and engine titles; the week view uses coarser labels. Verb “Prime” appears in default activation rationale.

**Currently explained:** partially (Settings description lists all four without defining them).  
**Recommended action:** **leave as-is** per plan for now; if four-block UI is ever shown with Ramp/Mobilize/Activate/Prime headings, add one-line subtitles there rather than tooltips (or revisit ruling).

---

## Deload

**Plan draft:** tooltip — planned lighter week.

### Occurrences

**Not found in user-facing app strings.** Only:

- Engine-internal `getCycleLadder` label `"Deload"` and unused profile `"Deload & Refine"` (beyond `MAX_PHASE_INDEX = 3`, so not used as `phaseName`).
- Code comments referencing Base/Build/Push/Deload rotation.

**Currently explained:** n/a.  
**Recommended action:** **leave as-is** (absent from UI). If week-4 deload intent is later surfaced, use draft tooltip or say “lighter recovery week.”

---

## Superset

### Occurrences

**Not found** in consumer, gyms, or engine user-facing copy.

**Recommended action:** **leave as-is** (absent).

---

## Antagonist

### Occurrences

**Not found** in consumer, gyms, or engine user-facing copy.

**Recommended action:** **leave as-is** (absent).

---

## Scapular / scapulae

**Plan draft:** tooltip — shoulder blades.

### Occurrences

**Exercise names** (appear whenever programmed): e.g. `Scapular Push-Ups`, warmup library `Scapular CARs`, `Open-Book Thoracic Rotation` companions in `packages/engine/src/exercises.ts` / `warmupLibrary.ts`.

**Day titles** from split templates (week view + session day title):

```424:459:packages/engine/src/program/splitTemplatePolicy.ts
        title: "Upper Push + Scapular Control",
        ...
        title: "Upper Pull + Thoracic Posture",
```

**Prescription rationale** (day/results coaching details):

```292:292:packages/engine/src/program/prescriptionRationale.ts
    return "Chosen to support scapular control and posture so the rest of the session stays cleaner.";
```

**Pose observations** — “Shoulder blade asymmetry…” / priorities “scapular control” (see Asymmetry). Tag `scapular_control` displays as “scapular control” in Results Posture.  
**CorrectiveSourceLine** can show those observations when enabled.

**Currently explained:** partially (pose reasons sometimes say “shoulder blade”; exercise/day titles do not).  
**Recommended action:** **add tooltip** on “scapular” in day titles / first exercise name occurrence using draft (Scapula/scapulae).

---

## Thoracic / thoracic extension

**Plan draft:** tooltip — mid-back.

### Occurrences

**Exercise name:** `Thoracic Rotation` (`exercises.ts`); warmup `Open-Book Thoracic Rotation`.  
**Day title:** `Upper Pull + Thoracic Posture` (splitTemplatePolicy).  
**Pose focus tag** `thoracic_extension` → “thoracic extension” in Results; reason text currently says “Torso lean measured…” (does not define thoracic).  
**Focus tags** on days can include `thoracic`.

**Currently explained:** no (unless user infers from “torso”).  
**Recommended action:** **add tooltip** on “Thoracic” in day title / exercise name using draft.

---

## Summary table

| Term | Occurrence count (user-facing surfaces)* | Recommended action |
| --- | ---: | --- |
| RPE | ~8 (session×2 apps, dose chips, adaptation mastery) | add tooltip |
| Phase | ~12+ (hero, session, cards, skip modal, onboarding; + curriculum leaks) | add tooltip; consider rename for activation/skill/growth leaks |
| Cycle | 0 production user-facing (verified gone) | leave as-is |
| Progression | ~10+ (onboarding, insights, billing, engine reasons) | leave as-is |
| Ladder | ~6 (Results, gyms admin/member, settings alias) | rename to plainer word (or tooltip) |
| Regression | ~6 (Modify path OK; risk lines + engine reasons + catalog name) | add tooltip and/or rename engine wording |
| Sacrifice / Test / Modify | ~5 (consumer session + onboarding + retest copy; gyms UI missing) | leave as-is on buttons |
| Focus tag / focus area | ~8 (day Focus:, Results focus, routine Focus area, gyms) | add tooltip; optional rename day header |
| Baseline | ~8 (assessment, retest, progress, settings) | add tooltip |
| Retest | ~6 (posture prompt + sacrifice queue + copy) | add tooltip; consider rename exercise queue |
| Corrective | ~6 (progress, billing, signup, assessment, settings) | rename to plainer word (or tooltip) |
| Autoregulation | 0 | leave as-is (absent) |
| Compensation | ~5 (Knowledge card + selectors + mode blurb) | add tooltip |
| Asymmetry | ~6 (adaptation chips, phaseObjective, pose copy) | add tooltip or rename |
| Movement pattern | ~4 (Knowledge card + defaults) | leave as-is |
| Ramp / Mobilize / Activate / Prime | ~3 (Settings description + section chips + “Prime …” rationale) | leave as-is |
| Deload | 0 user-facing | leave as-is (absent) |
| Superset | 0 | leave as-is (absent) |
| Antagonist | 0 | leave as-is (absent) |
| Scapular / scapulae | ~6+ (names, day titles, rationale, pose) | add tooltip |
| Thoracic | ~5 (names, day titles, tags) | add tooltip |

\*Counts are approximate distinct UI/engine-copy surfaces, not raw grep hits (identifiers excluded).

---

## Biggest surprises / notes for Sotirios

1. **Cycle cleanup holds** — no production user-facing “cycle” strings remain; only identifiers + dev snapshots.
2. **Two Phase vocabularies coexist** — UI hero says `Phase 1: Control & Technique`, while Settings / sacrifice retest / gyms member drill-in say `activation` / `skill` / `growth`.
3. **Sacrifice/Test/Modify** are well-labeled on consumer session, but **gyms session does not implement the prompt** despite onboarding promising it.
4. **Deload / Autoregulation / Superset / Antagonist** are absent from user-facing copy today (drafts ready if they appear later).
5. **Ramp/Mobilize/Activate/Prime** are mostly Settings/engine vocabulary; week view shows `warmup`/`activation` chips — plan’s “already labeled inline” claim is weaker than for Sacrifice/Test/Modify.
6. **Scapular/Thoracic** leak heavily via **day titles** and **exercise names**, which are high-visibility and currently unexplained.
