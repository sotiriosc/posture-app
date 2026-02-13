"use client";

import { useMemo, useState } from "react";
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

export default function AppMenuClient({
  isAdmin,
  authEnabled,
  authenticated,
}: AppMenuClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hideMenu =
    pathname?.startsWith("/auth/") || pathname?.startsWith("/admin/access");
  const links = useMemo(() => {
    const nav: MenuLink[] = [
      { href: "/", label: "Home" },
      { href: "/assessment", label: "Assessment" },
      { href: "/questionnaire", label: "Questionnaire" },
    ];
    if (authEnabled) {
      nav.push({ href: "/results", label: "Results Dashboard" });
      nav.push({ href: "/progress", label: "Progress" });
      if (authenticated) {
        nav.push({ href: "/account/billing", label: "Billing" });
        nav.push({ href: "/account/settings", label: "Settings" });
      }
    }
    if (isAdmin) nav.push({ href: "/settings", label: "Admin Settings" });
    return nav;
  }, [isAdmin, authEnabled, authenticated]);

  if (hideMenu) return null;

  return (
    <>
      {!open ? (
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="fixed right-4 top-4 z-[70] rounded-full border border-white/25 bg-slate-950/70 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur"
        >
          Menu
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[65]">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/55"
          />
          <aside className="absolute right-0 top-0 h-full w-[min(88vw,360px)] border-l border-white/15 bg-slate-950/95 p-5 text-white shadow-2xl">
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
                        ? "border-white/50 bg-white/20 text-white"
                        : "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
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
