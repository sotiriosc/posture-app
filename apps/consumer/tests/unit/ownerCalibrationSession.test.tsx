// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));

import OwnerV2SessionClient from
  "@/app/account/praxis-v2/session/[attemptId]/OwnerV2SessionClient";

const exercises = [{
  assignmentId: "assignment:developmental-internal",
  exerciseId: "goblet-squat",
  name: "Goblet squat",
  summary: "Controlled squat pattern.",
  coachingFocus: ["Keep a comfortable range."],
  sourceEventId: "source-event:developmental-internal",
  blockIds: ["block:developmental-internal"],
  dose: "2 sets · 5-10 reps",
  calibrationObligation: { obligationId: "obligation:internal", doseBlockId: "block:internal",
    requiredSetCount: 2 },
}, {
  assignmentId: "assignment:preparation-internal",
  exerciseId: "dead-bug",
  name: "Dead bug",
  summary: "Low-fatigue preparation.",
  coachingFocus: ["Move with control."],
  sourceEventId: "source-event:preparation-internal",
  blockIds: ["block:preparation-internal"],
  dose: "1 set · 4-8 reps",
  calibrationObligation: null,
}] as const;

const options = [{ mode: "full", availability: { state: "available", reasonCodes: [] } },
  { mode: "lighter", availability: { state: "policy_required",
    reasonCodes: ["OWNER_CALIBRATION_FULL_SESSION_REQUIRED"] } },
  { mode: "recovery", availability: { state: "policy_required",
    reasonCodes: ["OWNER_CALIBRATION_FULL_SESSION_REQUIRED"] } }] as const;

function renderSession(input: { readonly completed?: boolean; readonly recoveryPending?: boolean } = {}) {
  return render(<OwnerV2SessionClient applicationId="application:internal" attemptId="attempt:internal"
    persistenceRevisionId="persistence-revision:internal" selectedMode="full"
    lifecycleState={input.completed ? "completed" : "final_for_execution"}
    completedStatus={input.completed ? "full_completed_as_prescribed" : null}
    exercises={exercises} options={options} initialPerformance={{}}
    calibration={{ cycleId: "cycle:internal", sessionId: "session:internal",
      state: input.completed ? "calibration_evidence_incomplete" : "calibration_evidence_incomplete",
      recoveryPending: input.recoveryPending ?? false }} csrf="csrf-fixture" />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("controlled owner calibration session results", () => {
  it("renders accessible set actuals and keeps internal lineage out of the primary flow", async () => {
    const { container } = renderSession();

    expect(screen.getAllByRole("spinbutton", { name: "Actual repetitions" })).toHaveLength(2);
    expect(screen.getAllByRole("combobox", { name: "Load unit" })).toHaveLength(2);
    expect(screen.getAllByRole("spinbutton", { name: "Actual load" })).toHaveLength(2);
    expect(screen.getAllByRole("combobox", { name: "Effort scale" })).toHaveLength(2);
    expect(screen.getAllByRole("option", { name: "RIR" })).toHaveLength(2);
    expect(screen.getAllByRole("option", { name: "RPE" })).toHaveLength(2);
    expect(screen.getAllByRole("combobox", { name: "Technique / control" })).toHaveLength(2);
    expect(screen.getAllByRole("combobox", { name: "Pain / discomfort" })).toHaveLength(2);
    expect(screen.getAllByRole("checkbox", {
      name: "No external load applied (bodyweight or unloaded)",
    })).toHaveLength(2);
    expect(screen.getByRole("spinbutton", { name: "Overall difficulty (1-10)" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Session notes (context only)" })).toBeTruthy();
    expect((screen.getByRole("button", { name: "Lighter" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Recovery" }) as HTMLButtonElement).disabled).toBe(true);
    expect(container.textContent).not.toContain("obligation:internal");
    expect(container.textContent).not.toContain("persistence-revision:internal");

    fireEvent.click(screen.getByRole("button", { name: "Complete session" }));
    await waitFor(() => expect(screen.getByText(
      "Record every required set, response, and exercise completion before finishing.",
    )).toBeTruthy());
  });

  it("keeps recovery separate and makes no automatic Program action available", () => {
    renderSession({ completed: true, recoveryPending: true });

    expect(screen.getByRole("heading", { name: "Recovery check-in" })).toBeTruthy();
    expect(screen.getByText(/No waiting period or recovery result is assumed/)).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Current recovery" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Sleep" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Record recovery" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /progress|replace|apply/i })).toBeNull();
  });
});
