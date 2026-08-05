You are working in:

Repository: sotiriosc/posture-app
Product: Praxis
Investigation report:
docs/assessment-history-disconnect-findings.md
Date of report: 2026-07-30

MISSION

Fix the production disconnect between:

1. the current live assessment stored at:
   app_user_state.assessment

and

2. progressive assessment history stored/read from:
   program.assessmentHistory
   program.focusTagLifecycle

The current problem is:

- users can complete real photo assessments;
- the current accepted assessment report is persisted;
- progress/trend UI expects AssessmentSnapshot history;
- no production path reliably writes accepted live PoseAnalysis results into assessmentHistory;
- only demos/tests seed those snapshots;
- after reload, users usually have a current report but no genuine longitudinal comparison;
- demo/history data can disagree with the current assessment because they are created independently;
- retest cadence may use estimated or synthetic counts rather than real completed-session counts;
- UI wording can blur:
  - current assessment observations;
  - program focus;
  - historical improvement.

This is a production data-integrity and user-trust issue.

Do not start coding immediately.

Do not merge anything.

PHASE 1 — FULL READ-ONLY TRACE

First inspect the repository and document the exact data flow for:

A. Assessment capture
- photo upload/capture;
- pose analysis;
- result acceptance;
- report generation;
- save endpoint/action;
- app_user_state.assessment persistence;
- reload/hydration.

B. Program state
- Program type;
- AssessmentSnapshot type;
- assessmentHistory;
- focusTagLifecycle;
- initial program creation;
- regeneration;
- next cycle;
- next phase;
- session completion;
- persistence and hydration.

C. Progress UI
- current assessment report;
- baseline/latest comparison;
- movement-quality trend;
- progress-photo comparison;
- Knowledge UI;
- Analysis UI;
- any badges, percentages, arrows, or improvement language.

D. Demo/test seed paths
- where synthetic assessmentHistory is inserted;
- where demo current assessment is inserted;
- whether those can disagree;
- whether demo-specific behavior can leak into production.

E. Retest cadence
- how “sessions since assessment” is currently calculated;
- whether it uses:
  - actual completed sessions;
  - planned sessions;
  - calendar estimates;
  - week number;
  - phase progression;
  - seed/demo counters.

Produce a trace table:

| Event/path | Reads current assessment | Writes current assessment | Reads history | Writes history | Reads focus lifecycle | Writes focus lifecycle | Persists across reload | Production or demo/test |

Also produce a source-of-truth diagram before implementation.

PHASE 2 — DEFINE THE SOURCE OF TRUTH

Establish these rules unless the existing architecture proves a safer equivalent:

1. app_user_state.assessment is the current accepted assessment report/state.
2. program.assessmentHistory is the chronological immutable history of accepted assessment snapshots used for comparison.
3. program.focusTagLifecycle tracks the program’s active focus over time and must reference or correspond to real accepted assessments/program transitions.
4. The current assessment and latest historical snapshot must be derived from the same accepted analysis event.
5. UI must never combine:
   - a current report from one assessment;
   - with a baseline/latest trend from unrelated demo or stale history;
   without explicitly labeling the difference.
6. Draft, failed, rejected, incomplete, or superseded pose analyses must not create history entries.
7. A repeated save/retry of the same accepted assessment must not create duplicate snapshots.

Do not make program.assessmentHistory the only place the full current report lives if existing production APIs rely on app_user_state.assessment.

Reconcile the systems; do not destroy backward compatibility.

PHASE 3 — DEFINE AN ACCEPTED ASSESSMENT EVENT

Find the one production boundary where PoseAnalysis becomes an accepted user assessment.

Create or consolidate a domain operation conceptually equivalent to:

recordAcceptedAssessment({
  userState,
  program,
  poseAnalysis,
  assessmentReport,
  acceptedAt,
  assessmentId,
  source,
  completedSessionCount
})

Adapt names to the existing codebase.

This operation must atomically or safely update the required state:

- current app_user_state.assessment;
- one AssessmentSnapshot in program.assessmentHistory;
- focusTagLifecycle only when warranted;
- assessment metadata needed for retest cadence;
- audit/version fields if the repository already uses them.

