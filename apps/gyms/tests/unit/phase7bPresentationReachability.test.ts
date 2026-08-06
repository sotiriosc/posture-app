/**
 * Phase 7B — Minimal gyms reachability for blocks + plain feedback labels.
 * Source-level guards avoid heavy SessionClient mounts.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FEEDBACK_CONTRACT_ACTION_LABELS } from "@/lib/program/presentation";

const root = path.resolve(__dirname, "../..");

const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("Phase 7B gyms presentation reachability", () => {
  it("SessionClient exposes block actions and plain-language contract labels", () => {
    const src = read("src/app/session/SessionClient.tsx");
    expect(src).toContain("Remove from my program");
    expect(src).toContain("Block until I reset");
    expect(src).toContain("FEEDBACK_CONTRACT_ACTION_LABELS");
    expect(src).toContain("resolveNoValidSwapMessage");
    expect(src).toContain("resolveProgramPresentation");
    expect(src).toContain("blockedExerciseIds: prefs?.blockedExerciseIds");
    // Raw button labels must not hardcode internal enum words.
    expect(src).not.toMatch(/>\s*Sacrifice\s*</);
    expect(src).not.toMatch(/>\s*Modify\s*</);
  });

  it("settings page can unblock / reset blockedExerciseIds", () => {
    const src = read("src/app/settings/page.tsx");
    expect(src).toContain("Blocked exercises");
    expect(src).toContain("blockedExerciseIds");
    expect(src).toMatch(/Unblock|Reset/);
  });

  it("engine plain labels remain non-internal", () => {
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.sacrifice.label).toBe("Skip for now");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.test.label).toBe("Try again");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.modify.label).toBe("Make it easier");
  });
});
