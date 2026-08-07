# Program Quality V2 — Fuzz-Integrity Assessment (Phase 7B §13)

- Generated: 2026-08-07T01:32:02.332Z
- Mode: **release**
- Cases per mode: **10000** (release requires exactly **10000**)
- Elapsed: 6360426ms
- Verdict: **NEEDS_REVIEW**

Release run (10000/mode).

## Final quality outcomes

### gym

- Total cases: 10000
- Initial quality pass: 9991
- Recovery attempted / succeeded: 9 / 9
- Fallback attempted / succeeded: 0 / 0
- Final quality pass / fail: 10000 / 0
- Safe generation error: 0
- Exceptions: 0
- Unclassified: 0
- Final pass rate / failure rate: 100.00% / 0.00%
- Fallback triage: passed=0 failedSafely=0 malformed=0

### dumbbells

- Total cases: 10000
- Initial quality pass: 10000
- Recovery attempted / succeeded: 0 / 0
- Fallback attempted / succeeded: 0 / 0
- Final quality pass / fail: 10000 / 0
- Safe generation error: 0
- Exceptions: 0
- Unclassified: 0
- Final pass rate / failure rate: 100.00% / 0.00%
- Fallback triage: passed=0 failedSafely=0 malformed=0

### bands

- Total cases: 10000
- Initial quality pass: 10000
- Recovery attempted / succeeded: 0 / 0
- Fallback attempted / succeeded: 0 / 0
- Final quality pass / fail: 10000 / 0
- Safe generation error: 0
- Exceptions: 0
- Unclassified: 0
- Final pass rate / failure rate: 100.00% / 0.00%
- Fallback triage: passed=0 failedSafely=0 malformed=0

### bodyweight

- Total cases: 10000
- Initial quality pass: 10000
- Recovery attempted / succeeded: 0 / 0
- Fallback attempted / succeeded: 0 / 0
- Final quality pass / fail: 10000 / 0
- Safe generation error: 0
- Exceptions: 0
- Unclassified: 0
- Final pass rate / failure rate: 100.00% / 0.00%
- Fallback triage: passed=0 failedSafely=0 malformed=0

### mixedHome

- Total cases: 10000
- Initial quality pass: 9756
- Recovery attempted / succeeded: 244 / 244
- Fallback attempted / succeeded: 0 / 0
- Final quality pass / fail: 10000 / 0
- Safe generation error: 0
- Exceptions: 0
- Unclassified: 0
- Final pass rate / failure rate: 100.00% / 0.00%
- Fallback triage: passed=0 failedSafely=0 malformed=0

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

- Unique semantic program signatures: 4887
- Unique ordered weekly exercise signatures: 4696
- Unique day-identity signatures: 3
- Most common signature count/share: 28 / 0.28%
- Recovery attempts / rate: 9 / 0.09%
- Fallback uses / rate: 0 / 0.00%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `e50459e3`: 28
- `51c828a2`: 28
- `e19dca4a`: 24
- `6b6f5f74`: 24
- `e42e50bb`: 24
- `14b7de8c`: 24
- `1c0a9f3c`: 22
- `f47837d0`: 22
- `7e110b28`: 22
- `763d6f57`: 22
- `fc1e8f70`: 22
- `2088a784`: 21
- `69409f0b`: 20
- `b0807df4`: 20
- `a9315fc4`: 20
- `9c6f7d11`: 18
- `b516e5d3`: 16
- `3cadec7d`: 16
- `ba452db9`: 16
- `097b36fb`: 16


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

- Unique semantic program signatures: 4836
- Unique ordered weekly exercise signatures: 4092
- Unique day-identity signatures: 3
- Most common signature count/share: 15 / 0.15%
- Recovery attempts / rate: 0 / 0.00%
- Fallback uses / rate: 0 / 0.00%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `6bdb338b`: 15
- `798eeae6`: 15
- `52d9fb10`: 13
- `374fb825`: 12
- `7c84f27d`: 12
- `fb0d9d45`: 12
- `fdd24b75`: 12
- `0610bbb5`: 12
- `4678284c`: 11
- `560d57e4`: 11
- `527a5314`: 10
- `096be92b`: 9
- `ab0ec4ec`: 9
- `ba80025e`: 9
- `b3ffb246`: 9
- `341b913a`: 9
- `2515ae46`: 9
- `6eb2cc8a`: 9
- `07371ca0`: 9
- `0ed9db85`: 9


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

