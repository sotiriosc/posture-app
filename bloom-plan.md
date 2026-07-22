# Bloom Plan: Engine Truth & Progression Work Order

Status: ACTIVE — Phase 0 complete (2026-07-11; pending commit + replication to second repo).
Domain-level content in P2–P4 (ladders, thresholds, criteria) still pending Sotirios review.
Scope: posture-app (consumer) + praxis-gyms (B2B), converging on a shared engine.
Method: contract-first. Every phase lands with its tests. Falsified attempts stay in the repo.

Baseline audit (2026-07-11, from praxis-gyms copy of the engine):
- 223 exercises in catalog
- difficulty: 145/223 · pattern: 167/223 · progressionOf: 119/223 · regressionOf: 85/223
- phaseMin: 50/223 · experienceMin: 10/223 · painContraindications: 140/223
- Ladder links validated for existence (exerciseCatalog.ts) but never *walked* by the engine
- Pose focus tags flow into selection scoring (focusOverlapScore, program.ts ~2828) — bias-level influence, with reason strings generated but not surfaced to users
- poseAnalyzer.confidenceScore exists and is NOT consumed by derivePoseFocus — the one active untruth

---

## Phase 0 — Close the security gaps (before anything else; ~half day)

Apply to BOTH repos now (tiny diffs); they unify in Phase 1 anyway.

0.1 Rate-limit `/api/admin/access` (src/app/api/admin/access/route.ts)
    Use existing takeRateLimit, key `admin:${ip}`, limit 5, windowMs 60_000.
    This is the only credential-guarding endpoint without a limiter. Highest priority.

0.2 Stripe webhook timestamp tolerance (src/lib/stripeServer.ts, verifyStripeWebhook)
    Reject if |now − t| > 300s. Event-ID dedup already blocks exact replays; this is defense-in-depth.

0.3 Timing-safe JWT verification (src/lib/authToken.ts)
    Replace `expectedSignature !== signature` with crypto.subtle.verify(...) against the
    received signature bytes. Matches the discipline already used for passwords (timingSafeEqual).

0.4 Delete stray file `posture-app@0.1.0` at repo root (empty shell artifact).

0.5 Add CI (.github/workflows/ci.yml)
    On PR: `npm ci && npx vitest --run tests/unit/programGoldenAnchors.test.ts \
      tests/unit/programIdentityAnchors.test.ts tests/unit/questionnaireGoldenFlow.test.ts \
      tests/unit/programDeterminism.test.ts tests/unit/competitiveBenchmark.test.ts \
      tests/unit/stripeWebhookLogic.test.ts`
    Full suite nightly (it is heavy — minutes, not seconds). Anchors on every PR.

0.6 Deferred, pre-scale: move rate limiting to Upstash Redis / Vercel KV
    (in-memory Map is per-lambda-instance on Vercel — decorative under real traffic).
    Acceptable for pilot. Ticket it; don't do it now.

Acceptance: all six items merged; CI green on a no-op PR.

---

## Phase 1 — Unify the engine (timebox: 3 days, hard) — v2 "top notch" spec

Principle: Phase 1 is TRANSPORT, not surgery. Zero behavior change, zero refactors,
zero dependency bumps. The 34k-line program.ts moves AS-IS. The payoff is
architectural: after this phase the engine has a real public API, an enforced
boundary, and one home.

### 1.0 Pre-flight (before any move)
- Both Phase 0 PRs merged to main in both repos. Phase 1 branches off updated main.
- Land or commit the in-progress SEO work on praxis-seo-foundation FIRST. A
  300-file path restructure under an uncommitted branch = rebase misery. Park it
  clean (commit to its branch) or merge it; do not start Phase 1 over a dirty tree.
- Tag both repos: `pre-monorepo` (escape hatch is one checkout away).

### 1.1 Target layout (posture-app repo becomes the monorepo home)
```
praxis/  (posture-app repo; optional GitHub rename to `praxis` — old URLs redirect)
  package.json                 workspaces: ["packages/*", "apps/*"]; single root lockfile
  tsconfig.base.json           shared compiler options; apps + engine extend it
  packages/engine/             name: @praxis/engine — src/lib engine surface:
                               program*, engine/, phases, progression, exercises,
                               exerciseCatalog, assessmentEngine, poseAnalyzer,
                               poseFocus, sessionFeedback*, stores, auth libs, types,
                               seededRng, timerRules + tests/unit (engine suites)
  apps/consumer/               posture-app app/, components, public/, consumer e2e
  apps/gyms/                   praxis-gyms app/, gymSaas, gym components, B2B e2e
```
- Engine ships as TS source, no build step: both apps set
  `transpilePackages: ["@praxis/engine"]` in next.config.
- Auth/Stripe/db MODULES live in the engine package (they are byte-identical shared
  code); the API ROUTES that call them stay app-side. Env/secrets stay per app.

### 1.2 Git mechanics — BOTH histories survive
- Base = posture-app (148 commits). `git mv` everything into its new paths
  (history follows renames; verify with `git log --follow` spot-checks).
- Bring praxis-gyms in with `git subtree add --prefix=apps/gyms <remote> main`
  (or merge --allow-unrelated-histories) so its commits graduate WITH lineage.
  Then `git mv` inside that prefix to final shape and delete its engine copy
  (the byte-identical duplicate dies here — that is the point).
- Archive the praxis-gyms repo on GitHub afterward with a README pointer.
  Never force-push over either history.

### 1.3 Imports — tsconfig-alias approach (barrel-during-transport superseded)

