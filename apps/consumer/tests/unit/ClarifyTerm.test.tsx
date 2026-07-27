// @vitest-environment jsdom
import { describe, expect, test, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ClarifyTerm from "../../src/components/ui/ClarifyTerm";

afterEach(() => {
  cleanup();
});

const EXPLANATION =
  "Rate of Perceived Exertion — a 1-10 scale for how hard a set felt.";

describe("ClarifyTerm", () => {
  test("renders the trigger term, info icon, and no card initially", () => {
    render(
      <ClarifyTerm term="RPE" explanation={EXPLANATION}>
        RPE
      </ClarifyTerm>
    );
    expect(screen.getByText("RPE")).not.toBeNull();
    expect(screen.getByTestId("clarify-term-rpe-info")).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("clicking the term opens the explanation card", () => {
    render(
      <ClarifyTerm term="RPE" explanation={EXPLANATION}>
        RPE
      </ClarifyTerm>
    );
    fireEvent.click(screen.getByTestId("clarify-term-rpe"));

    const card = screen.getByRole("status");
    expect(card.textContent).toContain(EXPLANATION);
    expect(
      screen.getByTestId("clarify-term-rpe").getAttribute("aria-expanded")
    ).toBe("true");
  });

  test("hovering the term also opens the card (desktop)", () => {
    render(
      <ClarifyTerm term="RPE" explanation={EXPLANATION}>
        RPE
      </ClarifyTerm>
    );
    fireEvent.mouseEnter(screen.getByTestId("clarify-term-rpe"));
    expect(screen.queryByRole("status")).not.toBeNull();
  });

  test("the close button dismisses the card", () => {
    render(
      <ClarifyTerm term="RPE" explanation={EXPLANATION}>
        RPE
      </ClarifyTerm>
    );
    fireEvent.click(screen.getByTestId("clarify-term-rpe"));
    fireEvent.click(screen.getByTestId("clarify-term-rpe-close"));
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("clicking outside the component dismisses the card", () => {
    render(
      <div>
        <ClarifyTerm term="RPE" explanation={EXPLANATION}>
          RPE
        </ClarifyTerm>
        <button type="button" data-testid="outside">
          Elsewhere
        </button>
      </div>
    );
    fireEvent.click(screen.getByTestId("clarify-term-rpe"));
    expect(screen.queryByRole("status")).not.toBeNull();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("pressing Escape dismisses the card", () => {
    render(
      <ClarifyTerm term="RPE" explanation={EXPLANATION}>
        RPE
      </ClarifyTerm>
    );
    fireEvent.click(screen.getByTestId("clarify-term-rpe"));
    expect(screen.queryByRole("status")).not.toBeNull();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("does not use the native title attribute anywhere", () => {
    const { container } = render(
      <ClarifyTerm term="RPE" explanation={EXPLANATION}>
        RPE
      </ClarifyTerm>
    );
    fireEvent.click(screen.getByTestId("clarify-term-rpe"));
    expect(container.querySelector("[title]")).toBeNull();
  });

  test("renders an optional learn-more link inside the card", () => {
    render(
      <ClarifyTerm
        term="RPE"
        explanation={EXPLANATION}
        learnMoreHref="/faq#rpe"
        learnMoreLabel="More on RPE"
      >
        RPE
      </ClarifyTerm>
    );
    fireEvent.click(screen.getByTestId("clarify-term-rpe"));
    const link = screen.getByRole("link", { name: "More on RPE" });
    expect(link.getAttribute("href")).toBe("/faq#rpe");
  });
});
