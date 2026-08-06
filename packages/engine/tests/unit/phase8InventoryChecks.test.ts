/**
 * Phase 8 — automated inventory / registry parity checks.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  SECTION_IDS,
  SECTION_REGISTRY,
} from "../../src/ui/sectionVisibility";
import { PHASE8_CRITICAL_CONTROL_LABELS } from "../../src/program/presentation";

const root = path.resolve(__dirname, "../../../..");
const inventoryPath = path.join(
  root,
  "docs/dev-reports/phase8-settings-visibility-inventory.json"
);

describe("Phase 8 inventory checks", () => {
  it("inventory JSON exists and classifies non-canonical items", () => {
    const raw = readFileSync(inventoryPath, "utf8");
    const inventory = JSON.parse(raw) as {
      meta: { sectionRegistryIds: string[] };
      items: Array<{
        classification: string;
        path: string;
        symbol: string;
        imports: unknown;
        route: string;
        deps: unknown;
        tests: unknown;
        scope: string;
        replacement: unknown;
        recommendedAction: string;
        confidence: string;
      }>;
      deferredFindings: unknown[];
    };

    expect(inventory.meta.sectionRegistryIds).toEqual(SECTION_IDS);
    expect(inventory.deferredFindings.length).toBeGreaterThan(0);

    const nonCanonical = inventory.items.filter(
      (item) => item.classification !== "ACTIVE_CANONICAL"
    );
    expect(nonCanonical.length).toBeGreaterThan(0);
    for (const item of nonCanonical) {
      expect(item.path).toBeTruthy();
      expect(item.symbol).toBeTruthy();
      expect(item.classification).toBeTruthy();
      expect(item.imports !== undefined).toBe(true);
      expect(item.route).toBeTruthy();
      expect(item.deps !== undefined).toBe(true);
      expect(item.tests !== undefined).toBe(true);
      expect(item.scope).toBeTruthy();
      expect(item.replacement !== undefined).toBe(true);
      expect(item.recommendedAction).toBeTruthy();
      expect(item.confidence).toBeTruthy();
    }
  });

  it("SECTION_REGISTRY has unique ids and known consumer receivers", () => {
    const ids = SECTION_REGISTRY.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    const resultsView = readFileSync(
      path.join(root, "apps/consumer/src/components/results-view/ResultsView.tsx"),
      "utf8"
    );
    const weekView = readFileSync(
      path.join(root, "apps/consumer/src/components/results/WeekViewPanel.tsx"),
      "utf8"
    );
    const ladderPill = readFileSync(
      path.join(
        root,
        "apps/consumer/src/components/session/SessionLadderPill.tsx"
      ),
      "utf8"
    );
    const corrective = readFileSync(
      path.join(
        root,
        "apps/consumer/src/components/session/CorrectiveSourceLine.tsx"
      ),
      "utf8"
    );

    expect(resultsView).toContain("results.headline");
    expect(resultsView).toContain("results.ladders");
    expect(resultsView).toContain("results.posture");
    expect(resultsView).toContain("results.phaseHistory");
    expect(resultsView).toContain("results.provenanceFooter");
    expect(weekView).toContain("day.warmupBreakdown");
    expect(ladderPill).toContain("session.ladderPill");
    expect(corrective).toContain("day.correctiveSource");
  });

  it("critical Phase 8 controls are absent from SECTION_REGISTRY labels", () => {
    const labels = SECTION_REGISTRY.map((s) =>
      `${s.id} ${s.label} ${s.description}`.toLowerCase()
    ).join("\n");
    for (const control of PHASE8_CRITICAL_CONTROL_LABELS) {
      expect(labels).not.toContain(control.toLowerCase());
    }
  });
});
