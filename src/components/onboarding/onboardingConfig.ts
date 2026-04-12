export type OnboardingKey =
  | "home"
  | "assessment"
  | "questionnaire"
  | "results"
  | "session";

type OnboardingSection =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "bullets";
      title?: string;
      items: string[];
    }
  | {
      type: "steps";
      title?: string;
      items: string[];
    };

export type OnboardingGuide = {
  title: string;
  sections: OnboardingSection[];
};

export const onboardingPageOrder: OnboardingKey[] = [
  "home",
  "assessment",
  "questionnaire",
  "results",
  "session",
];

export const onboardingGuides: Record<OnboardingKey, OnboardingGuide> = {
  home: {
    title: "Start here: How this movement system works",
    sections: [
      {
        type: "text",
        text: "This movement system is built for corrective performance, not generic workouts.",
      },
      {
        type: "bullets",
        title: "The system:",
        items: [
          "Detects tendencies that undermine movement quality.",
          "Builds structured corrective progression around pattern balance.",
          "Adapts corrective guidance based on movement performance and recovery.",
        ],
      },
      {
        type: "steps",
        title: "You’ll complete:",
        items: [
          "Movement & posture baseline",
          "Structured movement profile assessment",
          "Corrective program generation",
        ],
      },
      {
        type: "text",
        text: "Estimated time: under 3 minutes.",
      },
    ],
  },
  assessment: {
    title: "How to capture a movement & posture baseline",
    sections: [
      {
        type: "bullets",
        title: "For best results:",
        items: [
          "Stand naturally, not flexing",
          "Relax your shoulders and jaw",
          "Use neutral lighting",
          "Keep camera at chest height",
          "Wear fitted clothing",
          "Take front, side, and back views",
        ],
      },
      {
        type: "text",
        text: "These images help detect structural imbalances that influence movement mechanics and corrective focus.",
      },
      {
        type: "text",
        text: "Do not try to correct posture in the photo; stand as you normally would.",
      },
    ],
  },
  questionnaire: {
    title: "How to answer the structured movement profile assessment",
    sections: [
      {
        type: "bullets",
        title: "Answer based on:",
        items: [
          "Your current ability",
          "Not your best day",
          "Not your worst day",
        ],
      },
      {
        type: "bullets",
        title: "Be honest about:",
        items: [
          "Pain areas",
          "Equipment access",
          "Training frequency",
        ],
      },
      {
        type: "text",
        text: "Your answers help identify movement priorities and constraints for better corrective programming.",
      },
    ],
  },
  results: {
    title: "How to use your corrective dashboard",
    sections: [
      {
        type: "bullets",
        title: "Your dashboard shows:",
        items: [
          "Phase: where you are in pattern mastery",
          "Week View: your weekly corrective structure",
          "Training readiness: how prepared you are",
          "System Adjustments: what the plan changed and why",
        ],
      },
      {
        type: "text",
        text: "This dashboard shows where you are in pattern mastery and what to prioritize next.",
      },
      {
        type: "text",
        text: "After each session, the movement system updates automatically.",
      },
    ],
  },
  session: {
    title: "How to complete a corrective session",
    sections: [
      {
        type: "bullets",
        title: "Flow:",
        items: [
          "Follow movement pattern focus order",
          "Log weight / reps",
          "Complete sets in sequence",
          "Focus on executed movement quality, not just load.",
        ],
      },
      {
        type: "text",
        text: "Use the timer when appropriate and stay controlled and aligned.",
      },
      {
        type: "text",
        text: "When finished: Press \"Next Movement Pattern\" until session completes.",
      },
      {
        type: "text",
        text: "The system adjusts movement quality emphasis based on your feedback.",
      },
    ],
  },
};

type OnboardingState = {
  version: 1;
  seenByPage: Partial<Record<OnboardingKey, boolean>>;
  signupWalkthroughSeen: boolean;
  signupWalkthroughPageSeen: Partial<Record<OnboardingKey, boolean>>;
};

export const ONBOARDING_STORAGE_KEY = "onboarding_state_v1";

const defaultOnboardingState = (): OnboardingState => ({
  version: 1,
  seenByPage: {},
  signupWalkthroughSeen: true,
  signupWalkthroughPageSeen: {},
});

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizePageRecord = (
  value: unknown
): Partial<Record<OnboardingKey, boolean>> => {
  if (!isObject(value)) return {};
  const next: Partial<Record<OnboardingKey, boolean>> = {};
  for (const key of onboardingPageOrder) {
    if (value[key] === true) {
      next[key] = true;
    }
  }
  return next;
};

const canUseStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

export const readOnboardingState = (): OnboardingState => {
  if (!canUseStorage()) return defaultOnboardingState();
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return defaultOnboardingState();
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return defaultOnboardingState();
    return {
      version: 1,
      seenByPage: sanitizePageRecord(parsed.seenByPage),
      signupWalkthroughSeen: parsed.signupWalkthroughSeen !== false,
      signupWalkthroughPageSeen: sanitizePageRecord(parsed.signupWalkthroughPageSeen),
    };
  } catch {
    return defaultOnboardingState();
  }
};

export const writeOnboardingState = (state: OnboardingState) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
};

export const shouldAutoOpenOnboarding = (key: OnboardingKey) => {
  const state = readOnboardingState();
  const firstVisit = state.seenByPage[key] !== true;
  const walkthroughVisit =
    !state.signupWalkthroughSeen && state.signupWalkthroughPageSeen[key] !== true;
  return firstVisit || walkthroughVisit;
};

export const markOnboardingPageSeen = (key: OnboardingKey) => {
  const state = readOnboardingState();
  state.seenByPage[key] = true;

  if (!state.signupWalkthroughSeen) {
    state.signupWalkthroughPageSeen[key] = true;
    const completedWalkthrough = onboardingPageOrder.every(
      (pageKey) => state.signupWalkthroughPageSeen[pageKey] === true
    );
    if (completedWalkthrough) {
      state.signupWalkthroughSeen = true;
    }
  }

  writeOnboardingState(state);
};

export const markSignupWalkthroughPending = () => {
  const state = readOnboardingState();
  state.signupWalkthroughSeen = false;
  state.signupWalkthroughPageSeen = {};
  writeOnboardingState(state);
};
