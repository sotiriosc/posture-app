# Testimonials (Phase 6L)

Edit real, consented reviews in:

`docs/testimonials.json`

Shape:

```json
[
  {
    "name": "First name + last initial, or Anonymous",
    "role": "optional — e.g. Desk worker, 42",
    "quote": "The review text",
    "featured": true
  }
]
```

**SR-6L-reviews:** no fabricated reviews. Empty array is valid — the landing
section simply does not render until at least one real quote exists.

Fewer than 3 reviews display statically. 3+ rotate every ~5 seconds
(pauses on hover/tap).
