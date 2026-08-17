import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { OWNER_DELIVERY_STATES, REFERENCE_EXERCISES } from
  "@praxis/training-engine-v2";
import { CONTROLLED_OWNER_OBSERVABILITY_EVENTS, buildControlledOwnerObservabilityEvent } from
  "../../src/controlledOwnerDelivery";
import { FIXED_SHELL_COHORT_COUNTS, METAMORPHIC_CASES, MUTATIONS,
  buildControlledOwnerEvidenceManifests, validateEvidenceManifests } from
  "../controlledOwnerDeliveryEvidence/evidence";

describe("controlled owner delivery hardening evidence", () => {
  it("locks controlled scenarios, fixed cohorts, and the 1,350-case holdout", () => {
    const evidence = validateEvidenceManifests();
    expect(evidence).toMatchObject({ controlledScenarioCount: 900, fixedShellCohortCount: 1140,
      holdoutCount: 1350, stateCount: 23, exerciseCount: 64, validTransitionEvidence: true });
    expect(OWNER_DELIVERY_STATES).toHaveLength(23);
    expect(REFERENCE_EXERCISES).toHaveLength(64);
    expect(FIXED_SHELL_COHORT_COUNTS).toEqual({ identity_mode: 160, enrollment_profile: 140,
      generation_preview: 140, approval_application: 140, owner_week_session: 140,
      practice_outcome: 120, rollback_kill_switch: 100, security_privacy: 100,
      ordinary_route_invariance: 100 });
  });

  it("rejects every semantic mutation without downstream rescue", () => {
    expect(MUTATIONS.length).toBeGreaterThanOrEqual(60);
    expect(MUTATIONS.every((entry) => entry.semanticChange && entry.result === "REJECTED")).toBe(true);
    expect(METAMORPHIC_CASES).toHaveLength(25);
    expect(METAMORPHIC_CASES.every((entry) => entry.result === "PASS")).toBe(true);
    expect(buildControlledOwnerEvidenceManifests().mutations.acceptedDownstreamRescueCount).toBe(0);
  });

  it("exposes only the bounded telemetry schema and all required event families", () => {
    expect(CONTROLLED_OWNER_OBSERVABILITY_EVENTS).toEqual(expect.arrayContaining([
      "eligibility_result", "enrollment_revision", "profile_revision", "generation_started",
      "generation_result", "preview_readiness", "approval", "application", "active_pointer",
      "route_read", "session_attempt", "practice_mode", "persistence_conflict", "replay_failure",
      "completion", "rollback", "kill_switch",
    ]));
    const event = buildControlledOwnerObservabilityEvent({ name: "completion",
      occurredAt: "2026-08-17T20:00:00.000Z", userId: "synthetic-owner", recordId: "attempt-1",
      contractVersion: "1.0.0", mode: "apply", state: "completed", reasonCodes: ["B", "A", "A"],
      latencyMs: 12, fingerprint: "synthetic-fingerprint", appSurface: "owner_session" });
    expect(Object.keys(event).sort()).toEqual(["appSurface", "contractVersion", "fingerprint", "latencyMs",
      "mode", "name", "occurredAt", "reasonCodes", "recordId", "state", "userId"]);
    expect(event.reasonCodes).toEqual(["A", "B"]);
    expect(JSON.stringify(event)).not.toMatch(/email|password|token|notes|photo|pain|cue|snapshot/i);
  });

  it("locks the responsive and accessibility owner-surface contract", () => {
    expect(buildControlledOwnerEvidenceManifests().routeApi).toMatchObject({
      responsiveViewports: [320, 360, 390, 768, 1024], accessibility: { semanticHeadings: true,
        labelledControls: true, liveStatusRegions: true, minimumControlHeightPx: 44,
        keyboardNativeControls: true },
    });
  });

  it("has no Product Shadow runtime dependency or legacy generator call", () => {
    const generation = readFileSync(resolve(process.cwd(), "src/controlledOwnerDelivery/generationService.ts"), "utf8");
    const ownerIndex = readFileSync(resolve(process.cwd(), "src/controlledOwnerDelivery/index.ts"), "utf8");
    expect(generation).not.toMatch(/controlledProductShadow|generateProgram\s*\(/);
    expect(ownerIndex).not.toMatch(/controlledProductShadow/);
  });
});
