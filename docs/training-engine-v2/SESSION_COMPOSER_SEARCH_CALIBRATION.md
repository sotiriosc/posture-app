# Session Composer Search Calibration

Calibration inputs include the 16 named scenarios, 11 fixed-shell factors, capacity and raw-minute variants, multiple anchors, candidate review, Prescription requirements, equipment/pain modes, thin pools, full-candidate expanded structure, permutations, and 10,000 fixed deterministic generated cases.

Every tractable case uses exhaustive truth. Bounded winners matched all exhaustive winners. The boundary full-candidate expanded case was 351 exhaustive expansions/192 peak frontier versus 47 bounded expansions/frontier 4 with the same skeleton.

Selected production constants:

| Constant | Value |
| --- | ---: |
| Exact expanded-state threshold | 350 |
| Bounded expanded-state budget | 48 |
| Retained frontier per layer | 4 |

Frontier 1 and 2 changed the boundary winner; frontier 4 was the smallest tested value preserving every calibration winner. Budgets below 41 failed to produce the boundary skeleton; 48 is the reviewed explicit budget. Truncation remains visible and never authorizes fallback or repair.
