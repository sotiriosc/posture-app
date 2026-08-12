# Session Composer Implementation Contract

Classification: `SESSION_COMPOSER_DESIGN_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION`.

This is the owner-ready contract for a future production implementation. The present branch supplies contracts and a lab only.

## Required Components

1. **Session Intent Deriver**

   Produce explicit needs and constraints from authorized structured inputs. Do not begin from five section slots. Every need must retain source/rationale trace and stable identity.

2. **Candidate Request Adapter**

   Create one exact Candidate Intelligence request per need. Preserve training role, movement/action/muscle requirement, equipment, pain, safety, assessment, phase, history and continuity ownership. Do not merge unlike needs into a broad pool.

3. **Candidate Snapshot Builder**

   Export legal candidates, ranks, values, readiness and request IDs without discarding rejection evidence. Derive any composition logistics from reviewed structured data or a separately approved contextual model.

4. **Set Constructor**

   Find complete need covers under hard constraints. Start with a bounded deterministic strategy and expose search truncation. Never silently return a partial workout as complete.

5. **Whole-Session Evaluator**

   Compare equal-cardinality complete sets for optional overlap, continuity, redundancy, fatigue, setup and duration. Keep each component independently traceable and calibrated.

6. **Sequencer**

   Order the selected set from explicit dependency evidence. Report cycles and impossible order constraints without changing composition.

7. **Prescription Handoff**

   Pass selected exercise IDs, served needs, order and unresolved prescription requirements to Prescription. Composition must not choose realized dose or stress exposure.

8. **Session Validation And Trace**

   Prove legal provenance for each exercise/need edge, full required coverage, no duplicates, no unsupported preparation, hard constraint compliance, deterministic output and no unauthorized behavior.

## Proposed Production Inputs

- versioned `NeedsFirstSessionIntent`;
- one immutable Candidate Intelligence result per need;
- reviewed composition logistics with provenance;
- explicit continuity state and justified-change evidence;
- session-level time and exercise-count bounds;
- explicit sequence/preparation dependencies;
- deterministic evaluation context supplied by the caller.

Inputs must be serializable. Product labels, notes and educational content remain non-behavioral unless a later contract gives them an explicit receiver.

## Proposed Production Outputs

- completion status: complete, partial-for-review, infeasible or deferred-for-safety;
- selected canonical exercise IDs as an unordered composition result;
- need-to-exercise coverage edges and Candidate Intelligence request IDs;
- whole-session evaluation components;
- indispensable-selection evidence;
- continuity retained/changed evidence;
- sequenced canonical exercise IDs as a separate result;
- unresolved prescription requirements;
- deterministic structured decision trace and schema version.

The laboratory currently implements only `composed` and `infeasible`; broader product statuses require owner decisions.

## Production Gates

Production implementation may not ship until all gates pass:

- Session Intent derivation authority and need vocabulary approved;
- candidate snapshot adapter proven to preserve legal-pool and readiness truth;
- composition logistics provenance approved;
- continuity, redundancy, fatigue, setup and duration scales calibrated;
- incomplete and safety-deferred output policy approved;
- deterministic search bound and truncation policy approved;
- prescription handoff schema approved;
- whole-session golden personas and counterfactuals approved;
- production ranking, comprehensive behavior, catalog and Knowledge compatibility fingerprints remain frozen unless separately authorized;
- product integration receives separate authorization.

## Required Test Matrix

- no fixed-section quotas;
- minimal complete cover and multi-need overlap;
- legal-pool provenance for every coverage edge;
- infeasible missing pool, time bound and exercise-count bound;
- useful continuity retained among equivalent complete sets;
- justified change can beat continuity only through an approved component;
- redundancy, fatigue and setup tie-break isolation;
- preparation dependency and cyclic-order handling;
- deterministic tie behavior and input-order counterfactuals;
- materially different active user inputs create materially different structures;
- materially equivalent inputs may converge on the same structure;
- no forced exercise uniqueness, rotation or replacement;
- no prescription, phase, week or product side effects;
- production fingerprint freeze.

## Deferred Owner Decisions

- final Session Intent need taxonomy and derivation rules;
- whether any optional need may justify one additional exercise and under what explicit threshold;
- production fatigue and redundancy evidence scales;
- continuity comparison when a productive identity has a materially worse whole-session cost;
- duration estimation source and uncertainty handling;
- maximum candidate breadth and deterministic search strategy;
- partial-session behavior when safety or equipment removes a required pool;
- relationship between final sequencing and product display sections;
- prescription-resolution loop when a selected candidate has unresolved dose-created stress.

No deferred decision is silently answered by the lab constants.

Exact next dependency: `SEPARATE_OWNER_AUTHORIZATION_FOR_PRODUCTION_SESSION_COMPOSER_IMPLEMENTATION`.