Do not scatter duplicate history-writing logic across multiple routes/components.

The domain operation should be reusable by consumer and gyms where both share this behavior.

PHASE 4 — SNAPSHOT DESIGN

Inspect the existing AssessmentSnapshot type and preserve compatibility where possible.

Every production snapshot should contain enough stable information to support real comparison without depending on mutable current state.

Audit and include, where supported:

- stable assessment ID;
- accepted timestamp;
- source/version;
- relevant pose-analysis version;
- focus tags;
- scored observations;
- normalized severity/confidence where already available;
- completed-session count at time of assessment;
- phase/cycle/week context if meaningful;
- references to photo assets only if storage/privacy architecture already supports this;
- sufficient values for the current comparison algorithm;
- migration/version marker.

Do not store unnecessary raw image data inside Program state.

Do not invent precision that PoseAnalysis does not provide.

Do not convert qualitative outputs into fake scientific measurements merely to show trends.

PHASE 5 — IDENTITY, IDEMPOTENCY, AND ORDERING

Implement robust history semantics.

Requirements:

1. One accepted assessment event creates at most one snapshot.
2. Retries are idempotent.
3. Snapshots have stable identity.
4. History remains chronological.
5. Out-of-order persistence does not corrupt “latest”.
6. Duplicate snapshots are detected using a stable assessment/event ID, not timestamp alone.
7. Historical entries are immutable after acceptance, except for narrowly justified migrations.
8. A newly accepted assessment becomes latest only after successful persistence.
9. Partial failure must not leave current assessment and history permanently inconsistent.

Use the repository’s current transaction/persistence capabilities.

If true database atomicity is unavailable, implement a recoverable and tested write ordering with explicit reconciliation.

PHASE 6 — LEGACY DATA RECONCILIATION

Handle existing users safely.

Audit these cases:

A. Current assessment exists, assessmentHistory empty.
B. History exists, current assessment missing.
C. Current assessment and latest history match.
D. Current assessment and latest history disagree.
E. Demo-seeded history exists in a real production account.
F. Multiple duplicate history entries.
G. Old snapshots missing new metadata.
H. Program missing entirely.
I. Assessment exists before program creation.

Define deterministic behavior for each.

Preferred conservative strategy:

- do not fabricate a rich historical baseline from data that was never recorded;
- allow a one-time migration/backfill of the current accepted assessment into history only when provenance is sufficiently clear;
- label migrated entries internally;
- never present a fabricated “improvement” against a synthetic baseline;
- if only one trustworthy snapshot exists, show baseline established / more data needed;
- preserve old valid history.

Add a reconciliation function or migration path that is idempotent.

Do not silently use demo data as production truth.

PHASE 7 — FOCUS TAG LIFECYCLE

Audit exactly what focusTagLifecycle means.

Separate:

1. assessment observations:
   what the analysis detected;

2. program focus:
   what the engine chose to prioritize;

3. lifecycle history:
   when and why the active focus changed.

Do not assume every observed issue becomes a program focus.

When writing a new assessment:

- derive assessment observations from accepted PoseAnalysis;
- allow existing program logic to determine active program focus;
- append/update focusTagLifecycle only when the active focus genuinely changes or the existing lifecycle design calls for a new assessment checkpoint;
- attach reason/source metadata if current types support it;
- prevent duplicate lifecycle entries on retry.

Document the exact rule in code comments and tests.

PHASE 8 — RETEST CADENCE

Replace synthetic or inferred session timing with real completed-session counts.

Find the canonical source for completed sessions.

Retest eligibility should be based on persisted actual session completion events, not merely:

- calendar days;
- current week number;
- planned workouts;
- page visits;
- demo counters.

Store the completed-session count associated with each accepted assessment, or derive it reliably from immutable session history.

Define and test:

sessionsSinceLastAssessment =
  currentCompletedSessionCount
  - completedSessionCountAtLatestAcceptedAssessment

Requirements:

