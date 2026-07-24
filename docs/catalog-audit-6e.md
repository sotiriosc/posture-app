# Catalog audit — Phase 6e

Report-only findings from Phase 6e, Commits 3 and 4. No engine logic or
catalog data is changed in this PR — Sotirios reviews and rules on any
follow-up in a separate commit/PR.

## Commit 3 — Hip abduction/adduction catalog check

**Finding: the catalog has no dedicated frontal-plane hip abduction or
adduction exercise.** This is a real gap, not a false alarm — the
assessment engine already recommends a corrective drill that does not
exist anywhere in `exercises.ts`.

### What's actually in the catalog today

Grepped `packages/engine/src/exercises.ts` for anything touching hip
abduction/adduction: `movementPattern`, `subPattern`, `muscleGroups`, and
`tags` fields, plus a scan of every distinct `movementPattern`/`subPattern`
value used across the whole file.

- No exercise has `abduction` or `adduction` anywhere in its
  `movementPattern`. The full set of movement patterns in use is entirely
  sagittal/other-plane (`squat`, `hinge`, `single-leg`, `core`,
  `anti-rotation`, `mobility`, etc.) — there's no frontal-plane hip
  abduction/adduction pattern at all.
- 29 exercises reference "hip" or "glute" in some field, but every one of
  them is either:
  - A **hip-extension** exercise (glute bridges, back extensions, hip
    thrusts, hamstring curls, band RDLs) tagged `subPattern: "hip_health"`
    — the existing "hip health" bucket is entirely hinge-pattern
    corrective work, not frontal-plane ab/adduction.
  - A **squat/lunge-pattern** exercise (Bulgarian split squat, cossack
    squat, sumo RDL, barbell back squat, etc.) that lists `adductors` as a
    *secondary* muscle group of a compound sagittal-plane lift — not a
    dedicated adduction isolation movement.
  - `side-plank-star`, which lists `glute med` as a secondary mover of an
    anti-rotation core exercise — again, not a dedicated abduction
    movement.
- Currently-present abduction exercises (banded clamshells, side-lying leg
  raises, standing cable abduction): **none.**
- Currently-present adduction exercises (copenhagen plank, cable
  adduction, side-lying adductor raise): **none.**

### Which patterns this is assigned to

`hip_health` (verified) — but as shown above, that toolbox is hip
*extension* work, not abduction/adduction. There is no separate toolbox
for frontal-plane hip stability.

### The gap is already visible to users, not just theoretical

`assessmentEngine.ts` generates two findings that explicitly recommend a
frontal-plane hip abduction drill as the corrective intervention:

```172:176:packages/engine/src/assessmentEngine.ts
          {
            type: "activation",
            target: "glute med",
            suggestion: "side-lying hip abduction",
          },
```

```280:292:packages/engine/src/assessmentEngine.ts
      primaryFocusTags: [
        ...
          : area === "Hips"
          ? "hip_extension"
        ...
          : area === "Hips"
          ? "glute_medius"
```

Both findings tag `glute_medius` as a focus tag. `program.ts`'s
`POSE_FOCUS_TAG_ALIASES` maps `hip_stability` → `["hip_stability",
"glute_medius", "hip_extension", "stability", "balance",
"core_stability"]`, and exercise-selection bias
(`focusOverlapScore`) matches against each exercise's `tags` array.

No exercise in the catalog carries the literal tokens `glute_medius`,
`hip_extension`, or `hip_stability` as a `tag`. The bias can still land on
*something* because a handful of exercises (single-leg hip thrust, side
plank/side plank star, a few other core/hinge moves) happen to carry the
generic `stability` or `balance` tags — but that's a coincidental partial
match, not the engine actually placing the recommended "side-lying hip
abduction" drill (or anything like it) into a program. A user with a
hip-shift or glute-med finding never actually sees the exercise the
assessment told them they need.

### Does it surface in generated programs for relevant personas?

No — it can't, because the exercise the finding recommends isn't in the
catalog to begin with. The closest the engine can get is a hinge-pattern
`hip_health` substitute (e.g., glute bridges) or a coincidental
`stability`/`balance`-tagged exercise, neither of which trains the hip in
the frontal plane the way the finding's own suggestion text says it
should.

### Recommendation (not actioned in this PR)

