# Production Final Sequencing Transition Facts

Generated deterministically from the inactive production Final Session Sequencing kernel.

Every directed assignment pair has one possible production transition fact. It contains assignment identity, attempt, section/dependency/setup/equipment/support/resistance/location relationships, typed pairwise interference, explicit timing IDs, unknown components, and provenance.

Explicit facts are owner/review typed. Highest-authority facts resolve deterministically; incompatible equal-authority facts return `SEQUENCING_TRANSITION_FACT_CONFLICT` and are never averaged. Exercise-ID input is not authoritative.
