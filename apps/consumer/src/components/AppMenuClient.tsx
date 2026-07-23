"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import AuthControls from "@/components/AuthControls";

type AppMenuClientProps = {
  isAdmin: boolean;
  authEnabled: boolean;
  authenticated: boolean;
};

type MenuLink = {
  href: string;
  label: string;
};

export const OPEN_APP_MENU_EVENT = "praxis:open-app-menu";

export function openAppMenu() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_APP_MENU_EVENT));
}

export default function AppMenuClient({
  isAdmin,
  authEnabled,
  authenticated,
}: AppMenuClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleExternalOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_APP_MENU_EVENT, handleExternalOpen);
    return () => window.removeEventListener(OPEN_APP_MENU_EVENT, handleExternalOpen);
  }, []);

  const hideMenu =
    pathname?.startsWith("/auth/") || pathname?.startsWith("/admin/access");
  // Phase 6d, Commit 1 — the session screen's own consolidated bottom bar
  // provides the Menu entry on phone; the global floating pill would
  // otherwise duplicate it. Desktop is out of scope for this pass and keeps
  // the floating pill (it already lives at the top there, out of the way).
  const isSessionRoute = pathname === "/session";
  // Phase 6d, Commit 7 — ordered by expected usage frequency for a
  // signed-in user rather than router declaration order. "Home" (the
  // marketing landing) is deprioritized toward the bottom since a
  // signed-in user's home base is the dashboard, not the landing page.
  const links = useMemo(() => {
    const nav: MenuLink[] = [];
    if (authEnabled) {
      nav.push({ href: "/results", label: "Praxis Dashboard" });
      nav.push({ href: "/progress", label: "Progress" });
    }
    nav.push({ href: "/assessment", label: "Assessment" });
    nav.push({ href: "/questionnaire", label: "Movement Profile" });
    if (authEnabled && authenticated) {
      nav.push({ href: "/account/billing", label: "Account / Billing" });
      nav.push({ href: "/account/settings", label: "Settings" });
    }
    if (isAdmin) nav.push({ href: "/settings", label: "Admin Settings" });
    nav.push({ href: "/faq", label: "Help & FAQ" });
    nav.push({ href: "/", label: "Home" });
    return nav;
  }, [isAdmin, authEnabled, authenticated]);

  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      credentials: "include",
    }).catch(() => null);
    window.location.href = "/";
  };
  const navItemClass =
    "block w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition border-slate-300/25 bg-slate-900/35 text-slate-100 hover:bg-slate-800/45";

  if (hideMenu) return null;

  return (
    <>
      {!open ? (
        <div
          className={`fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-3 z-[70] items-center justify-end gap-2 sm:right-4 md:bottom-auto md:right-4 md:top-4 ${
            isSessionRoute ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="hidden md:block">
            <AuthControls />
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-400/35 bg-slate-950/72 px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur transition hover:-translate-y-px hover:bg-slate-900/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Menu
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[65]">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/55"
          />
          <aside className="absolute right-0 top-0 h-full w-[min(88vw,360px)] border-l border-slate-400/25 bg-slate-950/95 p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Navigation
              </p>
              <Button variant="secondary" className="min-w-[84px]" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <nav className="mt-5 space-y-2">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-sky-300/45 bg-sky-500/15 text-white"
                        : "border-slate-300/25 bg-slate-900/35 text-slate-100 hover:bg-slate-800/45"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {authEnabled ? (
                authenticated ? (
                  <button
                    type="button"
                    onClick={logout}
                    disabled={loggingOut}
                    data-testid="nav-menu-logout"
                    className={navItemClass}
                  >
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    data-testid="nav-menu-login"
                    className={navItemClass}
                  >
                    Log in
                  </Link>
                )
              ) : null}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
