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
    title: "Start here: How Praxis works",
    sections: [
      {
        type: "text",
        text: "Praxis fixes what's holding your movement back, then builds strength on top.",
      },
      {
        type: "bullets",
        title: "Praxis:",
        items: [
          "Spots the habits that hold your movement back.",
          "Builds a weekly plan that works on them in the right order.",
          "Adjusts each week based on how your sessions actually go.",
        ],
      },
      {
        type: "text",
        text: "You'll answer a few questions, take three posture photos, and get your plan. Under three minutes.",
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
    title: "How to answer your Praxis movement profile",
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
        text: "Your answers help identify movement priorities and constraints for a more useful plan.",
      },
    ],
  },
  results: {
    title: "How to use your Praxis dashboard",
    sections: [
      {
        type: "bullets",
        title: "Your dashboard shows:",
        items: [
          "Phase: where you are in your training",
          "Week View: your sessions for the week",
          "This week's focus: what you're working on and why",
          "Plan adjustments: what changed and why",
        ],
      },
      {
        type: "text",
        text: "This dashboard shows where you are and what to prioritize next.",
      },
      {
        type: "text",
        text: "After each session, Praxis updates the plan automatically.",
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
          "Follow the exercise order",
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
        text: "When finished: Press \"Next\" until the session completes.",
      },
      {
        type: "text",
        text: "Praxis adjusts movement quality emphasis based on your feedback.",
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
