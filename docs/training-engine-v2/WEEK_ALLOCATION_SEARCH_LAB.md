# Week Allocation Search Lab

Status: non-production design evidence.

## Compared Architectures

| Architecture | Finding |
| --- | --- |
| fixed split template | Rejected: labels cause allocation and ignore current horizon, explicit priorities, equipment, spacing, and continuity. |
| first-fit/greedy | Rejected: local choices strand later required responsibility and hide whole-week recovery conflicts. |
| weighted additive score | `OWNER_POLICY_REQUIRED`: arbitrary weights permit compensation across non-compensable duties. |
| exhaustive complete-plan enumeration | `DESIGN_READY` for small design cases; proves the best plan under the declared lexicographic comparator. |
| bounded Pareto-frontier search | Recommended production architecture subject to approved bounds, retained-state policy, and inconclusive reporting. |

## Fixed-Split Contrast

The matrix includes more than 60 baseline/scenario comparisons. Observed failure codes include `split_label_caused_allocation`, missed frequency, unused feasible lanes, ignored recovery/distribution, overloaded opportunities, assessment repetition, and optional repetition without unique value. The templates are contrast fixtures only and are not candidate product behavior.

## Controlled Scenarios

Nineteen scenarios cover two-, three-, and four-opportunity strength weeks; hypertrophy; mixed goal; capacity; assessment; direct calf; grip/carry; travel; constrained opportunities; productive continuity; missed-session reallocation; external load; unsupported readiness context; no current availability; and global safety blocking. Results are 17 designed allocations, one `current_week_availability_required`, and one `blocked_by_training_readiness`.

Every selected controlled reservation accepted by the opaque production Planner/Candidate/Composer oracle produces a feasible session skeleton. Capacity-only ordinary reservations reveal a current ontology limitation: the frozen Planner requires a literal dominant-main responsibility, so these are infeasible rather than patched in Week design.

## Determinism And Bounds

The lab uses fixed evaluation time, stable ordering, canonical ties, and seed `0x086710`. The 10,000-case fuzz run evaluates 1,000 allocation enumerations with no invariant failures; digest `dc633459982820b83914c34f5835e368c2dc0c549ad0aaa829b47aa40a26ea4c` locks that result.

Production search bounds are `UNAPPROVED`. A bounded implementation must return `bounded_design_optimality_not_proven` or `search_inconclusive` honestly when it cannot prove the lexicographic optimum.
