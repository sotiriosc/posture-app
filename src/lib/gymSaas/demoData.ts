export type GymDemoCard = {
  title: string;
  body: string;
  href: string;
  cta: string;
};

export type GymDemoTextItem = {
  title: string;
  body: string;
};

export type GymDemoMetric = {
  label: string;
  value: string;
  note: string;
};

export type GymDemoAttentionRow = {
  member: string;
  signal: string;
  nextStep: string;
};

export const gymDemoCards: GymDemoCard[] = [
  {
    title: "Member Demo",
    body: "Walk through member onboarding, the guided first-week plan, session support, and the trainer consultation pathway.",
    href: "/gym-demo/member",
    cta: "View member demo",
  },
  {
    title: "Admin Preview",
    body: "Review example pilot metrics a gym team could use to understand activation, completion, confidence, and trainer handoffs.",
    href: "/gym-demo/admin",
    cta: "View admin preview",
  },
  {
    title: "Pilot page",
    body: "Return to the main buyer page for the full local gym pilot offer and demo entry points.",
    href: "/pilot",
    cta: "View pilot page",
  },
];

export const gymDemoProofPoints = [
  "Assessment-driven onboarding",
  "Structured first-week plan",
  "Guided session support",
  "Feedback-aware trainer prompts",
  "Pilot metrics for club teams",
  "Standardized coaching education",
];

export const gymDemoPilotConcept: GymDemoTextItem = {
  title: "Connected demo",
  body: "Start with one club, one region, or one member segment. Measure member activation, first-workout completion, trainer consult requests, and coaching usefulness before expanding rollout.",
};

export const memberJourneySteps: GymDemoTextItem[] = [
  {
    title: "1. Member starts with context",
    body: "A member enters goals, experience, schedule, equipment access, discomfort, and confidence signals before starting a plan.",
  },
  {
    title: "2. Optional movement baseline",
    body: "The assessment route can capture posture and movement inputs that help the coaching engine shape corrective focus.",
  },
  {
    title: "3. First-week plan",
    body: "Praxis generates a structured week that gives the member a clear starting point instead of leaving them to guess.",
  },
  {
    title: "4. Guided session",
    body: "The session flow shows movement cues, set tracking, timer support, feedback capture, and safer adjustment paths.",
  },
  {
    title: "5. Feedback creates support moments",
    body: "Difficulty, discomfort, and confidence feedback can inform the next recommendation and surface trainer consult opportunities.",
  },
  {
    title: "6. Trainer pathway",
    body: "Members can be guided toward a complimentary movement consultation when the context makes that handoff useful.",
  },
];

export const adminMetrics: GymDemoMetric[] = [
  { label: "Assessments completed", value: "124", note: "Pilot member segment" },
  { label: "First workouts completed", value: "82", note: "Activation signal" },
  { label: "Trainer consult requests", value: "19", note: "Consultation pathway" },
  { label: "Confidence feedback", value: "4.3/5", note: "Post-session average" },
  { label: "Members needing attention", value: "12", note: "Weekly review queue" },
];

export const operatorSections: GymDemoTextItem[] = [
  {
    title: "Member activation",
    body: "Track whether members move from assessment to first plan and first workout.",
  },
  {
    title: "Support signals",
    body: "Identify uncertainty, discomfort, skipped sessions, and low-confidence feedback before members drift.",
  },
  {
    title: "Trainer handoffs",
    body: "Surface members who may benefit from a complimentary movement consultation or PT conversation.",
  },
  {
    title: "Coaching consistency",
    body: "Standardize exercise explanations, regressions, progressions, and common compensation cues.",
  },
];

export const membersNeedingAttention: GymDemoAttentionRow[] = [
  {
    member: "Avery M.",
    signal: "Low confidence after first session",
    nextStep: "Send trainer check-in prompt",
  },
  {
    member: "Jordan P.",
    signal: "First workout incomplete",
    nextStep: "Offer guided restart",
  },
  {
    member: "Mina S.",
    signal: "Reported discomfort during push pattern",
    nextStep: "Recommend movement consultation",
  },
  {
    member: "Theo R.",
    signal: "Ready for trainer consultation",
    nextStep: "Route to PT desk",
  },
];
