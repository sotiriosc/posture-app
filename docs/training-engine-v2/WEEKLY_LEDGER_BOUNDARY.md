# Weekly Ledger Boundary

Status: `DESIGN_READY` boundary proposal. Planned Prescription and completed response ledgers are deferred.

Three ledgers are required because allocation, prescription, and performance answer different questions.

## Allocation Ledger

Owned by the Week Allocation Composer. An entry names weekly objective, reservation IDs, allocated opportunity count, allocation satisfaction state, and literal `doseCredit: 0`. It may answer where responsibility was reserved. It cannot answer what exercise or dose was prescribed, performed, tolerated, or adapted to.

## Planned Prescription Ledger

Owned by future Prescription/post-Prescription evaluation. An entry is keyed by one source exposure event and records reservation, exercise, Prescription, role/section, muscle-contribution relationships, prescribed dose, realized stress estimate, and recovery burden. One source event must not be counted again merely because it contributes to movement, action, capacity, and muscle views.

Muscle contribution remains a relationship (`direct`, meaningful secondary, stabilizing, or other reviewed ontology), never an unreviewed fractional set coefficient. Set-equivalence semantics are explicitly absent.

## Completed Response Ledger

Owned by completed-performance collection and Longitudinal Adaptation. An entry records source exposure, performance, adherence, execution quality, symptom response, recovery response, progression response, and re-exposure evidence. Only this layer may establish actual completed exposure and observed response.

## Boundary Rules

- Allocation count is not dose.
- Prescribed dose is not completed performance.
- Completed performance is not adaptation by itself.
- Expected future recovery burden is not observed readiness.
- Weekly frequency allocation can be validated before dose only as an allocation fact.
- Prescribed weekly validation is blocked until Prescription defines source-event and aggregation semantics.

## Evidence Amendment (2026-08-12)

The evidence review reinforces this boundary: participation guidance is not objective frequency, frequency is not set dose, volume is not opportunity count, and indirect contribution evidence is not a Praxis coefficient. The Product horizon ledger adds factual availability/revision history only; completed opportunities and prescriptions remain immutable.
