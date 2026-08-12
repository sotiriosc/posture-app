# Knowledge-Compatible Seven-Row Production Report

Classification: **SEVEN_ROWS_PRODUCTION_PHASE_ACTIVATION_GATE_FAILED**.

Catalog size: 30 -> 37. Contextual production phase activated: **false**.

## Phase Dual Run

| Scenario | Legacy winner | Contextual winner | Winner changed | Order changed |
| --- | --- | --- | --- | --- |
| controlled:horizontal-push-phase-1 | machine-chest-press | push-up | true | true |
| controlled:lower-squat-phase-1 | goblet-squat | leg-press | true | true |
| golden:advanced-gym-muscle-gain | chest-supported-dumbbell-row | machine-row | true | true |
| continuity:phase_3 | machine-row | machine-row | false | true |

Activation failures:
- controlled:horizontal-push-phase-1: machine-chest-press -> push-up. Winner changed without an accepted contextual phase component on the new winner.
- controlled:lower-squat-phase-1: goblet-squat -> leg-press. Winner changed without an accepted contextual phase component on the new winner.
- golden:advanced-gym-muscle-gain: chest-supported-dumbbell-row -> machine-row. Winner changed without an accepted contextual phase component on the new winner.

## Fingerprints

| Contract | Fingerprint |
| --- | --- |
| Phase dual-run and annotations | 0a025f127927a51fffaf257bfe16f8e1b0bcfa21c3d0b0d14f10de21e3c95dcc |
| Current-row stress migration | 5de2302d5427dce372e9826a4b3c670fed01a101c16a72b0fb143bd383e15504 |
| Long-lever migration | 9b8f06c32d71bafe7b1d3d78c1bd56c180faad0c7e1b6e6e6de6e3e150f70646 |
| Seven-row catalog | 5f785e769222d08e073382d264831196799c7e7dc258ec3a8dccc9617c93597e |
| Seven-row support/stance | fce834f056dbb6383b3576d1f8c33419cfe19cde213784474b4f5f72fc9d3bfd |
| New role candidate pools | 3107254d1a9a349a898a0f8f39ea4d823264b861161e75df08bde3e6dd372d6c |
| Knowledge compatibility | 4ae9b04a475f5243b387932d1e24da70cdaa044260156a4c17b9a346106009cf |
| Full production catalog | 649e76af161dd206a1fe3f7fb42b24542fc25d56bcafaf1e299992d4e303a0e6 |

Production ranking: d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782 -> 237de4c80d45c1da2bd60b88e624ccd5ba08d32a9f58d36241e52d1ca47fc118.

Comprehensive behavior: 216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9 -> 2553739b6ce4aef79500e6e786d279332470fb176079d17b3e9a594bdd463a02.

The seven rows are production catalog knowledge, not session composition. No Library, Knowledge Layer, Coaching Rail, UI, second catalog, automatic substitution, automatic progression, or workout-length policy is implemented.