- Unique semantic program signatures: 3454
- Unique ordered weekly exercise signatures: 1857
- Unique day-identity signatures: 3
- Most common signature count/share: 26 / 0.26%
- Recovery attempts / rate: 0 / 0.00%
- Fallback uses / rate: 0 / 0.00%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `0007d13d`: 26
- `a77d1297`: 26
- `59118e77`: 26
- `ef7f0ac5`: 23
- `155632bf`: 22
- `92ec4b4a`: 21
- `9249fe84`: 21
- `15c34a3d`: 19
- `d4dc98e8`: 19
- `886cc78b`: 19
- `bd719532`: 18
- `a88acefb`: 18
- `caf6aebd`: 18
- `225daa00`: 18
- `47f25df5`: 18
- `7c87e733`: 18
- `27b2c290`: 17
- `7aefce52`: 16
- `968d74c9`: 16
- `155fd0e7`: 16


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

- Unique semantic program signatures: 4651
- Unique ordered weekly exercise signatures: 2906
- Unique day-identity signatures: 3
- Most common signature count/share: 16 / 0.16%
- Recovery attempts / rate: 0 / 0.00%
- Fallback uses / rate: 0 / 0.00%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `21d4570b`: 16
- `931a90fc`: 14
- `d499f2b3`: 14
- `34220107`: 14
- `3b33add2`: 13
- `d3861671`: 13
- `29d50ee0`: 12
- `13e5398b`: 12
- `6e969e9b`: 12
- `2e2c7284`: 12
- `912f494a`: 11
- `adfdbc92`: 11
- `1b7c000c`: 11
- `b8411819`: 11
- `7898cb43`: 11
- `a71b63da`: 11
- `30588cb0`: 11
- `fdaa1df0`: 10
- `f46b780c`: 10
- `602ac932`: 10


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

- Unique semantic program signatures: 6331
- Unique ordered weekly exercise signatures: 5227
- Unique day-identity signatures: 3
- Most common signature count/share: 12 / 0.12%
- Recovery attempts / rate: 244 / 2.44%
- Fallback uses / rate: 0 / 0.00%
- Exceptions: 0
- Deterministic mismatches: 0

Top 20 repeated semantic signatures:

- `6620831c`: 12
- `9c456c97`: 12
- `4b940906`: 12
- `b63353e7`: 10
- `699a7789`: 10
- `6af1a7bf`: 9
- `f52b9dcb`: 9
- `5cd3c946`: 9
- `a2d3a2f9`: 9
- `f3129a53`: 8
- `c2525ac5`: 8
- `a19f2458`: 8
- `d79df138`: 8
- `2f7b95ad`: 8
- `9da6e376`: 8
- `da75ed2f`: 8
- `f09b1b94`: 8
- `2d82c0bd`: 8
- `0a58282a`: 7
- `835a5f57`: 7


## 13B. Cross-input collapse analysis

- Total detected pairs: 19818
- Analyzed representative pairs: 2500
- Report display limit: 40
- Suspicious / expected (in analyzed set): 448 / 2052

### Root causes by category

- `expectedIrrelevantInput`: 12419
- `suspiciousIgnoredPainInput`: 1635
- `expectedStableTemplateIdentity`: 53
- `suspiciousIgnoredSupportAnchorInput`: 269
- `expectedCapabilityLimitation`: 5442


### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Diffs: personal blocks
- Explanation: Personal-block ID difference alone with no evidence the block was active in the unblocked baseline.

### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Diffs: goals, personal blocks
- Explanation: Structural diffs (goals, personal blocks) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Diffs: goals, personal blocks
- Explanation: Structural diffs (goals, personal blocks) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `b9770ea1`
- Input A: `gym||Beginner||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||4||General fitness||||gym|bandSetup:none||goblet-squat`
- Diffs: personal blocks
- Explanation: Personal-block ID difference alone with no evidence the block was active in the unblocked baseline.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Diffs: personal blocks
- Explanation: Personal-block ID difference alone with no evidence the block was active in the unblocked baseline.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Diffs: goals, personal blocks
- Explanation: Structural diffs (goals, personal blocks) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Diffs: goals, personal blocks
- Explanation: Structural diffs (goals, personal blocks) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Diffs: personal blocks
- Explanation: Personal-block ID difference alone with no evidence the block was active in the unblocked baseline.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Diffs: goals, personal blocks
- Explanation: Structural diffs (goals, personal blocks) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Diffs: personal blocks
- Explanation: Personal-block ID difference alone with no evidence the block was active in the unblocked baseline.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Diffs: personal blocks
- Explanation: Personal-block ID difference alone with no evidence the block was active in the unblocked baseline.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Diffs: goals, personal blocks
- Explanation: Structural diffs (goals, personal blocks) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d6361b6f`
- Input A: `gym||Intermediate||1||4||General fitness||||dumbbells,gym|bandSetup:none||bodyweight-squat`
- Input B: `gym||Intermediate||1||4||Athletic performance||||gym|bandSetup:none||band-rdl`
- Diffs: goals, personal blocks
- Explanation: Structural diffs (goals, personal blocks) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `6115bf36`
- Input A: `gym||Advanced||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `6115bf36`
- Input A: `gym||Advanced||1||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `6115bf36`
- Input A: `gym||Advanced||1||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `6115bf36`
- Input A: `gym||Advanced||1||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||1||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d4f6817a`
- Input A: `gym||Beginner||2||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d4f6817a`
- Input A: `gym||Beginner||2||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d4f6817a`
- Input A: `gym||Beginner||2||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `d4f6817a`
- Input A: `gym||Beginner||2||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||2||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `1f75f11a`
- Input A: `gym||Intermediate||2||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||2||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `1f75f11a`
- Input A: `gym||Intermediate||2||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||2||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `e28a4f2e`
- Input A: `gym||Advanced||2||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||2||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `e28a4f2e`
- Input A: `gym||Advanced||2||4||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||2||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `e28a4f2e`
- Input A: `gym||Advanced||2||4||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||2||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `e28a4f2e`
- Input A: `gym||Advanced||2||4||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Advanced||2||4||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `3e77d733`
- Input A: `gym||Beginner||1||5||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `3e77d733`
- Input A: `gym||Beginner||1||5||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `3e77d733`
- Input A: `gym||Beginner||1||5||Athletic performance||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `3e77d733`
- Input A: `gym||Beginner||1||5||Athletic performance||||dumbbells,gym|bandSetup:none||blocks:none`
- Input B: `gym||Beginner||1||5||General fitness||||dumbbells,gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

