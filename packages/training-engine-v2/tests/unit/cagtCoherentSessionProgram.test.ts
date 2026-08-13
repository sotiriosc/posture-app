import { describe, expect, it } from "vitest";
import { runCoherentSessionMatrix } from "../cagt/coherentSessionProgram";

const result = (fragment: string) => runCoherentSessionMatrix().find((entry) => entry.scenarioId.includes(fragment))!;

describe("CAGT coherent session program", () => {
  it("accepts truthful empty or dependency-owned preparation and activation", () => {
    const matrix = runCoherentSessionMatrix();
    expect(matrix).toHaveLength(38);
    expect(matrix.filter((entry) => entry.result === "FAIL")).toEqual([]);
    expect(result("ordinary-empty-preparation")).toEqual(expect.objectContaining({
      result: "PASS", warmupIds: [], activationIds: [] }));
    expect(result("movement-rehearsal-dependency").warmupIds).toEqual(["bodyweight-hip-hinge-rehearsal"]);
    expect(result("control-activation-dependency").activationIds).toEqual(["serratus-wall-slide"]);
    expect(result("single-leg-preparation-truth").warmupIds).toEqual(["single-leg-balance-rehearsal"]);
    expect(matrix.every((entry) => entry.sequencingGraphAcyclic)).toBe(true);
  });

  it("retains required preparation under condensation and revalidates final main selection", () => {
    expect(result("condensed-required-retained")).toEqual(expect.objectContaining({ result: "PASS",
      warmupIds: ["bodyweight-hip-hinge-rehearsal"], activationIds: [] }));
    expect(result("required-dependency-unavailable").result).toBe("EXPECTED_INFEASIBLE");
    expect(result("equipment-main-change-revalidated").result).toBe("PASS");
    expect(result("pain-main-change-revalidated").result).toBe("PASS");
    expect(result("p0-rows-no-stack")).toEqual(expect.objectContaining({ result: "PASS",
      warmupIds: [], activationIds: [] }));
  });

  it("rejects stale, orphaned, generic, duplicate, multiplied, dose-credit and rescue mutations", () => {
    for (const code of ["generic-warmup-mutation", "generic-activation-mutation", "stale-preparation-mutation",
      "orphan-activation-mutation", "duplicate-identity-mutation", "assessment-multiplication-mutation",
      "dose-credit-mutation", "downstream-rescue-mutation", "unrelated-generic-recurrence"]) {
      expect(result(code).result).toBe("EXPECTED_MUTATION_REJECTED");
    }
  });

  it("classifies warm-up and activation recurrence in separate observed lanes", () => {
    const matrix = runCoherentSessionMatrix();
    expect([...new Set(matrix.filter((entry) => entry.recurrenceLane === "warmup")
      .map((entry) => entry.recurrence))].sort()).toEqual([
      "GENERIC_FILLER", "PRODUCTIVE_PREPARATION_CONTINUITY", "REQUIRED_DEPENDENCY_RECURRENCE", "STALE_RECURRENCE",
    ]);
    expect([...new Set(matrix.filter((entry) => entry.recurrenceLane === "activation")
      .map((entry) => entry.recurrence))].sort()).toEqual([
      "ASSESSMENT_OVERREPETITION", "EXPECTED_SHARED_PREPARATION", "GENERIC_FILLER",
      "JUSTIFIED_MULTI_SESSION_DEPENDENCY", "OPTIONAL_REDUNDANCY", "UNKNOWN_REQUIRES_REVIEW",
    ]);
  });
});
