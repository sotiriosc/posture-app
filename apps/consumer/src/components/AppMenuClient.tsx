"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import AuthControls from "@/components/AuthControls";
import { performLogout } from "@/components/authActions";
import { syncLocalOwner } from "@/lib/accountIsolation";
import { useUserPlan } from "@/hooks/useUserPlan";

type AppMenuClientProps = {
  isAdmin: boolean;
  authEnabled: boolean;
  authenticated: boolean;
  /**
   * Server session's user id (or null for guest/signed-out use). Mounted
   * globally in the root layout, so this is the "startup stale-device
   * check" (Phase 6e, Commit 1 / SR-6e): on every app load, and whenever the
   * signed-in account changes, reconcile this device's remembered owner
   * against the server's truth and wipe non-photo local state on mismatch.
   */
  userId: string | null;
};

type MenuLink = {
  href: string;
  label: string;
};

type SessionNavState = {
  active: boolean;
  canGoBack: boolean;
};

export const OPEN_APP_MENU_EVENT = "praxis:open-app-menu";
export const SESSION_NAV_STATE_EVENT = "praxis:session-nav-state";
export const SESSION_GO_BACK_EVENT = "praxis:session-go-back";
export const SESSION_EXIT_EVENT = "praxis:session-exit";

export function openAppMenu() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_APP_MENU_EVENT));
}

export function publishSessionNavState(state: SessionNavState) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SessionNavState>(SESSION_NAV_STATE_EVENT, { detail: state })
  );
}

export function requestSessionGoBack() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SESSION_GO_BACK_EVENT));
}

export default function AppMenuClient({
  isAdmin,
  authEnabled,
  authenticated,
  userId,
}: AppMenuClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sessionNav, setSessionNav] = useState<SessionNavState>({
    active: false,
    canGoBack: false,
  });
  const plan = useUserPlan();
  // Prefer live client session after soft login/signup; fall back to server props.
  const authOn = plan.loading ? authEnabled : plan.authEnabled;
  const isAuthed = plan.loading ? authenticated : plan.authenticated;

  useEffect(() => {
    function handleExternalOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_APP_MENU_EVENT, handleExternalOpen);
    return () => window.removeEventListener(OPEN_APP_MENU_EVENT, handleExternalOpen);
  }, []);

  useEffect(() => {
    function handleSessionNav(event: Event) {
      const detail = (event as CustomEvent<SessionNavState>).detail;
      if (!detail) return;
      setSessionNav({
        active: Boolean(detail.active),
        canGoBack: Boolean(detail.canGoBack),
      });
    }
    window.addEventListener(SESSION_NAV_STATE_EVENT, handleSessionNav);
    return () => window.removeEventListener(SESSION_NAV_STATE_EVENT, handleSessionNav);
  }, []);

  useEffect(() => {
    void syncLocalOwner(userId);
  }, [userId]);

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
    if (authOn) {
      nav.push({ href: "/results", label: "Praxis Dashboard" });
      nav.push({ href: "/progress", label: "Progress" });
    }
    nav.push({ href: "/assessment", label: "Assessment" });
    // Labels match the (desktop) dashboard "..." menu so mobile users find
    // the same actions after that control was removed below `sm`.
    nav.push({ href: "/questionnaire", label: "Edit profile" });
    if (authOn && isAuthed) {
      nav.push({ href: "/account/billing", label: "Account and billing" });
      nav.push({ href: "/account/settings", label: "Settings" });
    }
    if (isAdmin) nav.push({ href: "/settings", label: "Admin Settings" });
    nav.push({ href: "/faq", label: "Help & FAQ" });
    nav.push({ href: "/feedback", label: "Send feedback" });
    nav.push({ href: "/", label: "Home" });
    return nav;
  }, [isAdmin, authOn, isAuthed]);

  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    setLoggingOut(true);
    await performLogout();
  };
  const navItemClass =
    "block w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition border-slate-300/25 bg-slate-900/35 text-slate-100 hover:bg-slate-800/45";

  if (hideMenu) return null;

  const showSessionActions = isSessionRoute || sessionNav.active;

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
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-400/35 bg-slate-950/72 px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur transition hover:-translate-y-px hover:bg-slate-900/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
              {showSessionActions ? (
                <div className="space-y-2 pb-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Session
                  </p>
                  <button
                    type="button"
                    data-testid="session-back"
                    disabled={!sessionNav.canGoBack}
                    onClick={() => {
                      setOpen(false);
                      requestSessionGoBack();
                    }}
                    className={`${navItemClass} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    Go back
                  </button>
                  <Link
                    href="/results"
                    data-testid="session-exit"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent(SESSION_EXIT_EVENT));
                      setOpen(false);
                    }}
                    className={navItemClass}
                  >
                    Exit session
                  </Link>
                  <div className="border-b border-white/10 pb-2" />
                </div>
              ) : null}
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
              {authOn ? (
                isAuthed ? (
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
