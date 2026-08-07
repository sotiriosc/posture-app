/**
 * Phase 7B §9 — No-valid-swap UX proof (message + required actions, no raw codes).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  containsForbiddenInternalUiLanguage,
  FEEDBACK_CONTRACT_ACTION_LABELS,
  resolveNoValidSwapMessage,
} from "@/lib/program/presentation";

const repoRoot = path.resolve(__dirname, "../../../..");

const readApp = (rel: string) =>
  readFileSync(path.join(repoRoot, rel), "utf8");

describe("Phase 7B no-valid-swap presentation", () => {
  it("no-valid-swap presentation exposes safe actions without raw codes", () => {
    const msg = resolveNoValidSwapMessage();
    expect(msg.text.length).toBeGreaterThan(20);
    expect(msg.severity).toBe("safety");
    expect(containsForbiddenInternalUiLanguage(msg.text)).toBe(false);
    expect(msg.text).not.toMatch(/QUALITY_|GYM_|reasonCode|hardFailure/i);
    expect(msg.text.toLowerCase()).not.toContain("no options");
    expect(msg.text.toLowerCase()).toMatch(/skip|stop/);

    for (const app of ["consumer", "gyms"] as const) {
      const src = readApp(`apps/${app}/src/app/session/SessionClient.tsx`);
      expect(src).toContain("resolveNoValidSwapMessage");
      expect(src).toContain("setNoValidSwapActive(true)");
      expect(src).toContain('data-testid="pain-no-valid-swap-message"');
      expect(src).toContain("Save discomfort");
      expect(src).toContain("Skip this exercise");
      expect(src).toContain("End session");
      expect(src).toContain('data-testid="pain-skip-exercise"');
      expect(src).toContain('data-testid="pain-end-session"');
      // Swap picker must not render empty option lists on no-valid-swap path.
      expect(src).not.toMatch(/No options available/i);
      // Close/back remains available.
      expect(src).toContain('data-testid="pain-report-cancel"');
      expect(src).toContain("Close");
    }

    // Contract labels stay plain-language for related pain actions.
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.sacrifice.label).toBe("Skip for now");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.test.label).toBe("Try again");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.modify.label).toBe("Make it easier");
  });
});
