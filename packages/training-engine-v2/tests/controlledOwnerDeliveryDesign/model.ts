import { DELIVERY_MODES, type DeliveryMode } from "./contracts";

export type NormalizedIdentity =
  | { readonly state: "valid"; readonly normalized: string }
  | { readonly state: "absent" | "invalid" | "multiple_or_wildcard"; readonly normalized: null };

const EMAIL_PATTERN = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

export function normalizeConfiguredOwnerIdentity(value: string | null | undefined): NormalizedIdentity {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (!normalized) return Object.freeze({ state: "absent", normalized: null });
  if (normalized.includes(",") || normalized.includes("*") || normalized.split("@").length !== 2) {
    return Object.freeze({ state: "multiple_or_wildcard", normalized: null });
  }
  if (!EMAIL_PATTERN.test(normalized)) {
    return Object.freeze({ state: "invalid", normalized: null });
  }
  return Object.freeze({ state: "valid", normalized });
}
export function parseOwnerDeliveryMode(value: string | null | undefined): DeliveryMode {
  const normalized = value?.trim().toLowerCase();
  return DELIVERY_MODES.includes(normalized as DeliveryMode) ? normalized as DeliveryMode : "off";
}

export type EligibilityInput = {
  readonly configuredIdentity: string | null;
  readonly session: { readonly id: string; readonly email: string } | null;
  readonly resolvedUser: { readonly id: string; readonly email: string; readonly valid: boolean } | null;
  readonly mode: string | null;
};

export function evaluateOwnerEligibility(input: EligibilityInput) {
  const identity = normalizeConfiguredOwnerIdentity(input.configuredIdentity);
  const mode = parseOwnerDeliveryMode(input.mode);
  if (mode === "off") return Object.freeze({ eligible: false, mode, reason: "DELIVERY_MODE_OFF" });
  if (identity.state !== "valid") {
    return Object.freeze({ eligible: false, mode, reason: "CONFIGURED_IDENTITY_INVALID" });
  }
  if (!input.session) return Object.freeze({ eligible: false, mode, reason: "AUTHENTICATED_SESSION_REQUIRED" });
  if (!input.resolvedUser || !input.resolvedUser.valid) {
    return Object.freeze({ eligible: false, mode, reason: "CONFIGURED_OWNER_NOT_RESOLVED" });
  }
  const sessionEmail = input.session.email.trim().toLowerCase();
  const storedEmail = input.resolvedUser.email.trim().toLowerCase();
  if (input.session.id !== input.resolvedUser.id) {
    return Object.freeze({ eligible: false, mode, reason: "SESSION_STORED_USER_ID_MISMATCH" });
  }
  if (sessionEmail !== storedEmail || storedEmail !== identity.normalized) {
    return Object.freeze({ eligible: false, mode, reason: "OWNER_EMAIL_REFERENCE_MISMATCH" });
  }
  return Object.freeze({ eligible: true, mode, reason: "EXACT_CONFIGURED_OWNER_MATCH" });
}

export type ProfileReadinessInput = {
  readonly daysPerWeek: number | null;
  readonly opportunities: number;
  readonly minutesState: "known" | "explicitly_unknown" | "missing";
  readonly equipmentConfirmed: boolean;
  readonly requiredCapabilitiesConfirmed: boolean;
  readonly painContextConfirmed: boolean;
  readonly experienceConfirmed: boolean;
  readonly safety: "clear" | "blocked" | "unknown";
};

export function evaluateProfileReadiness(input: ProfileReadinessInput) {
  if (input.safety === "blocked") return "blocked_training_safety" as const;
  if (!input.daysPerWeek || input.opportunities < input.daysPerWeek || input.minutesState === "missing" ||
      !input.painContextConfirmed || !input.experienceConfirmed) {
    return "blocked_profile_incomplete" as const;
  }
  if (!input.equipmentConfirmed || !input.requiredCapabilitiesConfirmed) {
    return "blocked_equipment" as const;
  }
  if (input.safety === "unknown") return "blocked_profile_incomplete" as const;
  return "ready_for_review" as const;
}

export function applicationPermitted(input: {
  readonly mode: DeliveryMode;
  readonly enrolledApply: boolean;
  readonly previewState: string;
  readonly previewCurrent: boolean;
  readonly approved: boolean;
  readonly csrfValid: boolean;
  readonly idempotencyKey: string | null;
  readonly activeSessionConflict: boolean;
}) {
  if (input.mode !== "apply") return "APPLICATION_MODE_REQUIRED" as const;
  if (!input.enrolledApply) return "APPLY_ENROLLMENT_REQUIRED" as const;
  if (input.previewState !== "ready_for_review" || !input.previewCurrent) return "CURRENT_PREVIEW_REQUIRED" as const;
  if (!input.approved) return "EXACT_APPROVAL_REQUIRED" as const;
  if (!input.csrfValid) return "CSRF_VALIDATION_REQUIRED" as const;
  if (!input.idempotencyKey) return "IDEMPOTENCY_KEY_REQUIRED" as const;
  if (input.activeSessionConflict) return "ACTIVE_SESSION_CONFLICT" as const;
  return "APPLICATION_PERMITTED" as const;
}
