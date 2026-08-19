import { describe, expect, it } from "vitest";
import { orchestrateProductionAdaptationApplication } from "../../src";
import { orchestrationDependencies, orchestrationInput } from "../helpers/applicationOrchestrationFixtures";

describe("adaptation application orchestration kernel", () => {
  it("validates only without invoking an owner", async () => {
    const result = await orchestrateProductionAdaptationApplication(orchestrationInput("keep_current", "validate_only"),
      orchestrationDependencies());
    expect(result.preconditions.satisfied).toBe(true);
    expect(result.primaryOwnerInvocationCount).toBe(0);
    expect(result.reasonCodes).toContain("VALIDATE_ONLY_COMPLETED_WITHOUT_OWNER_INVOCATION");
  });

  it("requires downstream rebuild for unresolved material work", async () => {
    const result = await orchestrateProductionAdaptationApplication(
      orchestrationInput("reopen_candidate_selection_for_replacement"), orchestrationDependencies());
    expect(result.status).toBe("pending_human_review");
    expect(result.applicationApplied).toBe(false);
  });

  it("rejects an unexplained no-op mutation", async () => {
    const dependencies = orchestrationDependencies();
    const productPort = dependencies.ownerPorts.find((port) => port.owner === "product_application")!;
    const mutatingPort = { ...productPort, invoke: async (invocation: Parameters<typeof productPort.invoke>[0]) => {
      const prior = await productPort.invoke(invocation);
      return { ...prior, changedTargetIds: ["unrelated-target"] };
    } };
    const ports = dependencies.ownerPorts.map((port) => port === productPort ? mutatingPort : port);
    const result = await orchestrateProductionAdaptationApplication(orchestrationInput(),
      orchestrationDependencies(ports));
    expect(result.status).toBe("owner_result_invalid");
    expect(result.reasonCodes).toContain("ADAPTATION_APPLICATION_OWNER_RESULT_SCOPE_EXCEEDED");
  });
});
