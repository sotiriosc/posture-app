# Adaptation Application Stress Report

Status: **ADAPTATION_APPLICATION_ORCHESTRATION_V1_IMPLEMENTED_NOT_ACTIVATED**

Activation: **NOT_ACTIVATED**

## Deterministic Stress

```json
{
  "preconditionEvaluations": 10000,
  "routingEvaluations": 10000,
  "ownerResultValidations": 10000,
  "localityValidations": 10000,
  "shadowCandidateBuilds": 5000,
  "prescriptionOwnerProposals": 2000,
  "candidateComposerPipelines": 2000,
  "weekOrchestrations": 2000,
  "phaseOrchestrations": 1000,
  "safetyOrchestrations": 1000,
  "affectedSessionRebuilds": 2000,
  "gate13Revalidations": 2000,
  "persistenceTransactions": 1000,
  "concurrentIdempotentPairs": 1000,
  "replayComparisons": 1000,
  "stalePreconditionMutations": 1000,
  "noRescueMutations": 1000,
  "repeatedRunsDeterministic": true,
  "failures": [],
  "fingerprint": "2e87a5231357f602393cd0ff7b1e6e5e67df7548966e7fcc17862658f615bcda"
}
```

## Contract Truth

- Contract: `ADAPTATION_APPLICATION_ORCHESTRATION@1.0.0`
- Orchestration policy: `ADAPTATION_APPLICATION_ORCHESTRATION_POLICY_V1_SHADOW_FIRST@1.0.0`
- Confirmation policy: `ADAPTATION_APPLICATION_CONFIRMATION_POLICY_V1_EXPLICIT_MATERIAL_CHANGE@1.0.0`
- Authority registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@10.0.0`
- Controlled scenarios: 240
- Holdout failures: 0
- Stress failures: 0
- Combined fingerprint: `a88a493e1553badb4f8cada551ee9d8357d21c4e04872c852bc60058769f8aca`

## Binding Boundary

This is an explicit-call, production-source-only shadow kernel. It selects no action, axis, numeric dose, exercise identity, Week objective, opportunity, phase target, or Safety workaround. It applies no directive and mutates no Product state.
