# Week Policy V1 Owner Selection

Classification: `WEEK_POLICY_V1_PARTIAL_SCOPE_READY_TARGETED_POLICY_GAPS`.

Candidate state: `OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION`. Production activation: **no**.

## Week Policy V1 Causal Core Candidate

```json
{
  "sourceType": "owner_decision",
  "reviewerId": "sotiriosc",
  "reviewedAt": "2026-08-12T22:00:00-04:00",
  "sourceRef": "docs/training-engine-v2/WEEK_POLICY_V1_OWNER_SELECTION.md#week-policy-v1-causal-core-candidate",
  "candidateId": "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE",
  "status": "OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION",
  "strength": {
    "required": [
      1,
      2,
      3
    ],
    "preferred": [
      0,
      1,
      2
    ],
    "optional": [
      0,
      1,
      1
    ],
    "candidate": "STRENGTH_S2_BALANCED"
  },
  "muscle": {
    "required": [
      1,
      1,
      2
    ],
    "preferred": [
      0,
      1,
      2
    ],
    "optional": [
      0,
      1,
      1
    ],
    "candidate": "MUSCLE_H1_SINGLE_FLEXIBLE"
  },
  "direct": {
    "required": [
      1,
      1,
      1
    ],
    "preferred": [
      0,
      1,
      1
    ],
    "optional": [
      0,
      1,
      1
    ],
    "candidate": "DIRECT_D1_ONCE"
  },
  "assessment": {
    "required": [
      1,
      1,
      1
    ],
    "preferred": [
      0,
      1,
      1
    ],
    "candidate": "ASSESSMENT_A1_SINGLE_CLUSTER"
  },
  "capacity": {
    "required": [
      1,
      1,
      1
    ],
    "preferred": [
      0,
      1,
      1
    ],
    "optional": [
      0,
      1,
      1
    ],
    "candidate": "CAPACITY_C1_ONCE"
  },
  "participation": "PARTICIPATION_P0_NONE",
  "spacing": "SPACING_R0_PRESCRIPTION_PENDING",
  "deferred": [
    "H2_DEFERRED_PENDING_PRESCRIPTION_DISTRIBUTION_EVIDENCE",
    "D2_DEFERRED_NO_UNIQUE_EXECUTABLE_VALUE",
    "C2_DEFERRED_NO_UNIQUE_REPEAT_VALUE"
  ],
  "productionActivation": false
}
```

H1 is selected. H2 is deferred pending Prescription-informed distribution evidence. D2 and C2 are deferred because neither established unique executable repeat value.
