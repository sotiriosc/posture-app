"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallApp() {
  const pathname = usePathname();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setPromptEvent(null);
      setDismissed(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (pathname !== "/" || !promptEvent || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[92%] max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Install Body Alignment Coach
          </p>
          <p className="text-xs text-slate-600">
            Get quick access and offline support.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={async () => {
              await promptEvent.prompt();
              const choice = await promptEvent.userChoice;
              if (choice.outcome === "accepted") {
                setPromptEvent(null);
              } else {
                setDismissed(true);
              }
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
