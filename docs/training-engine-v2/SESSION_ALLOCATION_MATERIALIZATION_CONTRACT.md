# Session Allocation Materialization Contract

Status: `DESIGN_READY` as a boundary proposal; no production adapter exists.

The Session Allocation Materializer is the only proposed bridge from a future reservation to the existing production `SessionAllocationDirective`. It compares expected planning facts with explicit actual current facts and never edits production Planner, Candidate Intelligence, or Composer behavior.

## Input

`SessionAllocationMaterializationInput` requires a reservation, actual evaluation time, actual safety state, and explicit unresolved context. Actual current availability and equipment are optional only so their absence can be reported. Product/user update references provide provenance for changed facts.

## Output

`SessionAllocationMaterializationResult` returns `directive_materialized`, `requires_week_reallocation`, `under_specified_current_context`, `blocked_by_training_readiness`, or `unsupported_context`. A successful result includes the existing directive, current equipment beside it for the frozen Planner input, expected-versus-actual trace, retained weekly objective IDs, and unresolved/reallocation evidence.

## Materialization Rules

- Actual safety blocking prevents materialization.
- Missing current availability or equipment remains under-specified.
- Cancelled/missed reservations or changed structural capacity/equipment route to Week reallocation when responsibility feasibility changed.
- Raw minute differences alone do not create duration policy; when structural capacity remains coherent, actual minutes replace expected minutes in the directive.
- Every weekly responsibility is retained with structured target and source evidence.
- Current facts use current-fact provenance and expected facts remain in comparison trace only.
- The materializer does not choose replacement responsibilities, exercises, dose, or sequence.

The production Session Planner remains the authority that validates the materialized directive and builds session needs. The design lab invokes it only as an opaque downstream feasibility oracle.