- never negative;
- stable across reload;
- unaffected by skipped/planned sessions;
- not incremented by opening a session;
- incremented only by the repository’s accepted completed-session event;
- compatible with migrated snapshots missing counts;
- gracefully falls back when old data cannot support an exact number.

Do not hard-code a new retest threshold unless one already exists.

Preserve current product policy while fixing the counter source.

PHASE 9 — PROGRESS COMPARISON SEMANTICS

Audit the existing comparison/scoring algorithm.

Ensure:

1. comparison uses two trustworthy snapshots from the same schema/version or a supported compatibility adapter;
2. baseline and latest are clearly identified;
3. one snapshot does not produce fake improvement;
4. missing focus tags are handled explicitly;
5. a focus tag appearing/disappearing is not automatically treated as improvement or worsening without defined semantics;
6. confidence/quality changes do not masquerade as physical progress;
7. assessment version changes do not create false trends;
8. comparison remains deterministic;
9. current report and latest snapshot agree after a successful accepted assessment.

Where versions are incompatible:

- suppress the numeric comparison;
- explain that a new baseline was established;
- do not invent continuity.

PHASE 10 — UI CLARITY

Clarify the UI distinction between:

A. Current assessment observations
“What the latest assessment detected.”

B. Program focus
“What Praxis is currently prioritizing in the training plan.”

C. Progress over time
“How comparable accepted assessments changed.”

Use concise, non-medical language.

Do not claim:

- diagnosis;
- clinical correction;
- guaranteed improvement;
- exact anatomical change beyond what the engine actually measures.

Required states:

1. No assessment:
   “Complete an assessment to establish a baseline.”

2. One accepted assessment:
   “Baseline established. Complete a future reassessment to compare progress.”

3. Two comparable assessments:
   show real baseline/latest comparison.

4. Incompatible versions:
   “A new baseline was established after the assessment system changed.”

5. Current report exists but history reconciliation pending:
   never show demo/synthetic improvement.

6. Program focus differs from latest observation:
   explain that program priorities are selected from multiple inputs and may not mirror every observation.

Remove or isolate demo-only trend data from real-user production paths.

PHASE 11 — CONSUMER AND GYMS PARITY

Audit both apps.

Ensure accepted assessments produce equivalent durable history semantics in:

- consumer;
- gyms;

unless there is a documented product reason for different behavior.

Avoid copying domain logic independently into both frontends.

Prefer shared package/service/domain code.

PHASE 12 — PRIVACY AND STORAGE

Because this concerns user photos and body assessments:

- do not expand image retention without explicit existing product support;
- do not log raw image URLs or sensitive pose payloads unnecessarily;
- do not expose one user’s history to another;
- preserve tenant/gym isolation;
- preserve auth checks;
- ensure history endpoints use the same authorization boundaries as current assessment access;
- do not put sensitive data into client-visible demo seeds for production users.

Do not modify billing or Stripe.

PHASE 13 — TEST-FIRST MATRIX

Before changing production behavior, add failing tests that reproduce the disconnect.

Add tests for:

1. Accepted live assessment:
   - saves current assessment;
   - appends one real snapshot;
   - updates appropriate lifecycle state;
   - survives reload.

2. Idempotency:
   - retry same assessment ID;
   - no duplicate snapshot;
   - no duplicate lifecycle entry.

3. New reassessment:
   - appends second snapshot;
   - current assessment equals latest snapshot source;
   - comparison uses real baseline/latest.

4. Failed/rejected/draft assessment:
   - no history entry.

5. Existing user:
   - current assessment + empty history;
   - safe one-time reconciliation where valid;
   - no fake improvement.

6. Stale/demo mismatch:
   - current report and unrelated seeded history;
   - production UI does not combine them;
   - demo data remains isolated to demo/test mode.

7. Reload:
   - history and current assessment persist;
   - latest remains correct.

8. Out-of-order timestamps/writes:
   - ordering remains deterministic.

9. Duplicate timestamps:
   - stable assessment ID controls identity.

10. Focus lifecycle:
   - no change means no duplicate lifecycle entry;
   - real focus change creates one entry;
   - observation-only changes do not automatically equal program-focus changes.

