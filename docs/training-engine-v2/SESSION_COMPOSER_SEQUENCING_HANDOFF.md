# Session Composer Sequencing Handoff

`SessionSequencingInput` exposes assignments, fixed semantic-section precedence, preparation/ordering edges, fatigue/stress potential, unresolved execution readiness, and acyclic-graph validation.

The Composer serializes identities canonically for determinism. That serialization is not a final within-section training order. Final Sequencing remains unimplemented and must honor the partial-order graph plus realized Prescription facts.

## Prescription Duration Boundary

The full Prescription design lab classifies duration as determinate only when Prescription work, repetition timing when needed, holds/trips/marches, rest, side transitions, setup, and Sequencing transitions are explicit. Missing Sequencing transition facts return an incomplete duration state; no session time is invented.
