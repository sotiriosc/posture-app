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
    title: "Start here: how Praxis works",
    sections: [
      {
        type: "text",
        text: "Praxis finds what's holding your movement back, works on that first, then builds strength on top. Answer a few questions, take three posture photos, and you'll have a weekly plan — under three minutes.",
      },
      {
        type: "bullets",
        title: "What Praxis does:",
        items: [
          "Spots the habits limiting your movement.",
          "Builds a weekly plan that works on them in the right order.",
          "Adjusts every week based on how your sessions actually go.",
        ],
      },
    ],
  },
  assessment: {
    title: "Your posture photos",
    sections: [
      {
        type: "text",
        text: "Three photos give us your starting point. Stand as you normally would — don't correct your posture for the camera, or we'll be fixing the wrong thing.",
      },
      {
        type: "bullets",
        title: "For a clean read:",
        items: [
          "Stand naturally, shoulders and jaw relaxed",
          "Neutral lighting, camera at chest height",
          "Fitted clothing",
          "Front, side, and back views",
        ],
      },
      {
        type: "text",
        text: "Every so often — usually when you move to a new phase — we'll ask for fresh photos. Your baseline updates and the plan adapts.",
      },
    ],
  },
  questionnaire: {
    title: "Your movement profile",
    sections: [
      {
        type: "text",
        text: "Answer for your current ability — not your best day, not your worst. Be honest about pain, the equipment you have, and how often you train; that's what makes the plan yours.",
      },
      {
        type: "text",
        text: "One question sets your goal — Build, Maintain, or Recover. Not everyone is here to add weight, so we adapt to the goal you pick. Change it anytime with \"Edit profile\" on your dashboard.",
      },
    ],
  },
  results: {
    title: "Your dashboard",
    sections: [
      {
        type: "bullets",
        title: "What you'll see:",
        items: [
          "Phase — where you are in your training",
          "Week view — your sessions for the week",
          "This week's focus — what you're working on and why",
          "Plan adjustments — what changed and why",
        ],
      },
      {
        type: "text",
        text: "After each session Praxis updates the plan. You'll move up to the next progression after two clean sessions at the top of your rep range — no pushiness, your body tells us when.",
      },
    ],
  },
  session: {
    title: "During a session",
    sections: [
      {
        type: "bullets",
        title: "Each session:",
        items: [
          "Follow the exercise order",
          "Log your weight and reps as you go",
          "Focus on movement quality, not just load",
        ],
      },
      {
        type: "text",
        text: "If something felt off last time, you'll see three choices before we begin — Sacrifice, Test, or Modify. Yours to pick.",
      },
      {
        type: "text",
        text: "Don't want a movement, or don't have the gear? Tap the ⋯ on any exercise and choose \"Block until I reset\" — it won't come back until you do.",
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
