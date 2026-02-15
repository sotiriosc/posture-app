import { createSeededRng } from "@/lib/seededRng";

export type Insight = {
  title: string;
  text: string;
  category:
    | "movement-quality"
    | "posture"
    | "pain-prevention"
    | "progression";
};

const PHASED_INSIGHTS: Record<number, Insight[]> = {
  1: [
    {
      title: "Today's Insight",
      text: "Your consistency is building a strong neurological foundation for cleaner movement.",
      category: "movement-quality",
    },
    {
      title: "Today's Insight",
      text: "Control improvements reduce injury risk and improve strength efficiency over time.",
      category: "progression",
    },
    {
      title: "Today's Insight",
      text: "Posture adaptations happen through repetition; smooth reps matter more than hard reps.",
      category: "posture",
    },
    {
      title: "Today's Insight",
      text: "Early pain prevention is load management plus precision, not less effort.",
      category: "pain-prevention",
    },
  ],
  2: [
    {
      title: "Today's Insight",
      text: "Your posture adaptations are progressing normally; keep sequencing stable under moderate load.",
      category: "posture",
    },
    {
      title: "Today's Insight",
      text: "Balanced push-pull quality protects shoulder mechanics as intensity rises.",
      category: "movement-quality",
    },
    {
      title: "Today's Insight",
      text: "Progression is strongest when technique consistency stays above effort spikes.",
      category: "progression",
    },
    {
      title: "Today's Insight",
      text: "Pain signals are a routing cue: adjust pattern or range, then keep intent high.",
      category: "pain-prevention",
    },
  ],
  3: [
    {
      title: "Today's Insight",
      text: "Strength gains hold longer when trunk control stays stable through the last reps.",
      category: "movement-quality",
    },
    {
      title: "Today's Insight",
      text: "Your movement efficiency improves when you keep posture tension before load increases.",
      category: "posture",
    },
    {
      title: "Today's Insight",
      text: "Advanced progression favors repeatable quality; recover fast, then progress deliberately.",
      category: "progression",
    },
    {
      title: "Today's Insight",
      text: "Prevent flare-ups by preserving clean mechanics when effort climbs.",
      category: "pain-prevention",
    },
  ],
};

const defaultInsights: Insight[] = [
  {
    title: "Today's Insight",
    text: "Consistency compounds. Small clean sessions create durable progress.",
    category: "progression",
  },
  {
    title: "Today's Insight",
    text: "Control first, intensity second. This keeps adaptation stable.",
    category: "movement-quality",
  },
];

const dailyKey = () => {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function getDailyInsight(seed: string, phaseIndex: number): Insight {
  const normalizedPhase = phaseIndex >= 3 ? 3 : phaseIndex <= 1 ? 1 : 2;
  const pool = PHASED_INSIGHTS[normalizedPhase] ?? defaultInsights;
  const rng = createSeededRng(`${seed}:${normalizedPhase}:${dailyKey()}`);
  const index = Math.floor(rng() * pool.length) % pool.length;
  return pool[index] ?? pool[0] ?? defaultInsights[0];
}
