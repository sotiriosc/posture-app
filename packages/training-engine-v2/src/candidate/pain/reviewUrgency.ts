import type {
  ModeratePain,
  ModeratePainReviewUrgency,
} from "../../domain/painInjury";

export function reviewUrgencyForModeratePain(
  severity: ModeratePain["severity0To10"],
): ModeratePainReviewUrgency {
  return severity <= 4
    ? "standard_moderate_review"
    : "elevated_moderate_review_non_hard";
}
