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
    title: "Start here: How this system works",
    sections: [
      {
        type: "text",
        text: "This is not a static workout app.",
      },
      {
        type: "bullets",
        title: "The system:",
        items: [
          "Analyzes your posture and inputs",
          "Builds your weekly structure automatically",
          "Adapts your program based on performance",
        ],
      },
      {
        type: "steps",
        title: "You’ll complete:",
        items: [
          "Photo assessment",
          "Quick questionnaire",
          "Personalized program generation",
        ],
      },
      {
        type: "text",
        text: "Estimated time: under 3 minutes.",
      },
    ],
  },
  assessment: {
    title: "How to take effective posture photos",
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
        text: "These images allow the system to detect structural imbalances and movement tendencies.",
      },
      {
        type: "text",
        text: "Do not try to “correct” posture in the photo — stand as you normally would.",
      },
    ],
  },
  questionnaire: {
    title: "How to answer accurately",
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
        text: "The more accurate your inputs, the more precise your program.",
      },
    ],
  },
  results: {
    title: "How to use your program",
    sections: [
      {
        type: "bullets",
        title: "Your dashboard shows:",
        items: [
          "Phase: where you are in progression",
          "Week View: your weekly structure",
          "Readiness: how prepared you are",
          "System Adjustments: how the plan adapts",
        ],
      },
      {
        type: "text",
        text: "Start each session using: “Start Today’s Session”",
      },
      {
        type: "text",
        text: "After each workout, the system updates automatically.",
      },
    ],
  },
  session: {
    title: "How to complete a session",
    sections: [
      {
        type: "bullets",
        title: "Flow:",
        items: [
          "Follow exercise order",
          "Log weight / reps",
          "Complete sets in sequence",
          "Provide honest difficulty feedback",
        ],
      },
      {
        type: "text",
        text: "Use the timer when appropriate.",
      },
      {
        type: "text",
        text: "When finished: Press “Next Exercise” until session completes.",
      },
      {
        type: "text",
        text: "The system adjusts difficulty based on your feedback.",
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

