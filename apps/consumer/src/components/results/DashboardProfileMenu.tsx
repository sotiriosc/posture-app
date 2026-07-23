"use client";

import Link from "next/link";
import { useState } from "react";

type DashboardProfileMenuProps = {
  authEnabled: boolean;
};

/**
 * Phase 6d, Commit 3.a — "Edit profile" and "Account and billing" used to be
 * two always-visible pills with the same visual weight as the greeting
 * itself. On phone that's four competing pills above the fold. They're
 * secondary/settings-style actions, not the primary "start today's session"
 * action, so they tuck behind a "..." trigger instead.
 */
export default function DashboardProfileMenu({ authEnabled }: DashboardProfileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Profile options"
        aria-expanded={open}
        data-testid="dashboard-profile-menu-trigger"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-400/35 bg-slate-950/45 text-slate-300 hover:bg-slate-800/55"
      >
        ···
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-20 min-w-48 overflow-hidden rounded-lg border border-slate-600/40 bg-slate-900 shadow-lg">
          <Link
            href="/questionnaire"
            data-testid="dashboard-edit-profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700/50"
          >
            Edit profile
          </Link>
          {authEnabled ? (
            <Link
              href="/account/billing"
              data-testid="dashboard-account-billing"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700/50"
            >
              Account and billing
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
