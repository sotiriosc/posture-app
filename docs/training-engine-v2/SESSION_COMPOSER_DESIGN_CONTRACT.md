# Session Composer Design Contract

Overall classification: `TARGETED_DESIGN_DECISIONS_REQUIRED`.

Binding flow: Session purpose -> normalized SessionNeed[] -> precomputed Candidate Intelligence pools -> whole-session composition -> non-prescribed assignments. Sections remain semantic and ordered but optional. Ordinary sessions require at least one dominant main need.

Planner owns why the session exists, need priority, weekly allocation, availability, and neighboring-session context. Candidate Intelligence owns exact legal candidates and local evidence. Composer owns coexistence, shared coverage, section assignment, marginal value, continuity, dependencies, redundancy, potential concentration, and structural feasibility. Sequencing owns exact within-section order. Prescription owns realized dose and stress. Week Composer owns frequency and volume.

The design-only contracts are not in the package public API. The lab is a test helper; it is not production `composeSession` wiring.

| Area | Classification |
| --- | --- |
| needs-first intent | DESIGN_READY |
| Candidate Intelligence seam | CANDIDATE_INTELLIGENCE_DEPENDENCY_COMPLETE |
| section assignment | DESIGN_READY |
| exact within-section order | DEFER_TO_SEQUENCE |
| dose and duration | DEFER_TO_PRESCRIPTION |
| weekly volume/frequency | DEFER_TO_WEEK_COMPOSER |
| response-led replacement | DEFER_TO_LONGITUDINAL_ADAPTATION |
| production optimizer choice | OWNER_POLICY_REQUIRED |
| authoritative domain migration | DOMAIN_CHANGE_REQUIRED |
| UI/Knowledge/Library | OUT_OF_SCOPE |

## Production Invariance

| Behavior | Fingerprint |
| --- | --- |
| ranking | d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7 |
| comprehensive | 1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e |
| catalog | bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91 |
| knowledgeCompatibility | e31f864adaa0707a22bfb92d172fc596476acc923fe023cedf3abfd3ece8ac73 |

- currentSessionSeamAudit: `1dd78231c27b943a3b9f5a0a799f66c799494c2f4acf8d1551f9e8b3376724b8`
- proposedSessionNeedContract: `95745d5370853119fbc4444961bdd4730ad287f5012efe98b4e643539bf12975`
- proposedSessionIntentContract: `34394bb04ffed4592ff8b163fd0b30c7b3371d31b6a445afcd2528f3357e2398`
- proposedCompositionOutput: `9de49e0fbc1e5127aadf89e5954f3baba525efbaf9a9f1627788d23be6d8bdf2`
- hardValidityPolicy: `bce20175557ab604f2c0c902717026bd32594422c873422c395add7af7a7e83e`
- lexicographicEvaluationVector: `de123f6810b4158f63bfcc2f327dc57dc1bb161d5173bc6e240e9702a5fef8f6`
- marginalValuePolicy: `da2fbf6348adb09f5b6e4b6eac8089c683b990ea97e0a1e1ddc600c7e7e51380`
- redundancyPolicy: `2af7913d68365be959b58f95ef1f2009e5a122424e1dd852527e16291d79fe51`
- continuityPolicy: `29cb723d45ae41cd5f820460c8d2ebb2c447f1f6fb4f3da6a90186863f50e26d`
- dependencyModel: `d18d585b3470897a66f1f278bf32af601fff9f14e112e2910709da9bddde329b`
- timeBudgetOwnership: `aec2e97cf1d3ddd218bd0e2ece6482145a304aa9257add4521f252621f2b0180`
- searchComparison: `13ffe19e4b7fe3a9b48455fbb12c20997862d3e568adebed47e7f4f56b1a50d1`
- greedyFailureMatrix: `ae9ea0ef6b3991ec37897745b3d1c28fd7440dd1088ddf37329b6ccdd1282c3e`
- fixedShellPersonalizationMatrix: `e3eeddb3911b070da1374c3f71df883d62560748af10e94acc1969faf53be764`
- controlledSessionScenarios: `e03f2c7e12698d001a7c71c48b50f03ba0902a762ee2d7ffc11fbab58963fccc`
- implementationReadinessReview: `8aa4ed561a44ea7b6cfb99aaee7d8a49353b20d6f8a979fd78cf910464a875da`
- combinedSessionComposerDesign: `71f4f8b00d38fc2628e6bfec08a73a82a7d76142fadf83bbedddc4ee72b5abe5`
