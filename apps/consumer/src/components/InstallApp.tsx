"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SESSION_COMPLETE_EVENT } from "@/lib/sessionStore";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_AT_KEY = "pwa_install_dismissed_at";
const INSTALLED_KEY = "pwa_install_installed";
const DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

const isDismissedWithinCooldown = () => {
  const raw = localStorage.getItem(DISMISSED_AT_KEY);
  if (!raw) return false;
  const dismissedAt = Date.parse(raw);
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
};

/**
 * Phase 6d, Commit 8 — PWA install prompt orchestration.
 *
 * 8.a: Chrome's native mini-infobar only fires uncontested because nothing
 * previously called `beforeinstallprompt`'s `preventDefault()` — this
 * component existed before but was never mounted anywhere, so its listener
 * never actually attached. Mounting it once at the root layout (see
 * layout.tsx) is what actually suppresses the native banner app-wide.
 *
 * 8.b: fires its own dismissible prompt at the highest-engagement moment —
 * right after the user finishes their first-ever session — rather than
 * immediately on landing, which is what covered the marketing hero before.
 * A "Not now" dismissal is remembered for 30 days via localStorage; an
 * accepted or already-completed install is remembered permanently.
 */
export default function InstallApp() {
  const pathname = usePathname();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(INSTALLED_KEY) === "1"
  );
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && isDismissedWithinCooldown()
  );
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const hadCompletedSessionBeforeThisVisit = Boolean(
      localStorage.getItem("session_last_completed_at")
    );

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setInstalled(true);
      setPromptEvent(null);
    };

    const handleSessionComplete = () => {
      if (!hadCompletedSessionBeforeThisVisit) setEligible(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener(
      SESSION_COMPLETE_EVENT,
      handleSessionComplete as EventListener
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener(
        SESSION_COMPLETE_EVENT,
        handleSessionComplete as EventListener
      );
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_AT_KEY, new Date().toISOString());
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setPromptEvent(null);
    } else {
      handleDismiss();
    }
  };

  // Held off screen while still on the session-complete view itself so it
  // doesn't compete with that screen's own primary action; it appears the
  // moment the user moves on (e.g. back to the dashboard).
  if (
    installed ||
    dismissed ||
    !eligible ||
    !promptEvent ||
    pathname === "/session"
  ) {
    return null;
  }

  return (
    <div
      data-testid="pwa-install-prompt"
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 mx-auto w-[92%] max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Install Praxis
          </p>
          <p className="text-xs text-slate-600">
            Praxis works better as an app on your home screen. Install?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            data-testid="pwa-install-dismiss"
            className="min-h-11 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstall}
            data-testid="pwa-install-accept"
            className="min-h-11 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
