# Program Quality V2 — Fuzz-Integrity Assessment (Phase 7B §13)

- Generated: 2026-08-06T09:03:27.198Z
- Cases per mode: **10000** (release uses **10000** via `FUZZ_INTEGRITY_CASES_PER_MODE`)
- Elapsed: 5456370ms
- Verdict: **NEEDS_REVIEW**

Full release run (10000/mode).

## 13A. Diversity accounting

Reported as structural diversity / variation-seed diversity / output diversity.

### gym

**Structural diversity**

- Total cases: 10000
- Structural input tuples (excluding seed): 3756
- Unique pain combinations: 10
- Unique experience values: 3
- Unique phases: 3
- Unique frequencies: 3
- Unique equipment/capability lanes: 3
- Unique blocked-exercise configurations: 5

**Variation-seed diversity**

- Unique complete input tuples (including seed): 10000

**Output diversity**

- Unique semantic program signatures: 5168
- Unique ordered weekly exercise signatures: 4959
- Unique day-identity signatures: 3
- Most common signature count/share: 24 / 0.24%
- Recovery attempts / rate: 21 / 0.21%
- Fallback uses / rate: 21 / 0.21%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `89d52a62`: 24
- `40e6f39b`: 24
- `1c0a9f3c`: 22
- `f47837d0`: 22
- `7f09af3c`: 22
- `763d6f57`: 22
- `a8cffc5c`: 22
- `3f0ee810`: 21
- `dc5ce7df`: 20
- `b0807df4`: 20
- `a9315fc4`: 20
- `9c6f7d11`: 18
- `51c828a2`: 17
- `b516e5d3`: 16
- `3cadec7d`: 16
- `699c22a5`: 16
- `097b36fb`: 16
- `9ecc1b40`: 16
- `b9770ea1`: 15
- `d6361b6f`: 15


### dumbbells

**Structural diversity**

- Total cases: 10000
- Structural input tuples (excluding seed): 3505
- Unique pain combinations: 9
- Unique experience values: 3
- Unique phases: 3
- Unique frequencies: 3
- Unique equipment/capability lanes: 4
- Unique blocked-exercise configurations: 5

**Variation-seed diversity**

- Unique complete input tuples (including seed): 10000

**Output diversity**

- Unique semantic program signatures: 1364
- Unique ordered weekly exercise signatures: 1135
- Unique day-identity signatures: 3
- Most common signature count/share: 37 / 0.37%
- Recovery attempts / rate: 133 / 1.33%
- Fallback uses / rate: 133 / 1.33%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `557b0e9a`: 37
- `633439c5`: 35
- `b71e874d`: 35
- `a1edee9e`: 35
- `6144142e`: 34
- `12bf26c5`: 34
- `d84e2725`: 33
- `74e2153e`: 26
- `351cc01e`: 26
- `7b25a9e4`: 25
- `2e9b8bfa`: 25
- `740858fd`: 25
- `c2430d80`: 25
- `be40a196`: 25
- `64a3a9e6`: 25
- `21acab86`: 24
- `28d43b21`: 24
- `5dc64fcc`: 24
- `c474e98c`: 24
- `ad253a30`: 24


### bands

**Structural diversity**

- Total cases: 10000
- Structural input tuples (excluding seed): 2480
- Unique pain combinations: 9
- Unique experience values: 3
- Unique phases: 3
- Unique frequencies: 3
- Unique equipment/capability lanes: 6
- Unique blocked-exercise configurations: 5

**Variation-seed diversity**

- Unique complete input tuples (including seed): 10000

**Output diversity**

- Unique semantic program signatures: 1217
- Unique ordered weekly exercise signatures: 620
- Unique day-identity signatures: 3
- Most common signature count/share: 43 / 0.43%
- Recovery attempts / rate: 0 / 0.00%
- Fallback uses / rate: 0 / 0.00%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `d3bfd9bd`: 43
- `d14c47f1`: 37
- `c1bf26f3`: 37
- `52000e59`: 37
- `d0ce52cc`: 37
- `bbce38c0`: 36
- `e2ef8620`: 36
- `025a87ec`: 36
- `eae1a103`: 36
- `3d332a1e`: 36
- `1ac6dee2`: 36
- `11e6eafd`: 36
- `712271d5`: 36
- `f8ae9509`: 36
- `3c141560`: 36
- `563375b3`: 36
- `67959c00`: 35
- `129dafe4`: 35
- `cb2b7167`: 26
- `22b4ba67`: 26