11. Retest cadence:
   - actual completed sessions increment;
   - planned/opened/skipped sessions do not;
   - count survives reload;
   - no negative count;
   - legacy missing count handled safely.

12. Comparison:
   - one snapshot = baseline only;
   - two comparable snapshots = real trend;
   - incompatible versions = new baseline, no fake trend;
   - confidence differences do not create false improvement.

13. Consumer/gyms parity.

14. Authorization/tenant isolation.

15. Property/invariant tests:
   - latest accepted assessment and latest trustworthy snapshot cannot disagree after successful persistence;
   - one event ID cannot produce more than one snapshot;
   - history order is stable;
   - demo snapshots cannot enter production user state.

Avoid relying only on snapshots.
Assert domain invariants explicitly.

PHASE 14 — MANUAL ACCEPTANCE FLOW

Test with a real non-demo account:

1. Start with no assessment/history.
2. Complete and accept a photo assessment.
3. Confirm:
   - current report appears;
   - one baseline snapshot exists;
   - no improvement claim appears yet.
4. Reload browser.
5. Confirm state persists.
6. Complete real sessions.
7. Confirm retest session count reflects only completed sessions.
8. Complete a second accepted assessment.
9. Confirm:
   - second snapshot appended;
   - latest report and latest snapshot agree;
   - baseline/latest comparison appears;
   - program focus remains separately explained.
10. Reload again.
11. Confirm history and comparison remain unchanged.
12. Repeat save/retry on the same assessment event.
13. Confirm no duplicate.
14. Test consumer and gyms.
15. Confirm demo account still works without contaminating production behavior.

PHASE 15 — VALIDATION

Inspect package scripts and run all relevant repository commands.

At minimum, run repository equivalents of:

- typecheck;
- lint;
- unit tests;
- integration tests;
- consumer build;
- gyms build;
- persistence/store tests;
- assessment tests;
- program tests;
- progress UI tests;
- session-history tests;
- any fuzz/property suites;
- local-safe acceptance flow.

Preserve local-safe configuration:

USER_STORE_DRIVER=memory
TRAINING_STORE_DRIVER=disabled
DATABASE_URL empty

Do not require external network access for tests.

For every failure, classify:

- caused by this change;
- pre-existing;
- environmental;
- flaky/indeterminate.

Do not report a suite as passing if it was not run.

PHASE 16 — DELIVERY

Create a focused PR.

Do not merge it.

Recommended PR title:

fix(progress): persist accepted assessments into real history

PR description must include:

1. Root cause.
2. Source-of-truth decision.
3. Before/after data-flow diagram.
4. Migration/reconciliation behavior.
5. Snapshot idempotency strategy.
6. Retest cadence correction.
7. Consumer/gyms parity.
8. UI wording/state changes.
9. Tests added.
10. Validation commands and exact results.
11. Remaining risks.
12. Explicit confirmation:
   - no billing/Stripe changes;
   - no unsupported image-retention expansion;
   - no demo data used as production truth;
   - no merge performed.

FINAL REPORT FORMAT

Return:

A. Executive verdict

B. Root cause with exact files/functions

C. Before data flow

D. After data flow

E. Source-of-truth contract

F. Legacy-data handling matrix

G. Retest cadence behavior

H. UI behavior for:
- zero snapshots;
- one snapshot;
- two comparable snapshots;
- incompatible snapshots;
- demo mode.

I. Files changed

J. Tests added

K. Commands run with results

L. Remaining risks

M. PR URL

N. Explicit statement that the PR was not merged

QUALITY BAR

This is not complete just because assessmentHistory receives an append.

It is complete only when:

- accepted live assessments create durable real history;
- retries cannot duplicate history;
- current assessment and latest history share one lineage;
- reload preserves truth;
- demo data cannot disagree with production data;
- one snapshot never produces fake improvement;
- comparison is version-aware;
- retest cadence uses real completed sessions;
- assessment observations and program focus are clearly distinguished;
- consumer and gyms use the same domain behavior;
- legacy users are handled conservatively;
- privacy and authorization remain intact.