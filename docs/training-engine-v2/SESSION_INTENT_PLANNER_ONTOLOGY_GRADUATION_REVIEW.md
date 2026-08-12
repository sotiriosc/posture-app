# Session Intent Planner Ontology Graduation Review

Verdict: `SESSION_INTENT_PLANNER_READY_FOR_WEEK_COMPOSER_DESIGN`.

## Six-Gate Review

1. **Ontology:** Outcome goal, programming context, ordinary session type, current availability, explicit allocation, assessment actions, and typed range requirements are now separated. `TrainingGoal`, `PhaseIntent.primaryGoal`, and legacy `WeeklyIntent` remain compatibility concepts outside Planner authority.
2. **Truth:** Directive objectives are externally supplied allocations. Assessment and mechanics review states remain explicit. Current equipment and availability carry provenance. Continuity is observational, never caller-authored policy.
3. **Ownership:** No duplicate Planner goal source remains. Schedule and missed-session compensation route to Week. Exercise choice, dose, and final order remain downstream.
4. **Boundaries:** Planner produces needs; Candidate produces legal ranked candidates; Composer produces a skeleton; Prescription and Sequencing remain handoffs; Week remains unimplemented.
5. **Coverage:** Sleep/recovery, illness, accessibility, crowding without a snapshot, social constraints, novelty requests, and standalone recovery sessions remain explicitly unrepresented.
6. **Real users:** The 18-user shell and 10+ same-experience/equipment regression expose material differences at the proper layer and justified convergence elsewhere.

The remaining gaps do not invalidate ordinary training from a valid explicit directive because the unresolved-context protocol keeps them visible and behaviorally inert. They do block broad claims that every real-user context is represented. The exact next architectural dependency is a reviewed Week allocation contract that gives this Planner a directive without importing weekly algorithms into it.
