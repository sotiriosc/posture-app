# Prescription Policy Candidate Matrix

Candidate state: `PRESCRIPTION_TEST_CANDIDATE_NOT_PRODUCTION`.

The lattice is frozen before consequence tests. It is not a production policy and does not select a winner.

Families: 19. Shapes per family: `minimal_truthful`, `balanced`, `high_dose_or_high_complexity_stress`, `no_policy_control`. Total candidates: 76.

Families:

- preparation
- activation
- main strength
- secondary strength
- main hypertrophy
- hypertrophy accessory
- direct accessory
- timed holds
- breath cycles
- carries
- stationary marches
- counted-step work
- recovery/cooldown
- rest
- effort
- tempo intent
- exact phase tempo
- duration
- block structure

Every family contains a minimal truthful candidate, a balanced candidate, a high-dose/high-complexity stress candidate, and a no-policy control. No balanced candidate is assumed to win.

Candidate lattice fingerprint: `8af38098302cd08da5f33bfab663dadd4cf55cbaf43040d950c545df091b18fe`.

## Executable Numeric Tournament Layer

The executable numeric tournament replaces generic candidate markers with structured policy values for the same 19 families and 76 atomic candidates, plus seven composite candidates. It remains a test candidate lattice only.

- Candidate state: `PRESCRIPTION_NUMERIC_TEST_CANDIDATE_NOT_PRODUCTION`
- Atomic candidates: 76
- Composite candidates: 7
- Calibration scenarios: 24
- New locked holdout scenarios: 60
- Candidate/scenario evaluations: 6,972
- Complete downstream pipelines: 6,297
- Numeric policy activated: no

Executable manifest fingerprint: `7d96a67a80ce0b6c16f40523cd6b8f2734128953e781dcfe977dd12aba4c69a8`.

Atomic fingerprint: `12f617ab36ccdce9ee14469de4303c4601caf330b9d2e0f70b1798e2e4b2eaab`.

Composite fingerprint: `a24bf7deaa78cdba5df2d214cd113c43a0b7bd0db630fbc5d5433b3bcbfd6a37`.

Detailed manifest: `PRESCRIPTION_NUMERIC_POLICY_CANDIDATE_MANIFEST.md`.
