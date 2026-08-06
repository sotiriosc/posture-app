import {
  GUIDE_SEEN_STORAGE_KEY,
  isDeviceGuideSeen,
  markDeviceGuideSeen,
} from "@/lib/deviceGuideSeen";

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
        text: "If something felt off last time, you'll see three choices before we begin — Skip for now, Try again, or Make it easier. Yours to pick.",
      },
      {
        type: "text",
        text: "Don't want a movement, or don't have the gear? Tap the ⋯ on any exercise and choose \"Block until I reset\" — it won't come back until you do.",
      },
    ],
  },
};

/** Device-level guide seen map (`praxis_guide_seen`). Survives auth wipes. */
export { GUIDE_SEEN_STORAGE_KEY };

/** @deprecated Legacy key retained for migration only. */
export const ONBOARDING_STORAGE_KEY = "onboarding_state_v1";

export const shouldAutoOpenOnboarding = (key: OnboardingKey) =>
  !isDeviceGuideSeen(key);

export const markOnboardingPageSeen = (key: OnboardingKey) => {
  markDeviceGuideSeen(key);
};

/**
 * Kept for signup call sites. Guide auto-show is device-level and must not
 * re-arm on account creation — so this is intentionally a no-op.
 */
export const markSignupWalkthroughPending = () => {
  // no-op: guide seen state is device-scoped via praxis_guide_seen
};
