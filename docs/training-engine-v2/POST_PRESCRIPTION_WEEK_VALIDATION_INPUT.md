# Post-Prescription Week Validation Input

| Field | Authority | Owner | Disposition |
|---|---|---|---|
| validationContract | COMPATIBILITY_INPUT | Post-Prescription Week Validation | DESIGN_CONTRACT_ONLY |
| weeklyIntent | DESIGN_UPSTREAM_AUTHORITY | Weekly Intent Planner | PRODUCTION_WEEK_ADAPTER_REQUIRED |
| weekAllocationPlan | DESIGN_UPSTREAM_AUTHORITY | Week Allocation Composer | PRODUCTION_WEEK_ADAPTER_REQUIRED |
| orderedReservations | DESIGN_UPSTREAM_AUTHORITY | Week Allocation Composer | EXPLICIT_RESERVATION_ORDER |
| planningHorizon | DESIGN_UPSTREAM_AUTHORITY | Product Horizon Adapter design | PRODUCT_ADAPTER_NOT_WIRED |
| sessionIntent | PRODUCTION_UPSTREAM_AUTHORITY | Session Intent Planner | PRODUCTION_CONTRACT |
| sessionSkeleton | PRODUCTION_UPSTREAM_AUTHORITY | Session Composer | PRODUCTION_CONTRACT |
| prescriptionCompilation | PRODUCTION_UPSTREAM_AUTHORITY | Prescription Compiler | PRODUCTION_KERNEL_AUTHORITY |
| sequencingResult | PRODUCTION_UPSTREAM_AUTHORITY | Final Session Sequencing | PRODUCTION_KERNEL_AUTHORITY |
| exerciseRegistry | PRODUCTION_UPSTREAM_AUTHORITY | Exercise domain | CANONICAL_REGISTRY |
| completedPerformance | FUTURE_PRODUCTION_ADAPTER_REQUIRED | Performance | OUTSIDE_VALIDATION_INPUT |

No hidden current time, UI state, rank, score, prose, report text, fixture name, or production random seed is behavioral input.
