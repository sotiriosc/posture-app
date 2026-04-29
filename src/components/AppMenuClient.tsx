"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import AuthControls from "@/components/AuthControls";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
} from "@/lib/gymSaas/demoMode";

type AppMenuClientProps = {
  isAdmin: boolean;
  authEnabled: boolean;
  authenticated: boolean;
};

type MenuLink = {
  href: string;
  label: string;
};

export default function AppMenuClient({
  isAdmin,
  authEnabled,
  authenticated,
}: AppMenuClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buyerDemoMode = useMemo(() => {
    if (typeof document === "undefined") return false;
    const demoCookie = document.cookie
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${BUYER_DEMO_COOKIE}=`));
    return isBuyerDemoCookieValue(demoCookie?.split("=")[1]);
  }, []);

  const hideMenu =
    pathname?.startsWith("/auth/") || pathname?.startsWith("/admin/access");
  const links = useMemo(() => {
    if (buyerDemoMode) {
      return [
        { href: "/pilot", label: "Pilot" },
        { href: "/gym-demo", label: "Demo Overview" },
        { href: "/gym-demo/member", label: "Member Demo" },
        { href: "/gym-demo/admin", label: "Admin Preview" },
        { href: "/gym-admin/setup", label: "Gym Setup" },
        { href: "/gym-admin/dashboard", label: "Signal Dashboard" },
        { href: "/assessment", label: "Assessment" },
        { href: "/questionnaire", label: "Member profile" },
        { href: "/results", label: "Member plan" },
      ];
    }

    const nav: MenuLink[] = [
      { href: "/pilot", label: "Pilot" },
      { href: "/gym-demo", label: "Demo Overview" },
      { href: "/assessment", label: "Member Assessment" },
      { href: "/questionnaire", label: "Movement Profile" },
    ];
    if (authEnabled) {
      nav.push({ href: "/results", label: "Member Dashboard" });
      nav.push({ href: "/progress", label: "Progress" });
      if (authenticated) {
        nav.push({ href: "/account/billing", label: "Account" });
        nav.push({ href: "/account/settings", label: "Data Settings" });
      }
    }
    if (isAdmin) nav.push({ href: "/settings", label: "Admin Settings" });
    return nav;
  }, [isAdmin, authEnabled, authenticated, buyerDemoMode]);

  if (hideMenu) return null;

  return (
    <>
      {!open ? (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-3 z-[70] flex items-center justify-end gap-2 sm:right-4 md:bottom-auto md:right-4 md:top-4">
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
            </nav>
            <div className="mt-6 border-t border-white/15 pt-4">
              <AuthControls />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
