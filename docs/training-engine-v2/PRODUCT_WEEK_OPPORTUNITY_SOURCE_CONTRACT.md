# Product Week Opportunity Source Contract

Status: design-only `DESIGN_READY`.

Legal sources include explicit user or coach availability, product schedule, observed calendar windows, profile defaults, travel/location plans, equipment overrides, prior revisions, and completed/missed state. Each source carries stable ID, typed provenance, recording time, confirmation, truth state, and update reference. Arbitrary notes are never parsed for behavior.

Factual precedence is explicit current user, explicit coach/current product facts, live calendar state, product-planned expected availability, profile default, then unknown. A higher factual source may replace expected fact but cannot change weekly programming priority. Equal-authority incompatible current facts return `HORIZON_SOURCE_CONFLICT`; timestamps and prose do not choose a winner.

Calendar free time is only observed availability, not training consent, location, equipment, or readiness. Profile defaults produce tentative/suggested opportunities requiring confirmation. Optional windows preserve `startAt`, `endAt`, timezone, source, and confirmation. Order-only input remains order-only and cannot yield elapsed recovery time.

Equipment is an explicit snapshot, a reference resolved through a typed versioned capability record, or unknown. Environment labels and location names manufacture no capabilities.