### bodyweight

**Structural diversity**

- Total cases: 10000
- Structural input tuples (excluding seed): 2480
- Unique pain combinations: 9
- Unique experience values: 3
- Unique phases: 3
- Unique frequencies: 3
- Unique equipment/capability lanes: 6
- Unique blocked-exercise configurations: 5

**Variation-seed diversity**

- Unique complete input tuples (including seed): 10000

**Output diversity**

- Unique semantic program signatures: 1445
- Unique ordered weekly exercise signatures: 805
- Unique day-identity signatures: 3
- Most common signature count/share: 42 / 0.42%
- Recovery attempts / rate: 0 / 0.00%
- Fallback uses / rate: 0 / 0.00%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `23b88119`: 42
- `7dca086a`: 41
- `45fb94f7`: 41
- `91620c92`: 41
- `cc5aee27`: 41
- `1707368b`: 41
- `5158271e`: 40
- `59f9284b`: 40
- `48cd0406`: 40
- `67924fce`: 40
- `e9127130`: 39
- `ac959d1b`: 39
- `28e13b3c`: 39
- `f62942b8`: 38
- `95f84efb`: 38
- `87249a4f`: 32
- `3493ba2b`: 32
- `f87b4b34`: 31
- `5c1e80be`: 31
- `4812a1f6`: 30


### mixedHome

**Structural diversity**

- Total cases: 10000
- Structural input tuples (excluding seed): 8264
- Unique pain combinations: 8
- Unique experience values: 3
- Unique phases: 3
- Unique frequencies: 3
- Unique equipment/capability lanes: 18
- Unique blocked-exercise configurations: 5

**Variation-seed diversity**

- Unique complete input tuples (including seed): 10000

**Output diversity**

- Unique semantic program signatures: 3393
- Unique ordered weekly exercise signatures: 2541
- Unique day-identity signatures: 3
- Most common signature count/share: 14 / 0.14%
- Recovery attempts / rate: 134 / 1.34%
- Fallback uses / rate: 134 / 1.34%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `e54f8e8b`: 14
- `30029330`: 14
- `8f501a12`: 14
- `758fd1c2`: 14
- `1f8e5bdf`: 14
- `51f0aa98`: 14
- `be8dcfc6`: 14
- `ec8ad5bc`: 14
- `f2481b96`: 13
- `d543afe3`: 13
- `7fa518d6`: 13
- `ed90e113`: 13
- `57cf894a`: 12
- `e709de5b`: 12
- `b81a92f0`: 12
- `7abcecd3`: 12
- `688c2b55`: 12
- `1a4eb132`: 12
- `6d97a4ab`: 12
- `8ba48d34`: 12


## 13B. Cross-input collapse analysis

- Flags: 1000 (suspicious=888, expected=112)

### gym — suspicious

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `55eba719`
- Input A: `gym||Advanced||1||5||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||5||Athletic performance||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `55eba719`
- Input A: `gym||Advanced||1||5||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||5||Athletic performance||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `55eba719`
- Input A: `gym||Advanced||1||5||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||5||Athletic performance||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `55eba719`
- Input A: `gym||Advanced||1||5||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||5||Athletic performance||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `021841d3`
- Input A: `gym||Beginner||2||5||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||5||General fitness||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `021841d3`
- Input A: `gym||Beginner||2||5||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||5||General fitness||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `021841d3`
- Input A: `gym||Beginner||2||5||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||5||General fitness||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `021841d3`
- Input A: `gym||Beginner||2||5||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||5||General fitness||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — expected

- Signature: `933996c3`
- Input A: `gym||Beginner||1||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `933996c3`
- Input A: `gym||Beginner||1||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||Improve posture||upper back||gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `933996c3`
- Input A: `gym||Beginner||1||4||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||Improve posture||||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `933996c3`
- Input A: `gym||Beginner||1||4||Improve posture||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||Improve posture||upper back||gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — suspicious

- Signature: `e50dcd7a`
- Input A: `gym||Advanced||2||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||2||4||Improve posture||||dumbbells,gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `e50dcd7a`
- Input A: `gym||Advanced||2||4||Improve posture||||dumbbells,gym|bandSetup:none||goblet-squat`
- Input B: `gym||Advanced||2||4||Improve posture||||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (personal blocks) collapse to identical semantic signature.

### gym — suspicious

