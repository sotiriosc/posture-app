// @vitest-environment jsdom
/**
 * Phase 8 — body-map prototype keyboard + pill fallback.
 */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import BodyMapPrototype from "@/components/body-map/BodyMapPrototype";

afterEach(() => {
  cleanup();
});

describe("Phase 8 body-map prototype", () => {
  it("exposes accessible pill fallback and keyboard-selectable regions", () => {
    render(<BodyMapPrototype />);

    expect(screen.getByTestId("body-map-prototype")).toBeTruthy();
    fireEvent.click(screen.getByTestId("body-map-mode-pills"));
    expect(screen.getByTestId("body-map-pill-fallback")).toBeTruthy();

    const firstPill = screen.getByTestId("body-map-pill-front-neck");
    fireEvent.click(firstPill);
    expect(screen.getByTestId("body-map-selected-region").textContent).toMatch(
      /Neck/i
    );

    fireEvent.click(screen.getByTestId("body-map-mode-map"));
    const region = screen.getByTestId("body-map-region-front-chest");
    fireEvent.keyDown(region, { key: "Enter" });
    expect(screen.getByTestId("body-map-selected-region").textContent).toMatch(
      /Chest/i
    );

    fireEvent.click(screen.getByText("Painful"));
    fireEvent.click(screen.getByText("Mild"));
    expect(
      screen.getByTestId("body-map-proposed-response").textContent
    ).toMatch(/Proposed:/i);
    expect(
      screen.getByTestId("body-map-proposed-response").textContent
    ).toMatch(/not wired to production/i);
  });
});