Author 2–4 catalog entries — at minimum a banded clamshell and a
side-lying hip abduction (bodyweight/band progressions, matching the
assessment's own suggested corrective) for abduction, and a copenhagen
plank or side-lying adductor raise for adduction — tagged with a new
`hip_health` sibling or an explicit `abduction`/`adduction` movement
pattern, and with `tags` including `glute_medius`/`hip_stability` so the
existing `POSE_FOCUS_TAG_ALIASES` bias actually finds them. Sotirios
rules on additions in a follow-up.

## Commit 4 — Floor press program placement audit

**Finding: floor press is showing up as designed, not as a bug.** It's
correctly ratified as a swap of dumbbell/barbell bench press per Phase 2b,
and every appearance traced below is the engine correctly substituting it
in for a persona whose equipment genuinely can't support a bench press.
One secondary, real observation is flagged below for Sotirios's taste call
— it's a proposal, not a claim of incorrect behavior.

### Which persona / equipment set / phase generated it

Traced every `mainPushCompound` selection across
`docs/dev-reports/three-day-persona-review-after-slot-cleanup.md` (the
most recent three-day persona sweep). The slot resolves along a clean
equipment waterfall, one exercise family per equipment tier:

| Equipment available | `mainPushCompound` pick | Exercise's own equipment requirement |
| --- | --- | --- |
| none (bodyweight only) | `pushup` | `["none"]` |
| bands | `band-chest-press` / `split-stance-band-chest-press` | `["bands"]` |
| dumbbells (no bench) | `dumbbell-floor-press` | `["dumbbells"]` |
| dumbbells + bench, barbell, or gym machines | `dumbbell-bench-press` / `barbell-bench-press-paused` / `machine-chest-press` | requires `"bench"` and/or barbell/machine |

`dumbbell-floor-press` appears **exactly** and **only** for the
"dumbbells, no bench" equipment tier — e.g. the "Beginner / 3 days /
dumbbells / no pain — Phase 1" persona
(`docs/dev-reports/three-day-persona-review-after-slot-cleanup.md:766-787`).
`dumbbell-bench-press` requires `equipment: ["dumbbells", "bench"]`
(`packages/engine/src/exercises.ts:436`) and is therefore ineligible the
moment a persona's equipment list omits a bench — `dumbbell-floor-press`
requires only `["dumbbells"]`
(`packages/engine/src/exercises.ts:454`) and correctly becomes the best
available compound push movement instead. This is exactly the scenario
the swap exists for (a very common real home-gym setup: adjustable
dumbbells, no bench).

### Is it correctly ratified as a swap of db-bench per Phase 2b?

Yes — confirmed in `docs/ladder-decisions.md:80` ("horizontal_push,
2026-07-12"):

```80:80:docs/ladder-decisions.md
3. **barbell-floor-press, dumbbell-floor-press reclassified** — both become swaps (`barbell-floor-press → swapOptions: ["barbell-bench-press-paused"]`, `dumbbell-floor-press → swapOptions: ["dumbbell-bench-press"]`). Floor press limits ROM and is a valid variation, not a distinct rung.
```

Both catalog entries carry the matching `swapOptions` (`exercises.ts:453`,
`exercises.ts:3953`).

### Was it selected as a rung, a swap, or a degradation fallback?

Neither a rung (it was explicitly removed from the ladder) nor a
degradation fallback. Every trace shows `source=initial_pick` (two show
`source=day_intelligence_repair`, an unrelated day-shape repair pass, not
a degradation). It's chosen directly in the first selection pass because
it's the only/best eligible `horizontal_push` candidate for that
equipment tier — `swapOptions` here means "this is what a user's manual
swap picker offers as the alternative," not "this can only appear when
something else fails."

### Is it showing up incorrectly anywhere (e.g., Beginner Build main slot when better options exist)?

Not incorrectly by the equipment-eligibility logic — for a
"dumbbells, no bench" persona there is no better *eligible* option
(`pushup` only outranks it when there are no dumbbells at all; bench
press variants are ineligible without a bench).

One real, separate observation worth Sotirios's taste call: `barbell-floor-press`
is phase-gated (`phaseMin: "growth"`, `difficultyTier: "hard"` —
`exercises.ts:3951-3952`) so it can't reach an absolute-beginner Phase 1
day. `dumbbell-floor-press` has **no `phaseMin` and no `tier`** field at
all (`exercises.ts:448-464`), so it's immediately available to a
Beginner on Phase 1, Day 1 — which is exactly what the traced persona
shows. Lying on the floor to press is a slightly less intuitive setup
than a standard press for someone's very first structured session, even
though the load and pattern are appropriate.

**Proposed scoring adjustment (not made in this PR):** add a `tier: 2`
(matching its bench-press swap target's general difficulty band) or a
light `phaseMin` to `dumbbell-floor-press` if Sotirios wants to keep true
first-timers on `pushup`-family movements one cycle longer before a
dumbbells-only persona is handed a floor-based press — purely a taste
call, not a correctness fix.

## Commit 5 — Rough-edges pass

### 5.a — Landing page footer legibility

Fixed. `Footer.tsx` now sits on a solid `bg-slate-950/85` +
`backdrop-blur-sm` container instead of the bare hero image, with
`text-slate-300`/`text-slate-400` copy for contrast. Each nav link
(`Privacy`/`Terms`/`Refunds`/`Support`) is wrapped in
`inline-flex min-h-11 items-center px-2` for a 44px-tall tap target.
Verified with a screenshot at 390×844 — the disclaimer text and links are
legible against the dark band, independent of whatever's behind it.

### 5.b — Session-start redundant title

Fixed. A third, previously-missed duplicate of the exercise position
counter (`{activeIndex + 1} / {totalItems}`) was rendering at the bottom
of the exercise card, inside the same `OnImage` block as the "···"
session-options menu — separate from the sticky header counter Phase 6d
already deduplicated. Removed it; the menu button is now the only element
in that row (`SessionClient.tsx`, `justify-between` → `justify-end`).

### 5.c — Session-adjustment prompt copy (report only, per plan)

Located the mid-session adjustment prompt in `SessionClient.tsx`
(~lines 2455–2539), triggered by `activeContractTrigger` after a prior
session logged severe pain, repeated moderate pain, an incomplete set
count, or maximal-effort difficulty. The prompt sentence itself reads in
plain English (e.g. "Last session, you reported pain on Barbell Squat.
What would you like to do?"), and each option's *subtitle* is also plain
English. The problem is the three **button labels** themselves, which
surface internal engine/contract terminology instead of describing the
action to the user:

```typescript
<button onClick={() => void handleContractAction("sacrifice")}>
  <span className="block text-base">Sacrifice</span>
  <span className="...">Skip this exercise for now — I&apos;ll retest it later</span>
</button>
<button onClick={() => void handleContractAction("test")}>
  <span className="block text-base">Test</span>
  <span className="...">Keep it in — I&apos;ll try again this session</span>
</button>
<button onClick={() => void handleContractAction("modify")} disabled={activeContractTrigger.atFloor}>
  <span className="block text-base">Modify</span>
  <span className="...">{atFloor ? "Already at the easiest version" : "Drop to an easier variation"}</span>
</button>
```

"Sacrifice," "Test," and "Modify" are the names of the underlying
retest-contract mechanic (see Phase 3.x engine docs), not words a user
would choose to describe skipping an exercise, trying it again, or
dropping to an easier variation. Each button's own subtitle already says
the user-facing version — the fix is almost certainly just swapping the
bold label for a short version of the subtitle (e.g. "Skip it," "Try
again," "Make it easier") and keeping the subtitle as the longer
explanation, but per the plan this is report-only until Sotirios confirms
the exact screen/wording in review — no copy changed in this commit.

### 5.d — Week View "Not started" bars

Fixed. For days that are neither completed nor in progress,
`WeekViewPanel.tsx` no longer renders a bordered 0%-filled progress bar
(three of which in a row read as three failure/incomplete states). It
renders three small muted dots instead — an "awaiting" glyph with no
implied fill — and the label under the day title changed from
"Not started" to "Awaiting" to match. Completed/in-progress days are
unchanged. Verified with a screenshot at 390×844.

### 5.e — Post-session completion pills

Fixed. `SessionFeedbackCheckIn.tsx`'s Done/Partial/Skipped control is now
marked up as `role="radiogroup"`/`role="radio"`/`aria-checked`, and the
unselected pills switched from a solid white fill (which read as its own
equal-weight button) to a transparent, dashed-border, muted-text
treatment. The selected pill keeps its solid dark fill and gains a
leading checkmark. The intent is that the selected pill now reads as
"the chosen one" and the other two read as "the alternatives you didn't
pick," rather than three visually-equal buttons.
