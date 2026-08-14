import type { SessionSection } from "../../domain/session";
import type { EvidenceProvenance, ISODateTimeString } from "../../prescription/types";

export interface FinalSessionSequencingPolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export type FinalSessionSequencingPolicyRuleKind =
  | "hard_invariant"
  | "section_precedence"
  | "section_order"
  | "interference"
  | "setup_preference"
  | "transition_timing"
  | "execution_mode";

export interface FinalSessionSequencingPolicyRule {
  readonly ruleId: string;
  readonly kind: FinalSessionSequencingPolicyRuleKind;
  readonly authority: "hard" | "lexicographic" | "late_preference";
  readonly section: SessionSection | "all";
  readonly priority: number;
  readonly value: string;
  readonly provenance: EvidenceProvenance;
}

export interface FinalSessionSequencingPolicyConflict {
  readonly conflictId: string;
  readonly leftRuleId: string;
  readonly rightRuleId: string;
  readonly authority: "equal" | "ordered";
  readonly resolution: "unresolved" | "left_overrides" | "right_overrides";
  readonly provenance: EvidenceProvenance;
}

export interface ProductionFinalSessionSequencingPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly state: "reviewed_not_activated";
  readonly reviewer: string;
  readonly reviewedAt: ISODateTimeString;
  readonly philosophy: readonly string[];
  readonly sectionPrecedence: readonly SessionSection[];
  readonly executionMode: "SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY";
  readonly pairingDisposition: "SESSION_PAIRING_AND_SUPERSET_POLICY_REVIEW";
  readonly pairingPermitted: false;
  readonly evaluationOrder: readonly string[];
  readonly rules: readonly FinalSessionSequencingPolicyRule[];
  readonly conflicts: readonly FinalSessionSequencingPolicyConflict[];
  readonly setupPolicy: {
    readonly relationshipIsDuration: false;
    readonly preference: "late_lexicographic_only";
  };
  readonly interferencePolicy: {
    readonly additiveScorePermitted: false;
    readonly potentialIsHardRejection: false;
    readonly preference: "after_purpose_and_priority";
  };
  readonly timingPolicy: {
    readonly inventedTimePermitted: false;
    readonly absentSetupDuration: "unknown";
    readonly absentRecovery: "not_prescribed";
    readonly absentSectionBoundaryDuration: "unknown";
  };
  readonly provenance: EvidenceProvenance;
  readonly activationAuthorized: false;
}

export type ExplicitFinalSessionSequencingPolicyInput =
  | ProductionFinalSessionSequencingPolicy
  | FinalSessionSequencingPolicyReference
  | null;

export interface FinalSessionSequencingPolicyResolution {
  readonly status:
    | "resolved"
    | "sequencing_policy_required"
    | "sequencing_policy_unavailable"
    | "sequencing_policy_conflict";
  readonly policy: ProductionFinalSessionSequencingPolicy | null;
  readonly trace: readonly string[];
}
