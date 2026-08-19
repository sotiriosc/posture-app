# Real User Longitudinal Adaptation Variable Audit

**Classification:** `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`

**Authority:** `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`

**Runtime:** `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`; activation `NOT_ACTIVATED`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.

Owner classifications below use only the requested receiver vocabulary. A row may name a capture owner and a separate decision/application owner where the fact crosses a typed handoff.

| Variable | Owner classification | Gate 16 use | Production gap |
|---|---|---|---|
| Actual completion | `Performance` | Canonical completed-event status | No live adapter authorized |
| Partial completion | `Performance` | Distinct partial status; never described as completed | No live adapter authorized |
| Substitution | `Performance` | Preserve original and realized identity | Product reconciliation absent |
| Actual dose | `Performance` | Dose trajectory independent from plan | Device/manual source and confidence contract absent |
| Actual effort | `Performance` | Readiness/realization context only when observed | Validated RPE/RIR schema absent |
| Actual tempo | `Performance` | Timing evidence independent from Prescription | Sensor/manual capture absent |
| Actual duration | `Performance` | Duration evidence independent from Prescription | Sensor/manual capture absent |
| Quality | `Performance` | Criterion-specific trajectory | Calibration and owner-specific criteria absent |
| Symptoms | `Response Receiver`, `TrainingSafety` | Local applicability, modification, or Safety review | Live response and escalation adapters absent |
| Delayed symptoms | `Response Receiver` | Time-ordered response/persistence evidence | Follow-up capture contract absent |
| Recovery | `Progression Readiness` | Adequate/concern/unknown evidence | Canonical normalized recovery source absent |
| Sleep/readiness | `Progression Readiness` | Explicit blocker/context, never inferred action | Validated normalization and uncertainty absent |
| Illness | `TrainingSafety` | Safety precedence or external review | Product-to-Safety source contract absent |
| Adherence | `Product Adapter`, `Week` | Constraint or reviewed Week aggregate | Live adherence adapter absent |
| Motivation | `Future Typed Contract`, `Intentionally No Direct Effect` | No direct progression/replacement effect in V1 | Legitimate receiver and semantics unresolved |
| Equipment | `Product Adapter`, `Prescription` | Legal realization and axis capability | Runtime equipment-delta adapter absent |
| Travel | `Product Adapter`, `Week` | Potential schedule/equipment constraint after normalization | Typed travel-to-Week handoff absent |
| Work/sport load | `Product Adapter`, `Progression Readiness` | Recovery/readiness context after owner review | External-load aggregate contract absent |
| Schedule | `Week` | Week-review input only | Production Week Planner/allocation absent |
| Repeated pain | `Response Receiver`, `TrainingSafety` | Scoped repeated adverse evidence; Safety retains precedence | Clinical escalation contract absent |
| Successful re-exposure | `Response Receiver` | Preserve options and weaken replacement pressure | Live response linkage absent |
| Plateau | `Progression Readiness`, `Gate 16 Longitudinal Adaptation` | Review evidence, never automatic replacement | Production policy/kernel absent |
| Return after absence | `Progression Readiness`, `Gate 16 Longitudinal Adaptation` | Rebuild evidence window; do not infer regression | Return/readiness source policy absent |
| Phase transition | `Gate 15 Phase Continuity` | Consume current result or request reevaluation | Gate 16-to-Gate 15 orchestration unauthorized |
| Goal change | `Application/Persistence`, `Intentionally No Direct Effect` | Invalidates/changes active lineage only after rightful owner update | Goal-owner revision contract absent |
| Preference/variety | `Candidate Intelligence`, `Gate 16 Longitudinal Adaptation` | Bounded non-anchor rotation review when eligible | Live preference source and rerun integration absent |
| Coach override | `Application/Persistence` | Reviewed source/revision; never hidden policy | Typed override, audit, and rollback absent |
| Clinician restriction | `TrainingSafety` | Safety authority and external review | Live clinical restriction adapter absent |
| Missed sessions | `Performance`, `Week` | Not-performed truth; repeated pattern may request Week review | Live completion and Week aggregate absent |
| Deload | `Gate 16 Longitudinal Adaptation`, `Week`, `Prescription` | Gate 16 may request review; Week/Prescription realize later | Production aggregate and realization policies absent |
| Progression | `Gate 16 Longitudinal Adaptation`, `Prescription` | Authorize one legal axis; exact dose deferred | Production Gate 16 kernel and compiler handoff absent |
| Regression | `Gate 16 Longitudinal Adaptation`, `Prescription` | Authorize one local legal axis | Production Gate 16 kernel and compiler handoff absent |
| Replacement | `Gate 16 Longitudinal Adaptation`, `Candidate Intelligence`, `Session Composer` | Reopen selection after repeated evidence/review; no identity choice | Candidate/Composer rerun integration absent |
| Rotation | `Gate 16 Longitudinal Adaptation`, `Candidate Intelligence`, `Session Composer` | Reopen bounded eligible non-anchor selection | Rotation source policy and rerun integration absent |

The design deliberately represents unknown values instead of imputing them. Before live integration, every source needs identity, authority, revision, occurrence time, confidence/unknown semantics, athlete consent/privacy handling, deduplication, correction behavior, and deterministic reconciliation.