FALSIFICATION LOG (2026-07-13): The original 1.3 plan required apps to import
the engine exclusively via the `@praxis/engine` barrel. This was falsified during
Day 1 execution: importing `verifySessionToken` through the barrel pulled `crypto`
into the Next.js Edge Runtime (middleware.ts), causing a hard build failure.
Decision: apps use `@/lib/*` tsconfig path aliases (→ packages/engine/src/*) for
transport. The barrel (`packages/engine/src/index.ts`) and `docs/engine-api.md`
are committed as the defined public API surface and remain; the codemod
(`scripts/codemod-engine-imports.ts`) is committed as a reproducible artifact for
future re-run. R1 (barrel-only imports in apps) is ticketed as a post-Phase-3 task
— to be adopted after Phase 3's feedback loop closes, when the Edge Runtime
import-graph is explicit and audited.

### 1.4 Boundary enforcement (the architecture defends itself)
- ESLint `no-restricted-imports` enforces three rules in CI:
  R1 apps may import engine ONLY via `@praxis/engine` (no deep paths)
     STATUS: post-Phase-3 ticket; not enforced during Phase 1 transport.
     Reason: alias approach required for Day 1–2 Edge Runtime compatibility.
  R2 engine may NEVER import from apps/* (enforced Day 3)
  R3 engine may NEVER import next/* or react (type-only exceptions listed
     explicitly in the rule); enforced Day 3
  R4 no cross-app imports: consumer may not import from apps/gyms/* and vice versa;
     enforced Day 3
- These rules run in CI. A boundary that isn't lint-enforced is a suggestion.

### 1.5 Tests & CI (workspace-aware)
- Engine suites (golden, identity, determinism, benchmark, catalog, stripe-logic,
  security) move INTO packages/engine — they are the engine's contract and travel
  with it. App e2e (Playwright) stays per app.
- ci.yml v2: anchors job runs the engine anchor gate once (not per app) + lint
  incl. boundary rules + `next build` for BOTH apps on PR. Nightly full suite
  unchanged. Two apps building in CI is what catches import-graph breakage.

### 1.6 Vercel (decide before merge, not after)
- Two Vercel projects off the one repo: Root Directory apps/consumer and
  apps/gyms respectively; envs move to their project; build command unchanged.
- Document in docs/deploy.md. Do a preview deploy of each BEFORE merging the
  migration PR. A migration that breaks prod deploy is not complete.

### 1.7 Move-purity proof (verification, not vibes)
- scripts/verify-move-purity.ts: for every engine file, compare pre-move blob
  (from `pre-monorepo` tag) to post-move content with import-specifier lines
  normalized out. Output: full file list, IDENTICAL / DIVERGED per file.
- Committed as docs/phase1-move-purity.md. Required: 100% IDENTICAL. Any
  divergence = the move edited behavior = fix or revert, no exceptions.
- Anchor gate green is necessary but NOT sufficient; purity report is the proof.

### 1.8 Day-by-day (checkpoints; abort criteria explicit)
Day 1: pre-flight, tag, scaffold workspaces, git-mv engine + consumer app,
       codemod, barrel v1 — checkpoint: consumer builds, engine suites green.
Day 2: subtree-add gyms, git-mv to final shape, delete duplicate engine,
       codemod gyms — checkpoint: BOTH apps build, full suites green in both.
Day 3: boundary lint + CI v2 + Vercel previews + purity report + engine-api.md
       — checkpoint: acceptance list below fully green.
Blown timebox → fallback unchanged: two repos, posture-app engine = SoT,
scripts/sync-engine.sh, revisit within 60 days. Fallback is a decision, not
a failure; log it.

### Acceptance (all required)
- [ ] Move-purity report: 100% content-identical modulo imports
- [ ] Engine anchor gate green; full unit suite green; both apps' e2e green
- [ ] Both apps `next build` clean locally and in CI
- [ ] Boundary lint rules active in CI; zero violations
- [ ] `git log --follow` shows pre-move history on 3 spot-checked engine files
      AND on 2 spot-checked gyms files (both lineages intact)
- [ ] Vercel preview deploys green for both apps
- [ ] docs/engine-api.md exists; every barrel export justified
- [ ] One-line change to an engine file provably rebuilds/retests both apps

### Out of scope for Phase 1 (hard no, regardless of temptation)
- program.ts decomposition or ANY refactor beyond import specifiers
- dependency upgrades, Next/React version moves, config "improvements"
- renaming exports, types, or cookies; touching bac_ anything
- starting Phase 2 metadata work in the same branch

---

## Phase 2 — Catalog truth campaign (rate every exercise)

Goal: every entry carries complete, coherent progression metadata, enforced by the
validator so it can never rot.

2.1 Required fields (validator-enforced, not just convention):
    - difficulty: 1–5 on ALL 223 (currently 145)
    - pattern on all main/accessory/activation entries (warmup/cooldown may use
      pattern:"mobility" or stay exempt — Sotirios decides)
    - progressionOf/regressionOf links forming coherent ladders (see invariants)
    - painContraindications on every load-bearing pattern entry
    - phaseMin wherever an exercise is unsafe/unwise below a phase

2.2 Validator invariants (extend src/lib/exerciseCatalog.ts; it already checks link
    existence — add the rest):
    I1  Every entry has difficulty ∈ {1..5}
    I2  Every non-warmup/cooldown entry has pattern
    I3  Ladder links reference existing ids (exists today — keep)
    I4  Bidirectional coherence: A.progressionOf = B ⇒ B.regressionOf = A
        (allow explicit multi-branch via familyKey where one parent has two children)
    I5  difficulty strictly increases along every progressionOf chain
    I6  pattern is constant within a ladder
    I7  Ladder graph is acyclic
    I8  Safety floor: every difficulty ≥ 4 entry reaches a difficulty ≤ 2 regression
        within the same pattern (so "simplify_pattern" always has somewhere to go)
    Add tests/unit/catalogLadderInvariants.test.ts asserting I1–I8 across the catalog.
    This test SHOULD fail on first run — that failure list IS the work queue.

2.3 Draft ladders — DOMAIN REVIEW REQUIRED (Claude drafts, Sotirios verifies every rung;
    map names to actual catalog ids, add missing rungs as new entries where a gap exists):

    hinge:        glute bridge (1) → bodyweight good morning / dowel hinge (2)
                  → DB RDL (3) → BB RDL (4) → trap-bar or conventional deadlift (5)
    squat:        box / sit-to-stand (1) → goblet (2) → leg press / DB front (3)
                  → BB front (4) → BB back (5)
    push-horiz:   wall push-up (1) → incline push-up (2) → full push-up (3)
                  → DB bench (4) → BB bench (5)
    push-vert:    wall slide + reach (1) → half-kneeling landmine (2)
                  → half-kneeling DB press (3) → standing DB (4) → standing BB OHP (5)
                  prerequisite tag: scapular upward rotation demonstrated (scap focus clear)
    pull-horiz:   band row (1) → machine/seated cable row (2) → single-arm DB row (3)
                  → chest-supported row (4) → bent-over BB row (5)
    pull-vert:    band pulldown (1) → machine lat pulldown (2) → assisted pull-up (3)
                  → pull-up (4) → weighted pull-up (5)
    anti-ext:     dead bug (1) → forearm plank (2) → body saw (3)
                  → ab-wheel from knees (4) → standing rollout (5)
    anti-rot:     tall-kneeling Pallof (1) → half-kneeling Pallof (2)
                  → standing Pallof (3) → Pallof press + walkout (4)
    lunge/unilat: static split squat (1) → reverse lunge (2) → walking lunge (3)
                  → rear-foot-elevated split squat (4) → loaded RFE / step-up heavy (5)
    carry:        two-hand farmer (1–2) → suitcase (3) → front-rack (4) → waiter/overhead (5)

    Authoring order: one pattern per session, validator run after each. Do NOT batch
    all 223 in one pass — review fatigue produces false metadata, and false metadata
    here is worse than missing metadata.

2.4 Every ladder decision that contradicts the draft gets one line in
    docs/ladder-decisions.md (what changed, why). Falsifications preserved.

Acceptance: catalogLadderInvariants green on all 223; ladder-decisions log exists;
golden anchors unchanged (metadata alone must not move selection yet — that is Phase 3,
behind its own tests).

---

## Phase 2b — Institutionalize the catalog (follow-up to merged surgery PR)

2b.1 tests/unit/catalogLadderInvariants.test.ts — encode the DECIDED rules so the
     clean catalog cannot rot: I4 (with familyKey branch exception), I5 (+I5a d5
     ties), I6, I7, ISO-delinked. Exemptions below are part of the spec.
2b.2 Exemption rules (decided): warmup/cooldown/activation entries need NO
     difficulty and NO ladder pattern; they REQUIRE `primes: [patterns]` and/or
     `mobilizes: [joints]` instead (see 3W). Toolbox membership via subPattern is
     pattern-exempt by rule.
2b.3 Sotirios's nine tie calls (rung vs swap): dumbbell-rows/split-stance-row,
     machine-seated-row←band-row, wall-handstand-hold/pike-press-incline, + six
     listed by the scanner. Then the mechanical reciprocal/branch-annotation pass
     (28 asym links → 0 or annotated).
2b.4 cable-upright-row: implement real `deprecated: true` honored by selection +
     validator, OR amend ladder-decisions.md to "narrowed, not removed". Log wins.
2b.5 Merge duplicate pair band-pull-aparts / band-pull-apart (one entry, one id,
     redirect swaps).
Acceptance: invariants test green in CI; scanner residue = 0 or rule-covered;
decisions log updated.

## Phase 3 — Walk the ladders (criteria-based progression engine)

Goal: the engine advances/regresses users along Phase-2 ladders from demonstrated
control, not calendar time. All movement auditable in the decision trace.

### 3.0 Entrance exam (prerequisite — complete before any ladder-advancement code)

Fix `feedbackSummaryByExercise` propagation through the repair pipeline; un-skip both
quarantined tests (`sessionFeedbackInfluence`, `sessionFeedbackSubstitution`) and get
them green BEFORE any ladder-advancement code.

3.1 Signals (all already collected — consume, don't invent):
    - per-exercise feedback summaries (engine.ts ExerciseFeedbackSummary)
    - SessionFeedbackSignals: painDelta, completed, effortBand, confidenceBand, flags
    - exercise logs: reps vs target across sessions
    - existing adaptation modes incl. "simplify_pattern"

3.2 Advancement rule (DRAFT constants — Sotirios tunes):
    Advance one rung in a pattern at next cycle/phase boundary when, for the current
    rung exercise, the last 2 logged sessions ALL hold:
      completed = "yes"
      top of rep range hit OR effortBand ≤ moderate
      painDelta ≤ 0 and no pain flags on that exercise
      confidenceBand ≥ moderate
    AND next rung satisfies: equipment available, phaseMin ≤ current phase,
    experienceMin ≤ user experience, no painContraindication match.

3.3 Regression rule:
    Drop one rung immediately-next-generation when any of:
      pain flag attributed to the exercise
      completed = "no" twice consecutively
      user selects simplify_pattern
    Never regress below difficulty 1; never advance more than one rung per boundary.

3.4 Hold is the default. Hysteresis: after a regression, require 3 (not 2) clean
    sessions before re-advancing that pattern.

3.5 Engineering constraints (non-negotiable, matches existing house rules):
    - Deterministic: decisions derive ONLY from persisted logs + seed. No Date.now
      inside decision logic (the determinism suite exists to catch exactly this).
    - Every advance/regress/hold writes a decisionTrace line with the satisfied or
      violated criteria, in the existing reason-string style.
    - Ladder movement composes with, does not replace, existing slot/lane/contract
      selection: the ladder proposes the rung; contracts still govern the day.

3.6 New tests:
    tests/unit/ladderProgressionCriteria.test.ts   (advance/hold/regress truth table)
    tests/unit/ladderProgressionDeterminism.test.ts
    tests/unit/ladderSafetyFloor.test.ts           (pain always reaches difficulty ≤2)
    + extend programGoldenAnchors with two ladder personas (a climber, a regressor)

3.7 Surface in product: session screen shows current rung + what earns the next one
    ("2 clean sessions at 12 reps unlocks DB RDL"). Progress screen shows
    rungs-climbed per pattern. This metric also feeds the gym operator dashboard
    (B2B: member-progress signal nobody else can show).

3.8 Silence is a signal (design principle, ratified Sotirios 2026-07-12):
    A completed session with no feedback is implicit consent to progress — not a
    void. Every session resolves to one of three states, never a fourth silent one:
      - Negative feedback (pain, too hard, simplify_pattern) → react per 3.3.
      - Positive feedback → counts as a clean session per 3.2.
      - Silence + completion → ALSO counts as a clean session per 3.2, provided
        the objective log supports it: session finished, sets logged, no
        mid-session abandonment. An abandoned session is not "easy" — it holds.
    Missing feedback bands never block advancement: where 3.2 reads effortBand,
    confidenceBand, or painDelta, an absent value satisfies the criterion whenever
    the objective criteria (completed = "yes", reps vs target) are met. Without
    this, the silent majority — most clients, in practice — would hold forever,
    and a static program is the primary churn driver.
    Check-ins are framed as a veto on offered progress, not a prerequisite for it:
    the product announces the earned advance ("3 clean sessions — next session
    moves you up. Too soon? Tell us."). A veto is recorded as a difficulty signal
    on that exercise; silence confirms the advance. Either response is
    informative; nagging for ratings is not.
    Test obligation: 3.6's truth table must include a silent-completion persona
    (no feedback ever, all sessions completed) that advances on schedule, and an
    abandonment persona (silent, incomplete sessions) that holds.

Acceptance: truth-table tests green; determinism suite green; benchmark score does
not regress; a synthetic 8-week persona demonstrably climbs hinge 1→3 in the
persona-review harness (add to docs/dev-reports/ in the existing format).

---

### Phase 3.2 — Feedback Contract: Sacrifice / Test / Modify (next-session prompt)

**Context (ED-3.0.2):** Phase 3.0-refinement replaced the silent hard-block with a
deferred flag.  `deferred === true` is set here — never automatically by the engine.

**Prompt surface:** At the start of the next session after a flag (pain === "severe" OR
difficulty === "failed"), the app surfaces a three-button card for each flagged exercise:

| Button | Semantic | Engine effect |
|--------|----------|---------------|
| **Sacrifice** | "I want to stop this exercise for now" | Sets `deferred: true`; tags exercise for phase-transition retest; emits a Sacrifice tag consumed by Phase 3.5 gating. |
| **Test** | "Keep it in — I'll try again" | No change to state; if the exercise is flagged a second consecutive time, auto-Sacrifice is applied. |
| **Modify** | "Make it easier" | Regresses one rung on the exercise's ladder (Phase 3.3 mechanics); clears the flag. |

**Silence is consent to Test:** if the user dismisses the prompt without selecting, the
engine treats it as Test (exercise stays in, second-flag auto-sacrifice rule applies).

**Out-of-scope here:** Phase 3 ladder advancement, any other UI surface.

**Acceptance:** Sacrifice tags written to user state; `deferred: true` set; Test/auto-sacrifice
logic covers two-consecutive-flag scenario; Modify triggers a one-rung regression;
truth-table tests extend 3.6.

---

### Phase 3.5 — Phase Gating Refinement (criteria-based supplement to time gate)

**Context:** The existing phase gate is time-based (N weeks at a phase).  This adds a
criteria-based layer that uses signals from Phase 3.2 as readiness indicators.

**Readiness signals consumed:**
- Sacrifice tags (exercise retired from a pattern → user is clearing the easy lane)
- Ladder-rung climbs per pattern (from Phase 3.1 advancement rule)

**Gate logic (supplement, not replacement):**
A user is eligible for phase advancement ONE CYCLE early if, for every primary pattern,
either:
- At least one rung climb has been logged in the last cycle, OR
- At least one Sacrifice tag exists for an exercise in that pattern.

**Rationale:** Sacrifice reveals the user is outgrowing a rung (they can't tolerate it).
Rung climbs directly evidence progression.  Together they make time-gating conservative
while rewarding demonstrated adaptation.

**Acceptance:** Gate logic is traceable (decisionTrace line); does not override minimum
session count; determinism suite green.

---

## Phase 3W — Tailored warmup contract (build alongside Phase 3; both consume ladders)

Principle: every session's warmup provably prepares that session's work —
injury-risk reduction, activation, and pattern rehearsal. The warmup is the
teaching layer: recall the pattern unloaded before loading it.

3W.1 Contract per generated day, four ordered blocks within a 5–8 min budget
     (user-adjustable):
     RAMP      1 general pick (raise temperature)
     MOBILIZE  picks whose `mobilizes` covers the joints loaded by today's main
               patterns (pattern→joint map, ~15 lines, Sotirios authors)
     ACTIVATE  picks from the matching toolboxes (scap_health for push/pull days,
               hip_health for hinge, knee_health for squat/lunge, core_health)
     PRIME     a d1–d2 rung from the SAME ladder as each of today's main patterns,
               unloaded/light — the ladder read downward is the warmup generator
3W.2 Overlays: assessment focus tags inject their corrective block daily
     (e.g. forward_head → chin-tuck/wall-slide) regardless of split;
     painContraindications filter all blocks.
     AMENDMENT (2026-07-12): pain flags may INJECT protective prep, not only filter.
     Knee ruling: knee prep triggers on `knee_dominant` days via the map, and on any
     lower-body day when knee pain is flagged.
3W.3 Data (lands in Phase 2b annotation pass): `primes: [patterns]` and
     `mobilizes: [joints]` on all warmup/activation entries (~35). These REPLACE
     difficulty/ladder-pattern requirements for those categories.
     AMENDMENT (2026-07-12): elbows/wrists/grip trimmed from the joint map.
     Draft knee-mobilizer entries (awaiting Sotirios's rename):
       - half-kneeling knee-over-toe rocks
       - wall-supported deep-knee-bend hold
3W.4 Engineering: deterministic (seeded), respects existing warmupPlanner slot
     structure, every pick writes a decisionTrace line naming its block and its
     because ("primer: glute-bridges — today's main: barbell-romanian-deadlift").
3W.5 Tests: tests/unit/warmupContract.test.ts — for every anchor persona and a
     generated matrix: each main pattern of the day has ≥1 primer from its ladder;
     mobilize covers loaded joints; activation matches toolbox mapping; zero
     contraindicated picks; budget respected. Extend golden anchors with warmup
     assertions.
3W.6 Cooldown contract (AMENDMENT 2026-07-12): cooldown = down-shift mirror of the
     day's loaded joints plus breathing. Picks from the same toolboxes as MOBILIZE
     but ordered toward parasympathetic (breath-paced, lower intensity).
Acceptance: contract tests green; anchor personas show correct primers; a pain-
flagged persona provably gets a filtered-but-complete warmup, never an empty one.

## Phase 4 — Assessment truth loop

Goal: the assessment never claims more than the photo supports, visibly drives the
plan, and is re-tested so its claims can be retired by contact with reality.

### Phase 4 ticket (AMENDMENT 2026-07-12): Severity-graded contraindications

Implement severity-graded contraindications: `"acute"` blocks the exercise entirely;
`"manageable"` allows-with-note (exercise surfaced with a coach note, not silently
filtered). Group B rows in ED-2c.3 await this ticket before a ruling can be applied.

4.1 Confidence gate (src/lib/engine/poseFocus.ts):
    If pose.confidenceScore < CONF_FLOOR (draft 0.55) → return no focus tags +
    a status the UI renders as: "Photo wasn't clear enough for posture observations —
    retake, or continue without posture biasing." Truth over coverage.
    Additionally require both keypoints of any symmetry pair ≥ minScore 0.35
    (current pointByName floor 0.2 is too permissive for making claims).

4.2 Language contract: every user-facing posture statement is an OBSERVATION with its
    number ("head position measured 0.11 forward of shoulder line; threshold 0.08"),
    never a diagnosis. derivePoseFocus already builds these reason strings — surface
    them verbatim. Add copy rule to docs/programming-contract.md.

4.3 Because→Therefore surfacing: results view shows, per corrective and per biased
    main pick, the assessment reason it traces to (source: existing selection audit /
    prescriptionRationale). One line each. This is the "assessment guides the whole
    workout" made visible.

4.4 Re-assessment cadence: prompt at every phase transition (or 28 days, whichever
    first). Compare against baseline metrics. Tag lifecycle:
      retire a focus tag after metric clears threshold on 2 consecutive retests,
      or one retest ≥15% under threshold (hysteresis against photo noise).
    Retirement writes a decisionTrace line and visibly changes the next program
    ("scapular focus retired — retest cleared threshold — corrective slot reallocated").

4.5 Capture-quality guidance at photo time (framing, distance, side + front views);
    two-view capture optional but recommended — side view is what makes
    forward-head/torso-lean honest.

4.6 New tests:
    tests/unit/poseFocusConfidenceGate.test.ts
    tests/unit/focusTagLifecycle.test.ts (issue → persist → retire, with hysteresis)

Acceptance: low-confidence fixture yields zero tags + honest status; retest fixture
retires a tag and the regenerated program provably differs in the traced slot.

---

## Phase 5 — The undeniable-results layer

Goal: one screen where the app proves itself or admits it hasn't yet.

Contents (nearly all data exists):
  - Baseline vs latest pose metrics (only high-confidence pairs; show "not enough
    signal" honestly when confidence gate blocked either end)
  - Ladder rungs climbed per pattern (Phase 3 output) — the headline metric
  - PR list + consistency (RecentPrList / progress components — reuse)
  - Phase history with the criteria that earned each transition

Same components power the gym operator view (apps/gyms) — this screen IS the pilot
sales demo. A gym owner watching a member's hinge go 1→3 with the reasons attached
is the close.

Acceptance: screen renders from a synthetic 8-week persona; every number on it is
traceable to a log or a gated measurement; no metric appears without its provenance.

### Phase 5 UX Expansion — Sacrifice / Retest Tracking

**Context (Phase 3.2):** Phase 3.2 produces Sacrifice tags when users retire an exercise.
These tags are meaningful milestones — they signal that a user outgrew a movement and is
ready to be reintroduced to it at a harder rung (phase-transition retest).

**Tracking screen additions:**

- **Sacrificed-exercise panel:** lists every exercise the user has Sacrificed, grouped by
  pattern.  Each entry shows the rung it was sacrificed at and how many sessions ago.
- **Retest prompt at phase transition:** when a new phase begins, the app surfaces a
  "Ready to retest?" card for each Sacrificed exercise.  The user can Reintroduce (adds
  the exercise at the next rung up) or Extend the sacrifice (keeps deferred for another
  phase).
- **Reintroduce verdict logged to decisionTrace:** visible in the advanced session audit.

**Gym operator view:** The Sacrifice/Retest cadence is exposed in the member-progress
B2B panel (apps/gyms) — coaches can see which exercises their clients have outgrown and
which retests are pending, making the coaching layer transparent.

**Acceptance:** Panel renders from Sacrifice tags in user state; retest prompt fires
exactly once per Sacrificed exercise per phase boundary; Reintroduce removes the
deferred flag and logs the rung advancement.

---
---

# ═══ Engine work complete — 2026-XX-XX (fill on merge of PR #22) ═══

Phases 0 through 5 built the coaching engine: security foundation, catalog
surgery + institutionalization + slot degradation contract, monorepo unification,
ladder advancement with determinism + safety floors, the sacrifice/test/modify
feedback contract, training intent + personal equipment blocks, tailored warmup
contract, criteria-based phase gating, assessment truth loop with confidence
gate + retest lifecycle, undeniable results projection.

Everything from Phase 6 onward is product-and-distribution work, not engine
work. Different discipline, same rules: contract-first, verifiable claims,
falsifications preserved, one phase per session.

---

## Phase 6 — Ship Readiness Pass

**Standing rule SR-6 (log in engine-decisions.md as ED-6.0):** every decision
in ship-readiness that makes the app *look* more like a real product must also
make it *behave* more like one. No cosmetic-only work. If a change adds visual
polish, it must also add a real capability, close a real risk, or remove a real
dishonesty. This is the discipline that separates ship-ready from
shipping-with-a-fresh-coat-of-paint.

### 6.1 — Media honesty audit

All 225 catalog exercises carry `videoUrl: "https://example.com/video/[id]"`,
which will 404 on click. Shipping-a-lie. Fix in three steps:
- Change `Exercise.videoUrl` to `videoUrl?: string` (optional).
- Delete every `example.com` videoUrl.
- In every UI location that reads `videoUrl`, gracefully degrade to a "Video
  coming soon" placeholder card with existing `formCues` and `commonMistakes`
  as the fallback content. Do NOT invent a "Show demo" button that goes
  nowhere.

Turns 225 broken links into 225 working coaching moments.

### 6.2 — Legal foundation

Author these routes in `apps/consumer/src/app/`:
- `/privacy` — real privacy policy reflecting actual app behavior. Truthful
  claims to include: pose analysis runs client-side (photos never leave device),
  account data stored on hosted DB (be specific — check current setup), no
  third-party ad networks, users can request full decision-log export (which
  is genuinely available — traces exist).
- `/terms` — standard consumer terms plus one required product-specific clause:
  "Praxis is not a medical device and does not diagnose, treat, or prevent
  injury. Consult a qualified professional for medical decisions." Reflect
  Motion Care's Ontario base.
- `/refunds` — refund policy. Draft: 14-day full refund on any subscription,
  no questions asked. Simple, aggressive, eliminates purchase-friction
  objections.
- Footer component (both apps) linking to all three plus support email
  `mailto:` placeholder. Same footer both apps, different brand tokens.

Docs must be honest, not template boilerplate. Where a real policy decision is
needed (data retention length, cookie consent scope for EU/UK), flag with
`TODO(sotirios): decide before launch` inline. Log all TODOs in
`docs/ship-readiness-decisions.md`.

### 6.3 — Per-section visibility (user-controlled progressive disclosure)

Sotirios's ratified design: the user decides, per section, what appears in
their interface. Not three curated modes — user agency over their attention.

New state on user profile: `sectionVisibility: Record<sectionId, boolean>`.
Each toggleable section on results, session, and day views declares a stable
`sectionId`. Section header renders with a small eye-icon affordance that
toggles its visibility persistently. Hidden sections leave a subtle "N sections
hidden — [show all]" line at the bottom of the parent screen, never
permanently invisible without recovery.

**Sensible defaults (hidden until toggled on):**
- Full decision trace (per-exercise "because [reason]" expanded)
- Phase history timeline (compact summary shown; full timeline hidden)
- Warmup contract four-block breakdown (single "warmup" summary shown; block
  detail hidden)
- Provenance footer (visible; but the "view full decision log" link is
  collapsed into a small text link, not a button)

**Sensible defaults (visible):**
- Headline metric
- Current ladders section
- Sacrifice retest queue (if non-empty)
- Posture section (baseline vs latest)
- Compact phase progression summary
- Retired tags (quiet celebration copy)

**Toggleable but visible-by-default:**
- Session-screen ladder pill on each exercise card
- Day-view corrective-source annotations ("Chosen because: [reason]")

Settings page gets an "Interface" section with a list of all toggleable
sections grouped by screen (Results / Session / Day), each with its current
visibility state and a description of what it contains. A "Reset to defaults"
button returns everything to the ratified defaults above.

Implementation: `<VisibilityGate sectionId="...">` component wraps each
toggleable region. `useSectionVisibility(sectionId)` hook returns `[visible,
toggle]`. Zero new screens — same components, same layouts, conditional
render based on user state. Persisted alongside other user preferences.

### 6.4 — Brand consistency sweep

Grep for `Body Alignment Coach` and legacy references outside cookie-prefix
territory (per Phase 0's ratified decision, `bac_` cookie names stay legacy).
Rename user-facing strings only. `apps/consumer/src/components/InstallApp.tsx`
has one known instance; others may exist in email templates, error messages,
questionnaire flow.

Report the full list in the PR body before applying, so Sotirios can approve
edge cases (some strings may be intentional heritage callouts, not oversights).

### 6.5 — First-run smoke test path

Author `tests/e2e/firstRunHappyPath.spec.ts` in `apps/consumer` — real
Playwright test that: opens app → completes onboarding as a Build-intent
user → generates program → opens session → marks one exercise complete →
opens results → sees headline metric. If any step breaks, ship-readiness
is a lie.

Same test in `apps/gyms` but the happy path is an operator viewing a
member's projection.

### 6.6 — Error boundaries and honest failure modes

Wrap results view, session view, assessment flow in React error boundaries.
On engine or projection error, the boundary shows:
*"Something didn't render correctly. Your data is safe. [Reload] [Report this]."*

Report button captures error stack to a log endpoint (stub with `console.error`
if endpoint not built yet). Zero white screens of death shipped.

### 6.7 — Metadata and social sharing polish

Extend `apps/consumer/src/app/layout.tsx` metadata: real Open Graph tags,
Twitter card, favicon (SVG + PNG fallbacks), apple-touch-icon, description
that reflects what the app actually does. Same for gyms with B2B framing.

Current description: *"Personal training for strength, posture, and movement
quality."* Draft replacement: *"Progressive strength training with
posture-aware programming and criteria-based advancement."*

### 6.8 — Analytics (Sotirios ratified: Path A)

Install Plausible as privacy-respecting analytics package. Disclose in
privacy policy (§6.2) as "aggregated usage stats, no personal tracking, no
third-party ad networks." Standard Plausible config; EU hosting; no cookies
required (Plausible is cookieless by design, which sidesteps EU/UK cookie
consent for this component). Log ratification in engine-decisions.md as
ED-6.8.

### Out of scope for Phase 6 (absolute)

- Any engine logic changes
- Video content production (separate ongoing content phase)
- App Store / Play Store packaging (Web-first ship; native apps are a future
  decision)
- Gyms-app dashboard features beyond the operator view Phase 5 built
- Marketing site work
- Pricing page copy (Sotirios decides with the pilot conversations)

### Acceptance

Full gate green. All 6.1–6.7 items shipped in one branch. Merge commit.

### Sotirios's parallel track (out of code scope, in ship scope)

Infrastructure that only Sotirios can do:
- Stripe: test-mode → live-mode API keys in Vercel envs, both projects.
  Create subscription products/prices in Stripe dashboard. Test one real
  transaction on own card, issue self-refund.
- Vercel: verify both projects build clean from monorepo. Custom domains
  if available. Confirm env vars carry from standalone repos.
- Neon DB: confirm production tier (free tier pauses on inactivity),
  backups enabled.
- Support email: decide address (probably `support@` domain), give to Code
  for legal docs placement.
- Email deliverability: SPF/DKIM/DMARC setup for transactional email.

Motion Care conversion (afternoon of writing):
- One-page description of app as between-session layer of practice.
- Pricing structure decision: package with app included vs. app as
  separate $/month tier.
- First three clients selected for onboarding — clients, not beta testers.

Gym owner outreach (ongoing):
- List of ten independently owned GTA gyms with owner names.
- Pitch is not a deck — it's an on-floor demo of posture assessment on
  trainers or members.


Phase 6a — Voice & Coherence Pass

Branch: phase-6a-voice-coherence from origin/main. This is a copy translation pass + one state coherence bug fix + one dev-only route move. NOT new features. NOT engine changes. Multi-commit; separate concerns.

Guiding principle (log as SR-6a)

The app currently speaks as the engine. It must speak as a coach — specifically, as a Motion Care coach, which is Sotirios's voice. Every user-facing string must pass this test: "would I say this to a 55-year-old client after their Wednesday session?" If no, rewrite until yes.

Engineering vocabulary that must NOT appear in user-facing copy anywhere:

"rung" (say "level" or use the exercise name)
"ladder" (say "your progression" or name the movement)
"corrective consistency" (say "how often you did the work")
"movement pattern focus" (say "exercise")
"pattern proficiency" (either explain inline or hide until meaningful)
"gate locked" (say when the next phase starts, in one line)
"focus tag" (say "the thing your posture check flagged")
"adaptive weakpoint" (say what actually changed and why)
"corrective emphasis" (say "extra work on X")
"phase gate progress" (collapse into a single "workouts done / needed" line)

Engineering that CAN stay (users can learn a few real terms):

"Phase 1", "Phase 2", "Phase 3"
"RPE" (with hover-tooltip explanation)
"sets", "reps", "rest"
Commit 1 — Plan state coherence bug (SHIP-CRITICAL)

Symptom: a Pro user sees "Pro" badge top-right, "Plan: Free" pill in the header, "Praxis Pro active" in Billing, AND an "Unlock the full weekly plan / Upgrade to Pro" upsell card — all on one screen.

Root cause hypothesis: multiple components read plan status from different sources (IndexedDB direct vs. props vs. cached selector). Find every plan-status read in apps/consumer/src. They should ALL come from a single hook useUserPlan() returning {plan: "free" | "pro", loading}. Refactor every site to use it. Test: seed a Pro user, verify all badges/pills/upsell gates agree. Seed a Free user, verify same.

Same audit in apps/gyms/src — operator view should never render consumer-plan chrome; confirm nothing leaks.

Commit 2 — Copy translation, screen by screen

Apply as written unless a rewrite breaks a layout constraint, in which case shorten while preserving voice.

Landing
"Praxis is built for corrective performance, not generic workouts." → "Praxis fixes what's holding your movement back, then builds strength on top."
Onboarding guide popover: appears only on scroll OR 3s idle, not on initial paint.
"You'll complete: 1. Movement & posture baseline 2. Structured movement profile assessment 3. Personalized plan build" → "You'll answer a few questions, take three posture photos, and get your plan. Under three minutes."
Questionnaire
Intent options:
"Progress to harder movements" → "Build strength and skill week to week"
"Keep what I have" → "Keep what I have, stay strong"
"Working through an issue" → "Coming back from injury"
Assessment upload
"Filled slots: 0/3" → remove entirely. Let three photo cards speak.
"No photo yet" → keep.
Dashboard — the biggest translation zone

Phase card:

"Training readiness: 75% (Good) / Week: 0/3 days / Cycle: 1" → "This week: 0 of 3 sessions done."
Entire "Phase Gate / Gate locked / 12 workouts remaining or 30 days remaining / Workout gate progress 0% / 0/12 workouts in phase / Days in phase 0% / 0/30 days in phase / Week progress 0%" block: → ONE line: "Phase 2 unlocks after 12 sessions or 30 days — whichever comes first. You've done 0 sessions so far." Dev/expanded needs the numbers? Hide behind visibility toggle from Phase 6.

Card grid (Today / Week / Progress / Insights / History / Billing):

Remove "Level 2", "Level 3", "PRO" badges (internal complexity tiers).
Remove tiny letter tiles (T / W / P / I / H / A) — visual noise, no info.

Today expanded:

"Movement pattern focus 1 of 8" → "Exercise 1 of 8"
"Corrective Guidance" → "Focus for this exercise"
"System adapted this week to improve stability and execution quality" → keep.
"This week's priorities: Primary focus patterns: balance and asymmetry control · breathing and ribcage control · squat pattern control · Breathing And Ribcage Control · Recovery cue: easy walk + mobility after sessions" → DEDUPE (breathing appears twice), then: → "This week we're focused on your balance, your breathing, and your squat pattern. Between sessions: keep it easy — walk, mobility work, sleep."

Progress expanded:

"Consistency 0% · Completion 0%" → "Your first session will start filling this in."
"Phase Progression / Requirements and readiness to move ahead" → "When does Phase 2 start?"

Billing expanded:

Move "Edit movement profile" button OUT of Billing → into Settings.
Session start
"Today's options / This changes only today's session view. Your saved plan is not changed." → "Adjust just today's session — your plan stays the same."
Consolidate 5 options → 3: → Full ("The whole session as planned") → Lighter ("Same movements, less work") — merges Steady + Reduced + Simplified → Recovery ("Mobility and easy movement only")
"Corrective Guidance / Maintain posture" → "Focus / Keep your posture steady."
"Movement pattern focus 1 of 8" → "Exercise 1 of 8"
In-exercise
"Movement pattern focus / Rest" toggle → "Working / Resting"
"Movement pattern focus mode" button → remove, use the toggle only.
"Pattern proficiency 0%" → HIDE until non-zero. When shown: → "Cue consistency: 60%" with hover "How often you're hitting the coaching cue on this movement."
"Log this movement pattern focus" → "Log this set"
Post-session
"Corrective consistency 100%" → "How often you did the work: 100%"
Rest of screen: keep, it's strong.
"Next session recommendation: simplify the pattern before progressing" → "For next session: we'll simplify this movement before moving forward."
Legal

Privacy policy: keep as-is.

Settings — corrective note
"Corrective settings note / Changing corrective emphasis reshapes focus areas — your movement history remains intact" → Show ONLY adjacent to a control that changes corrective emphasis. Never as an ambient banner.
Interface visibility panel
Bug: nearly every toggle is currently ON. Phase 6.3 ratified selective defaults. Audit and fix:
Default VISIBLE (rename in parens): Headline metric, Current ladders ("Your progression"), Sacrifice retest queue ("Exercises ready to try again"), Posture observations ("Posture check results"), Retired posture focus ("Areas you've improved"), Ladder progress pill ("Level indicator").
Default HIDDEN: Phase history timeline, Provenance footer, Warmup four-block breakdown, Corrective-source annotations.
"Real-device QA pass" panel → MOVE (see Commit 3).
Commit 3 — Dev route hygiene
Move "Real-device QA pass" panel out of user Settings into new apps/consumer/src/app/dev-qa/page.tsx, gated NODE_ENV === "development" — same pattern as /dev-seed. Prod builds: panel absent from settings tree.
Same audit in apps/gyms/src.
Not in this pass
No engine changes.
No new features.
No visual redesign (colors/spacing/layout stay). Flag if a copy change breaks layout.
No /dev-seed changes.
No legal content changes.
Acceptance
Plan state bug fixed: Pro shows Pro everywhere, Free shows Free.
Every string in Copy Translation applied.
Visibility defaults match ratified Phase 6.3 spec.
Real-device QA at /dev-qa, gated, absent in prod.
Full gate green.
Screenshot smoke: seed 12-week climber, walk the eleven screens, confirm no engineering vocabulary remains user-facing.

Merge commit.


## Sequencing & effort (with Claude Code)

P0 security            0.5 day        (both repos)
P1 monorepo            1–3 days       (hard timebox; fallback = sync script)
P2 catalog truth       drafting is fast; YOUR review is the real cost —
                       2–4 evenings, one pattern per sitting
P3 ladder engine       2–4 days incl. tests
P4 assessment truth    2–3 days
P5 proof screen        1–2 days

Revenue does not wait for P2–P5. Lane 1 (Motion Care clients) and Lane 2 (gym pilot
conversations) start after P0. P2–P4 are the moat being built while you sell.

## Working agreement with Claude Code

- Feed it this file. One phase per session; one PR per numbered item where sensible.
- Anchors are law: if a golden/identity/determinism test changes without an explicit
  contract change in this doc, the PR is wrong.
- Domain calls (ladders, thresholds, criteria constants) are drafted by the model and
  decided by Sotirios. The model compiles; you architect. Same division as Horus.
- Every falsified approach gets a line in the relevant decisions log. Nothing silently
  disappears.
- **Import type safety rule (ED-5.0, 2026-07-22):** `import type { ... }` is for types ONLY.
  Runtime values (functions, constants, classes) must appear in a separate plain `import { ... }`.
  Enforced by `@typescript-eslint/no-import-type-side-effects` + `@typescript-eslint/consistent-type-imports`
  in `eslint.config.mjs`. Violating this causes a `ReferenceError` at runtime because TypeScript
  strips `import type` entirely at emit. This rule was added after the Phase 4 regression where
  `shouldPromptRetest` (a function) was placed inside `import type` in `ResultsRoutine.tsx`.
- **Branch-creation rule (2026-07-12):** Every phase branch must be cut from `origin/main`
  at the exact merge-commit SHA logged in the work order (e.g. `git checkout -b phase-Xc-foo
  ec9a621`). Before opening a PR the branch must be rebased onto that same SHA so the
  merge-base is clean. Confirm with `git merge-base HEAD origin/main` = target SHA.
- **Merge method (standing rule, 2026-07-11):** Merge commits are required in this repo.
  Squash is never acceptable. PR #8 was squashed against this rule and is logged as a
  standing-rule violation in `docs/ladder-decisions.md`. Any PR opened with squash merge
  selected is out of contract.
- SCOPE BOUNDARY (2026-07-11, per Sotirios): Praxis stays standalone. Zakhor is a
  separate memory project — do NOT integrate, bridge, or couple this app to Zakhor
  or to any external memory/knowledge system. Any PR introducing such a connection
  is out of contract regardless of how useful it looks. This app gets locked in
  as its own complete thing.

---

## Appendix A — Consumer repo audit (2026-07-11, post-visibility-flip)

posture-app cloned and diffed against praxis-gyms. Findings that change the plan:

A1. THE ENGINES WERE BYTE-IDENTICAL at the April copy. `diff -rq` across src/lib
    returned exactly one line: praxis-gyms adds `gymSaas/`. Every engine file —
    program.ts, engine/, exercises.ts, progression, phases, auth, Stripe, stores —
    was identical. posture-app's last commit was 2026-04-27; the copy was made
    2026-04-28.

    AMENDMENT (2026-07-12): posture-app's engine has since advanced through
    P2/2b/2c and is canonical. The gyms engine copy is discarded per 1.2.
    The 1.7 purity check scopes to engine files vs POSTURE-APP's pre-monorepo tag
    and gyms app-shell files vs PRAXIS-GYMS's pre-monorepo tag — no cross-repo
    engine comparison is expected to pass.

    ⇒ Phase 1 is now a pure file move (posture-app engine is canonical SoT).
    Timebox likely beats 3 days comfortably.

A2. Divergence is shell-only: praxis-gyms adds /pilot, /enterprise, /gym-demo,
    /gym-admin routes + gymSaas lib + gym components, and modifies ~20 shared UI
    components. These map cleanly to apps/gyms vs apps/consumer in the monorepo.
    Catalog coverage numbers in the baseline audit apply verbatim to both repos.

A3. Phase 0 applies verbatim to both repos: admin route, authToken, stripeServer,
    rateLimit confirmed identical byte-for-byte. The stray `posture-app@0.1.0`
    file exists in BOTH roots — delete in both (or once, post-merge).

A4. History: posture-app holds the full 148-commit arc (2026-02-05 → 2026-04-27);
    praxis-gyms squashed it. In the monorepo migration, preserve posture-app's
    history as the base (git mv within it, or graft) — the falsification record
    and decision archaeology live there. Do not orphan it.

A5. Consumer README is stale: still describes the app as local-first with "no login
    required," predating the auth/Stripe/cloud-sync work that is plainly in the
    code. Rewrite alongside Phase 0 — the README is the first thing a gym owner's
    technical friend will read. Original product name was "Body Alignment Coach"
    (explains the `bac_` cookie prefix); brand is now Praxis. Decide whether the
    cookie names migrate at merge time or stay legacy (README already flags the
    legacy-naming tradeoff — keep that honesty).

---

## Phase 2c — Red to Green

**Branch:** `phase-2c-red-to-green`  
**Merge method:** merge commit (squash never acceptable)  
**Exit criteria:** full suite green or documented-quarantine only; anchor gate 25/25; invariants 11/11

### 2c.1 — programFuzz (priority)

Root cause: Advanced / 3-day / Back+Chest / dumbbells-only / upper-back+shoulders pain
empties the extra_back_loaded slot and the generator silently drops it.

Do NOT patch the test expectation. Implement the slot degradation contract in the
generator: when equipment+pain filtering empties any main slot, degrade in strict order:
- (a) relax to a sibling family within the same lane
- (b) ladder-aware substitution: any exercise of the same pattern at any rung the user can access
- (c) corrective fallback from the mapped toolbox (pull lanes → scap_health;
  hinge/squat lanes → hip_health/knee_health; core → core_health), slot relabeled corrective
- (d) drop ONLY as last resort, writing a decisionTrace line AND a user-visible day note explaining why

Zero silent drops anywhere in generation. Deterministic, seeded, traced.

**Delivered:**
- `src/lib/types.ts`: `ProgramDay.coachNotes?: string[]`, `ProgramSelectionDecisionTrace.degradationReason`
- `src/lib/program.ts`: Unique ID Guard stages (a→b/c→d); Extra Slot Governor duplicate guard
- `programFuzz.test.ts`: all 180 scenarios pass

### 2c.2 — programFuzz contract assertion + new test

- `tests/unit/programFuzz.test.ts` updated: silent count mismatch = failure; traced drop acceptable
- `tests/unit/slotDegradationContract.test.ts` created: covers all four stages including exact i=29 persona

### 2c.3 — Contraindication audit (report only, no tag changes)

Produced list of horizontal-pull exercises excluded by "shoulders" pain that are arguably
safe for non-acute shoulder issues. Key entries for Sotirios's ruling:
- `dumbbell-chest-supported-row` — chest support removes shoulder stabilization demand
- `face-pull` family — prescribed in shoulder rehab
- `back-widow`, `prone-swimmer`, `reverse-snow-angel` — supine/prone, no shoulder joint load
- `machine-seated-row`, `banded-rows-seated`, `suspension-row-incline` — seated/incline profiles

Full audit in `docs/engine-decisions.md` § ED-2c.3.

### 2c.4 — April failures

| Test | First-failing commit | Verdict | Action |
|------|---------------------|---------|--------|
| `resultsOperationalReadiness` — "backfills phase workout progress" | `67a8c45` | Stale test | Fixed: `vi.useFakeTimers({ toFake: ["Date"] })` |
| `sessionFeedbackInfluence` — "failed exercise gets deprioritized" | `6f367b0` | Code bug | Quarantined (Phase 1 scope) |
| `sessionFeedbackSubstitution` — "next week uses recent logs…" | `86f7da7` | Code bug | Quarantined (Phase 1 scope) |

Quarantine condition: repair pipeline (`repairBackChestMainIntelligence`) does not propagate
`feedbackSummaryByExercise` / `recentLogs` into `selectBackChest*` helpers, so a penalized
exercise can be reinserted as a repair anchor. Full rationale in `docs/engine-decisions.md` § ED-2c.4.

### 2c.5 — Hygiene

- `docs/engine-decisions.md` created for engine-behavior decisions
- `bloom-plan.md` committed at repo root with this Phase 2c spec appended
- SEO working-tree files confirmed committed to `praxis-seo-foundation` and pushed to origin

### Out of scope (absolutely)

Phase 1, Phase 3, warmup contract, any catalog restructuring beyond what degradation requires.