### gym — expected / expectedIrrelevantInput

- Signature: `cb8b0178`
- Input A: `gym||Intermediate||1||5||General fitness||||gym|bandSetup:none||blocks:none`
- Input B: `gym||Intermediate||1||5||Athletic performance||||gym|bandSetup:none||blocks:none`
- Diffs: goals
- Explanation: Structural diffs (goals) do not imply a material eligibility change.

_Display capped at 40; totalDetectedPairs=19818 in JSON._

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

- PASS — add shoulder pain → overhead demand must not increase (overhead before=2 after=1 compositionIdentical=false nonCompositionAdaptation=true)
- PASS — remove high anchor → high-anchor exercises disappear (remaining high-anchor ids: none)
- PASS — change long band to loop-only → long-band exercises disappear (remaining long-band ids: none)
- PASS — block selected squat → blocked squat disappears while squat purpose remains when possible (blockedId=goblet-squat blockedPresent=false squatPurpose=true capabilityLimitation=false)
- PASS — block selected hinge → blocked hinge disappears while hinge purpose remains when possible (blockedId=db-rdl blockedPresent=false hingePurpose=true capabilityLimitation=true)
- PASS — change dumbbells to bodyweight → equipment identity and legality change (beforeDb=true afterDb=false afterMode=bodyweight)
- PASS — increase experience → complexity may increase but equipment/role truth remain stable (beginnerHard=0 advancedHard=0 sets 0022222221-2022222221-2022222221-2->00223-43-43-43-43-42220223-43-43-43-43-42220223-43-43-43-43-43-43-42 rxChanged=true compositionChanged=true)
- PASS — advance phase → progression changes without arbitrary identity collapse (dayIdentityStable=true exerciseChanged=true prescriptionChanged=true (exercise composition changed across phases))
- PASS — lower photo confidence → unsupported presentation rationale disappears (highClaim=true lowClaim=false)

## 13E. Holdout seeds

- Namespace: `fuzz-integrity-holdout-v1`
- Cases per mode: 40

- gym: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0
- dumbbells: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0
- bands: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0
- bodyweight: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0
- mixedHome: semanticSignatures=40 recoveryRate=0.00% fallbackRate=0.00% exceptions=0 deterministicMismatches=0

## 13F. Reproducible blind sample

- Blind samples: 50 (10×5 modes)
- Fallback samples (all): 0
- Failed-case diagnostics: 0
- See `docs/dev-reports/program-quality-v2-fuzz-integrity-samples.md` and JSON companion.

## Gym hinge repro (db-rdl blocked)

- Seed: `gym-fuzz-9e37e786`
- Verdict: **hinge_preserved**
- Hinge remains via legal alternative: true
- Detail: unblockedHingeMains=db-rdl blockedHingeMains=machine-glute-drive wrongTruth=false outcome=initialPass

## Gate: release blockers vs NEEDS_REVIEW warnings

### Release-blocking failures

- none

### NEEDS_REVIEW warnings (not release failures when finals pass + classified)

- `UNEXPLAINED_CROSS_INPUT_COLLAPSE`: 448 suspicious collapse pairs (see categories)

## Artifact paths

- docs/dev-reports/program-quality-v2-fuzz-integrity.md
- docs/dev-reports/program-quality-v2-fuzz-integrity.json
- docs/dev-reports/program-quality-v2-fuzz-integrity-samples.md
- docs/dev-reports/program-quality-v2-fuzz-integrity-samples.json
