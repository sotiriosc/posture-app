"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { init, loadPrefs, savePrefs } from "@/lib/logStore";
import {
  countHiddenSections,
  isSectionVisible,
  showAllForScreen,
} from "@/lib/ui/sectionVisibility";
import type { SectionScreen } from "@/lib/ui/sectionVisibility";
import type { LogPrefs } from "@/lib/types";

// ---------------------------------------------------------------------------
// Phase 6.3 — Per-section visibility: React layer
// ---------------------------------------------------------------------------
//
// A screen-scoped provider loads LogPrefs.sectionVisibility once, holds it in
// state, and persists every toggle back through savePrefs (same async pattern
// as the rest of the app; no shared prefs context exists).  useSectionVisibility
// returns [visible, toggle]; VisibilityGate conditionally renders; the header
// eye affordance hides a section; HiddenSectionsBar restores them.

type SectionVisibilityContextValue = {
  screen: SectionScreen;
  visibility: Record<string, boolean>;
  ready: boolean;
  setSectionVisible: (sectionId: string, visible: boolean) => void;
  toggleSection: (sectionId: string) => void;
  showAll: () => void;
  hiddenCount: number;
};

const SectionVisibilityContext =
  createContext<SectionVisibilityContextValue | null>(null);

export function SectionVisibilityProvider({
  screen,
  children,
}: {
  screen: SectionScreen;
  children: ReactNode;
}) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await init();
        const prefs = await loadPrefs();
        if (!cancelled) setVisibility(prefs.sectionVisibility ?? {});
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: Record<string, boolean>) => {
    setVisibility(next);
    void (async () => {
      const currentPrefs = await loadPrefs();
      const nextPrefs: LogPrefs = { ...currentPrefs, sectionVisibility: next };
      await savePrefs(nextPrefs);
    })();
  }, []);

  const setSectionVisible = useCallback(
    (sectionId: string, visible: boolean) => {
      setVisibility((prev) => {
        const next = { ...prev, [sectionId]: visible };
        void (async () => {
          const currentPrefs = await loadPrefs();
          await savePrefs({ ...currentPrefs, sectionVisibility: next });
        })();
        return next;
      });
    },
    []
  );

  const toggleSection = useCallback(
    (sectionId: string) => {
      setVisibility((prev) => {
        const current = isSectionVisible(prev, sectionId);
        const next = { ...prev, [sectionId]: !current };
        void (async () => {
          const currentPrefs = await loadPrefs();
          await savePrefs({ ...currentPrefs, sectionVisibility: next });
        })();
        return next;
      });
    },
    []
  );

  const showAll = useCallback(() => {
    persist(showAllForScreen(visibility, screen));
  }, [persist, visibility, screen]);

  const value = useMemo<SectionVisibilityContextValue>(
    () => ({
      screen,
      visibility,
      ready,
      setSectionVisible,
      toggleSection,
      showAll,
      hiddenCount: countHiddenSections(visibility, screen),
    }),
    [screen, visibility, ready, setSectionVisible, toggleSection, showAll]
  );

  return (
    <SectionVisibilityContext.Provider value={value}>
      {children}
    </SectionVisibilityContext.Provider>
  );
}

function useSectionVisibilityContext(): SectionVisibilityContextValue | null {
  return useContext(SectionVisibilityContext);
}

/**
 * useSectionVisibility(sectionId) → [visible, toggle].
 * Safe to call outside a provider: falls back to the ratified default and a
 * no-op toggle so gated components never crash if a screen forgets to wrap.
 */
export function useSectionVisibility(
  sectionId: string
): [boolean, () => void] {
  const ctx = useSectionVisibilityContext();
  const visible = ctx
    ? isSectionVisible(ctx.visibility, sectionId)
    : isSectionVisible(undefined, sectionId);
  const toggle = useCallback(() => {
    ctx?.toggleSection(sectionId);
  }, [ctx, sectionId]);
  return [visible, toggle];
}

/**
 * Lightweight, read-only visibility for sections that live inside large screens
 * that are not wrapped in a SectionVisibilityProvider (e.g. the session flow and
 * day view).  Loads LogPrefs.sectionVisibility once on mount and returns the
 * resolved visibility.  The toggle for these lives in Settings › Interface, so
 * this hook only needs to READ the persisted preference.
 *
 * Returns the ratified default until prefs load, so there is no flash of hidden
 * content for first-time users.
 */
export function useSectionVisiblePref(sectionId: string): boolean {
  const [visible, setVisible] = useState<boolean>(() =>
    isSectionVisible(undefined, sectionId)
  );
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await init();
      const prefs = await loadPrefs();
      if (!cancelled) {
        setVisible(isSectionVisible(prefs.sectionVisibility, sectionId));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sectionId]);
  return visible;
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

/**
 * A standalone eye affordance that hides a section persistently.  Place it
 * inside an existing section header (next to the title) so the header styling
 * is preserved.
 */
export function SectionEyeButton({
  sectionId,
  title,
}: {
  sectionId: string;
  title: string;
}) {
  const [, toggle] = useSectionVisibility(sectionId);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Hide ${title} section`}
      title="Hide this section"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-800 hover:text-slate-300"
    >
      <EyeOffIcon className="h-3.5 w-3.5" />
    </button>
  );
}

/**
 * A section header row with a title and a small eye affordance that hides the
 * section persistently.  Intended to sit at the top of a VisibilityGate.
 */
export function SectionHeader({
  sectionId,
  title,
  className,
}: {
  sectionId: string;
  title: string;
  className?: string;
}) {
  const [, toggle] = useSectionVisibility(sectionId);
  return (
    <div className={`flex items-center justify-between gap-2 ${className ?? ""}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Hide ${title} section`}
        title="Hide this section"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
      >
        <EyeOffIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Conditionally renders its children based on the section's resolved
 * visibility.  Renders nothing when hidden (recovery is via HiddenSectionsBar).
 */
export function VisibilityGate({
  sectionId,
  children,
}: {
  sectionId: string;
  children: ReactNode;
}) {
  const [visible] = useSectionVisibility(sectionId);
  if (!visible) return null;
  return <>{children}</>;
}

/**
 * "N sections hidden — [show all]" recovery line.  Renders only when at least
 * one section on the current screen is hidden, so content is never permanently
 * invisible without a way back.
 */
export function HiddenSectionsBar({ className }: { className?: string }) {
  const ctx = useSectionVisibilityContext();
  if (!ctx || ctx.hiddenCount < 1) return null;
  return (
    <div className={`text-center ${className ?? ""}`}>
      <button
        type="button"
        onClick={ctx.showAll}
        className="text-xs text-slate-500 underline decoration-dotted underline-offset-4 transition hover:text-slate-300"
      >
        {ctx.hiddenCount} section{ctx.hiddenCount === 1 ? "" : "s"} hidden — show
        all
      </button>
    </div>
  );
}