- Signature: `2587f2b6`
- Input A: `gym||Beginner||3||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||3||4||Improve posture||shoulders||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `2587f2b6`
- Input A: `gym||Beginner||3||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||3||4||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `2587f2b6`
- Input A: `gym||Beginner||3||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||3||4||General fitness||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — suspicious

- Signature: `2587f2b6`
- Input A: `gym||Beginner||3||4||Improve posture||shoulders||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||3||4||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — suspicious

- Signature: `2587f2b6`
- Input A: `gym||Beginner||3||4||Improve posture||shoulders||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||3||4||General fitness||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — suspicious

- Signature: `e3c4a7e0`
- Input A: `gym||Intermediate||3||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||3||4||Improve posture||shoulders||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `36a56316`
- Input A: `gym||Advanced||3||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||3||4||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — suspicious

- Signature: `36a56316`
- Input A: `gym||Advanced||3||4||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||3||4||Improve posture||shoulders||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — suspicious

- Signature: `36a56316`
- Input A: `gym||Advanced||3||4||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||3||4||Improve posture||shoulders||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `3e08599f`
- Input A: `gym||Beginner||1||5||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — expected

- Signature: `3e08599f`
- Input A: `gym||Beginner||1||5||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||Improve posture||upper back||gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

### gym — suspicious

- Signature: `3e08599f`
- Input A: `gym||Beginner||1||5||Improve posture||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||Improve posture||upper back||gym|bandSetup:none||goblet-squat`
- Explanation: Materially different structural inputs (pain changes, personal blocks) collapse to identical semantic signature.

### gym — expected

- Signature: `3e08599f`
- Input A: `gym||Beginner||1||5||Improve posture||upper back||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||Improve posture||||dumbbells,gym|bandSetup:none||blocks:none`
- Explanation: Materially different structural inputs (pain changes) collapse to identical semantic signature.

_…960 additional flags in JSON._

## 13C. Mutation testing

- Detected: **14/14**
- False PASS: **0**
- Acceptance: **PASS**

- #1 cable exercise in dumbbell-only: detected=true expected=DUMBBELL_ILLEGAL_EQUIPMENT|ILLEGAL actual=DUMBBELL_ILLEGAL_EQUIPMENT,DUMBBELL_UNCONFIRMED_SUPPORT canonicalMetadata=true
- #2 high-anchor exercise in no-anchor bands: detected=true expected=BAND_UNCONFIRMED_ANCHOR|BAND_FALSE_VERTICAL actual=BAND_UNCONFIRMED_ANCHOR,BAND_FALSE_VERTICAL_PULL canonicalMetadata=true
- #3 long-band exercise in loop-only: detected=true expected=BAND_LOOP_ONLY_LONG_BAND actual=BAND_LOOP_ONLY_LONG_BAND_EXERCISE canonicalMetadata=true
- #4 gym machine in mixed home: detected=true expected=MIXED_HOME_ILLEGAL_EQUIPMENT|ILLEGAL actual=MIXED_HOME_ILLEGAL_EQUIPMENT,MIXED_HOME_ILLEGAL_EQUIPMENT canonicalMetadata=true
- #5 unsupported chair/bench in bodyweight: detected=true expected=BODYWEIGHT_UNCONFIRMED_SUPPORT actual=BODYWEIGHT_UNCONFIRMED_SUPPORT,BODYWEIGHT_MISSING_SQUAT canonicalMetadata=true
- #6 pullover falsely occupying true vertical pull: detected=true expected=GYM_VERTICAL_PULL_SURROGATE|FALSE_VERTICAL actual=GYM_VERTICAL_PULL_SURROGATE canonicalMetadata=true
- #7 preparation drill replacing a main hinge: detected=true expected=PREP_AS_MAIN|DUMBBELL_PREP_AS_MAIN actual=DUMBBELL_PREP_AS_MAIN canonicalMetadata=true
- #8 curl replacing a primary hinge: detected=true expected=CURL_ONLY_HINGE|GYM_HINGE_SATISFIED_BY_CURL actual=GYM_HINGE_SATISFIED_BY_CURL_ONLY canonicalMetadata=true
- #9 personally blocked exercise reinserted: detected=true expected=QUALITY_BLOCKED_EXERCISE_PRESENT actual=QUALITY_BLOCKED_EXERCISE_PRESENT,QUALITY_BLOCKED_EXERCISE_PRESENT,QUALITY_BLOCKED_EXERCISE_PRESENT,QUALITY_BLOCKED_EXERCISE_PRESENT canonicalMetadata=true
- #10 required coaching removed: detected=true expected=QUALITY_UNRESOLVABLE_EXERCISE_ID|COACHING_MISSING actual=QUALITY_UNRESOLVABLE_EXERCISE_ID canonicalMetadata=true
- #11 bodyweight program given a gym title: detected=true expected=BODYWEIGHT_GYM_TEMPLATE_INHERITANCE|DAY_IDENTITY actual=BODYWEIGHT_GYM_TEMPLATE_INHERITANCE,BODYWEIGHT_GYM_TEMPLATE_INHERITANCE,BODYWEIGHT_GYM_TEMPLATE_INHERITANCE,BODYWEIGHT_DAY_IDENTITY_MISMATCH,BODYWEIGHT_DAY_IDENTITY_MISMATCH,BODYWEIGHT_DAY_IDENTITY_MISMATCH canonicalMetadata=true
- #12 nondeterministic order mutation: detected=true expected=QUALITY_NONDETERMINISTIC_REPEAT actual=QUALITY_NONDETERMINISTIC_REPEAT canonicalMetadata=true
- #13 invalid progression reference: detected=true expected=QUALITY_INVALID_PROGRESSION_REFERENCE actual=QUALITY_INVALID_PROGRESSION_REFERENCE canonicalMetadata=true
- #14 wrong primary equipment identity: detected=true expected=DUMBBELL_GYM_TEMPLATE_INHERITANCE|IDENTITY actual=DUMBBELL_GYM_TEMPLATE_INHERITANCE,DUMBBELL_GYM_TEMPLATE_INHERITANCE,DUMBBELL_GYM_TEMPLATE_INHERITANCE,DUMBBELL_DAY_IDENTITY_MISMATCH,DUMBBELL_DAY_IDENTITY_MISMATCH,DUMBBELL_DAY_IDENTITY_MISMATCH canonicalMetadata=true

## 13D. Metamorphic tests

- Passed: **9/9**

- PASS — add shoulder pain → overhead demand must not increase (overhead before=2 after=1)
- PASS — remove high anchor → high-anchor exercises disappear (remaining high-anchor ids: none)
- PASS — change long band to loop-only → long-band exercises disappear (remaining long-band ids: none)
- PASS — block selected squat → blocked squat disappears while squat purpose remains when possible (blockedPresent=false squatPurpose=true)
- PASS — block selected hinge → blocked hinge disappears while hinge purpose remains when possible (blockedPresent=false hingePurpose=true)
- PASS — change dumbbells to bodyweight → equipment identity and legality change (beforeDb=true afterDb=false afterMode=bodyweight)
- PASS — increase experience → complexity may increase but equipment/role truth remain stable (beginnerHard=0 advancedHard=0)
- PASS — advance phase → progression changes without arbitrary identity collapse (dayIdentityStable=true exerciseChanged=true)
- PASS — lower photo confidence → unsupported presentation rationale disappears (highClaim=true lowClaim=false)

## 13E. Holdout seeds

- Namespace: `fuzz-integrity-holdout-v1`
- Cases per mode: 40

- gym: semanticSignatures=40 recoveryRate=2.50% fallbackRate=2.50% exceptions=0 deterministicMismatches=0
- dumbbells: semanticSignatures=40 recoveryRate=5.00% fallbackRate=5.00% exceptions=0 deterministicMismatches=0
- bands: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0
- bodyweight: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0
- mixedHome: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0

## 13F. Reproducible blind sample

- Blind samples: 50 (10×5 modes)
- Fallback samples (all): 288
- See `docs/dev-reports/program-quality-v2-fuzz-integrity-samples.md` and JSON companion.

## 13G. Review thresholds / NEEDS_REVIEW

- `FALLBACK_RATE_ABOVE_1PCT`: dumbbells fallbackRate=1.33%
- `FALLBACK_RATE_ABOVE_1PCT`: mixedHome fallbackRate=1.34%
- `UNEXPLAINED_CROSS_INPUT_COLLAPSE`: 888 suspicious collapse pairs

## Artifact paths

- docs/dev-reports/program-quality-v2-fuzz-integrity.md
- docs/dev-reports/program-quality-v2-fuzz-integrity.json
- docs/dev-reports/program-quality-v2-fuzz-integrity-samples.md
- docs/dev-reports/program-quality-v2-fuzz-integrity-samples.json
