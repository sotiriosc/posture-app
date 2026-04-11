/** @vitest-environment jsdom */

import React, { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import ProgramReferenceCard from "@/components/ProgramReferenceCard";

const referenceText = [
  "QUESTIONNAIRE INPUTS",
  "Goal: Improve posture",
  "",
  "PHASE PREVIEW (ALL 3 DAYS)",
  "Day 1: Back + Chest",
].join("\n");

const StatefulProgramReferenceCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  return React.createElement(ProgramReferenceCard, {
    isOpen,
    referenceText,
    onToggle: () => setIsOpen((current) => !current),
  });
};

describe("ProgramReferenceCard", () => {
  afterEach(() => {
    cleanup();
  });

  test("is collapsed by default", () => {
    render(React.createElement(StatefulProgramReferenceCard));

    expect(screen.getByTestId("program-reference-card")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Show phase reference/i })).toBeTruthy();
    expect(screen.queryByTestId("program-reference-body")).toBeNull();
  });

  test("reveals the generated phase reference on explicit user request", () => {
    render(React.createElement(StatefulProgramReferenceCard));

    fireEvent.click(screen.getByRole("button", { name: /Show phase reference/i }));

    const bodyText = screen.getByTestId("program-reference-body").textContent ?? "";
    expect(bodyText).toContain("QUESTIONNAIRE INPUTS");
    expect(bodyText).toContain("PHASE PREVIEW (ALL 3 DAYS)");
    expect(bodyText).toContain("Day 1: Back + Chest");
    expect(screen.getByRole("button", { name: /Hide phase reference/i })).toBeTruthy();
  });
});
