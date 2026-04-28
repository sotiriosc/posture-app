/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import UpgradePrompt from "@/components/UpgradePrompt";

describe("UpgradePrompt", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test("shows Pro active state instead of upgrade CTA for Pro billing status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          stripeConfigured: true,
          user: { plan: "pro" },
        }),
      }))
    );

    render(React.createElement(UpgradePrompt));

    await waitFor(() => {
      expect(screen.getByTestId("pro-active-notice").textContent).toContain(
        "Praxis Pro active"
      );
    });
    expect(screen.queryByText("Upgrade to Pro")).toBeNull();
    expect(screen.queryByTestId("upgrade-prompt")).toBeNull();
  });

  test("keeps upgrade CTA visible for Free billing status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          stripeConfigured: true,
          user: { plan: "free" },
        }),
      }))
    );

    render(React.createElement(UpgradePrompt));

    await waitFor(() => {
      expect(screen.getByTestId("upgrade-prompt")).toBeTruthy();
    });
    expect(screen.getByText("Upgrade to Pro")).toBeTruthy();
  });
});
