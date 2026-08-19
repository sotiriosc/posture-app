import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const harness = vi.hoisted(() => ({ allowed: false }));
vi.mock("@/server/controlledOwnerDelivery", () => ({
  readOwnerGate: async () => ({ allowed: harness.allowed, mode: harness.allowed ? "preview" : "off",
    userId: harness.allowed ? "synthetic-owner" : null }),
}));

vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) =>
  <a href={href}>{children}</a> }));

import AccountSettingsLayout from "../../src/app/account/settings/layout";

describe("controlled owner Account entry", () => {
  it("has exact child-only DOM when mode is off or identity is ineligible", async () => {
    harness.allowed = false;
    const output = renderToStaticMarkup(await AccountSettingsLayout({ children: <div id="ordinary">Account</div> }));
    expect(output).toBe('<div id="ordinary">Account</div>');
    expect(output).not.toContain("Praxis V2");
  });

  it("adds exactly one server-owned link only after eligibility succeeds", async () => {
    harness.allowed = true;
    const output = renderToStaticMarkup(await AccountSettingsLayout({ children: <div id="ordinary">Account</div> }));
    expect(output.match(/Praxis V2 owner preview/g)).toHaveLength(1);
    expect(output).toContain('href="/account/praxis-v2"');
    expect(output).not.toContain("synthetic-owner");
    expect(output.startsWith('<div id="ordinary">Account</div>')).toBe(true);
  });
});
