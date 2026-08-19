# CAGT Causal Contract

Every pair declares its expected response before execution in `CagtCounterfactualContract`: IDs/version, baseline/counterfactual, exact changed paths and fact IDs, canonical owner, materiality, earliest/latest response gates, invariant gates, permitted/prohibited dimensions, acceptable convergence reasons, framework/adaptive/Prescription/sequence relationships, authority expectations, provenance, and `downstreamRescueProhibited: true`.

Gate 0 computes the structured fixture diff and requires exact agreement with declared paths. Scenario IDs, evidence IDs, and trace labels are ignored only where explicitly permitted. Any undeclared behavioral change returns `FIXTURE_DIFF_INVALID` and hard-stops.

Before the earliest gate, material behavior is invariant. By the latest gate, a permitted material response or predeclared structured justified-convergence reason must exist. Prose and trace-only changes never satisfy material adaptation. Expected contracts are static input and cannot be inferred from observed output.

The closed difference vocabulary covers horizon/Week, day materialization, Session Intent, Candidate, Composer, future Prescription, future Sequencing, and non-material trace/display dimensions. Layer authority, not a weighted score, determines causal adequacy.
