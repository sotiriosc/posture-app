export type WarmupCapabilityMode = "noneOnly" | "bandOnly" | "hasLoad";

export type DayIntent = {
  dayName: string;
  movement: {
    pullMain: boolean;
    pushMain: boolean;
    hingeMain: boolean;
    squatMain: boolean;
    overhead: boolean;
    core: boolean;
    carries: boolean;
  };
  emphasis: {
    hips: boolean;
    shoulders: boolean;
    tSpine: boolean;
    ankles: boolean;
  };
};

export type WarmupContractRule = {
  id: string;
  section: "warmup" | "activation";
  candidateBlockIds: string[];
  tags: string[];
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const toTokenSet = (text: string) =>
  new Set(
    text
      .split(/[\s+/_-]+/)
      .map(normalizeToken)
      .filter(Boolean)
  );

export const isLegDayIntent = (intent: DayIntent) =>
  intent.movement.hingeMain || intent.movement.squatMain;

export const isBackChestIntent = (intent: DayIntent) => {
  const dayNameTokens = toTokenSet(intent.dayName);
  const explicitBackChest =
    dayNameTokens.has("back") && (dayNameTokens.has("chest") || dayNameTokens.has("push"));
  const shoulderArmNamedDay =
    dayNameTokens.has("shoulders") ||
    dayNameTokens.has("shoulder") ||
    dayNameTokens.has("arms") ||
    dayNameTokens.has("arm");
  return (
    explicitBackChest ||
    (!shoulderArmNamedDay &&
      !intent.movement.overhead &&
      intent.movement.pullMain &&
      intent.movement.pushMain &&
      !intent.movement.hingeMain &&
      !intent.movement.squatMain)
  );
};

export const isShoulderIntent = (intent: DayIntent) => {
  const dayNameTokens = toTokenSet(intent.dayName);
  return (
    intent.movement.overhead ||
    (intent.emphasis.shoulders && !isBackChestIntent(intent) && !isLegDayIntent(intent)) ||
    dayNameTokens.has("shoulders") ||
    dayNameTokens.has("shoulder")
  );
};

export const isCoreStabilityIntent = (intent: DayIntent) => {
  const dayNameTokens = toTokenSet(intent.dayName);
  return (
    intent.movement.core ||
    intent.movement.carries ||
    dayNameTokens.has("core") ||
    dayNameTokens.has("abs") ||
    dayNameTokens.has("stability")
  );
};

const getGlobalMobilityBlockOrder = (intent: DayIntent): string[] => {
  if (isLegDayIntent(intent) || intent.emphasis.hips || intent.emphasis.ankles) {
    return ["hip-opener-rotation", "ankle-dorsiflexion-prep", "t-spine-mobility"];
  }
  if (isShoulderIntent(intent) || intent.emphasis.shoulders) {
    return ["shoulder-scap-prep", "t-spine-mobility", "hip-opener-rotation"];
  }
  if (isCoreStabilityIntent(intent) || intent.emphasis.tSpine) {
    return ["t-spine-mobility", "hip-opener-rotation", "shoulder-scap-prep"];
  }
  return ["t-spine-mobility", "hip-opener-rotation", "shoulder-scap-prep"];
};

const getGlobalActivationBlockOrder = (intent: DayIntent): string[] => {
  if (isLegDayIntent(intent)) {
    return ["glute-activation", "core-brace-patterning", "hinge-patterning"];
  }
  if (isShoulderIntent(intent)) {
    return ["serratus-upward-rotation-prep", "core-brace-patterning"];
  }
  if (isCoreStabilityIntent(intent)) {
    return ["core-brace-patterning", "anti-rotation"];
  }
  return ["core-brace-patterning", "row-push-rehearsal", "glute-activation"];
};

const dedupeRules = (rules: WarmupContractRule[]) => {
  const seen = new Set<string>();
  return rules.filter((rule) => {
    if (seen.has(rule.id)) return false;
    seen.add(rule.id);
    return true;
  });
};

export const resolveWarmupContractRules = (
  intent: DayIntent,
  _capability: WarmupCapabilityMode
) => {
  const rules: WarmupContractRule[] = [
    {
      id: "global-general",
      section: "warmup",
      candidateBlockIds: ["global-general"],
      tags: ["general"],
    },
    {
      id: "global-mobility",
      section: "warmup",
      candidateBlockIds: getGlobalMobilityBlockOrder(intent),
      tags: ["mobility"],
    },
    {
      id: "global-activation",
      section: "activation",
      candidateBlockIds: getGlobalActivationBlockOrder(intent),
      tags: ["activation"],
    },
  ];

  if (isLegDayIntent(intent)) {
    rules.push(
      {
        id: "legs-hip-opener",
        section: "warmup",
        candidateBlockIds: ["hip-opener-rotation"],
        tags: ["hip_opener"],
      },
      {
        id: "legs-ankle-prep",
        section: "warmup",
        candidateBlockIds: ["ankle-dorsiflexion-prep"],
        tags: ["ankles", "dorsiflexion"],
      },
      {
        id: "legs-glute-activation",
        section: "activation",
        candidateBlockIds: ["glute-activation"],
        tags: ["glutes", "activation"],
      },
      {
        id: "legs-pattern-rehearsal",
        section: "warmup",
        candidateBlockIds: intent.movement.hingeMain
          ? ["hinge-patterning", "squat-patterning"]
          : ["squat-patterning", "hinge-patterning"],
        tags: ["patterning"],
      }
    );
  }

  if (isBackChestIntent(intent)) {
    rules.push(
      {
        id: "backchest-scap-prep",
        section: "warmup",
        candidateBlockIds: ["shoulder-scap-prep", "serratus-upward-rotation-prep"],
        tags: ["scap_prep"],
      },
      {
        id: "backchest-thoracic-opener",
        section: "warmup",
        candidateBlockIds: ["t-spine-mobility", "shoulder-scap-prep"],
        tags: ["t_spine"],
      },
      {
        id: "backchest-row-or-push-rehearsal",
        section: "activation",
        candidateBlockIds: ["row-push-rehearsal", "serratus-upward-rotation-prep"],
        tags: ["rehearsal"],
      }
    );
  }

  if (isShoulderIntent(intent)) {
    rules.push(
      {
        id: "shoulders-cars-and-scap",
        section: "warmup",
        candidateBlockIds: ["shoulder-scap-prep"],
        tags: ["scapular", "shoulders"],
      },
      {
        id: "shoulders-serratus",
        section: "activation",
        candidateBlockIds: ["serratus-upward-rotation-prep"],
        tags: ["serratus"],
      },
      {
        id: "shoulders-rotator-cuff",
        section: "activation",
        candidateBlockIds: ["rotator-cuff-prep"],
        tags: ["rotator_cuff", "external_rotation"],
      }
    );
  }

  if (isCoreStabilityIntent(intent)) {
    rules.push(
      {
        id: "core-anti-rotation",
        section: "activation",
        candidateBlockIds: ["anti-rotation"],
        tags: ["anti_rotation"],
      },
      {
        id: "core-brace",
        section: "activation",
        candidateBlockIds: ["core-brace-patterning"],
        tags: ["tva", "brace"],
      }
    );
  }

  return dedupeRules(rules);
};

export const resolveCooldownBlockOrder = (intent: DayIntent) => {
  if (isLegDayIntent(intent)) {
    return ["cooldown-lower", "cooldown-core"];
  }
  if (isShoulderIntent(intent) || isBackChestIntent(intent)) {
    return ["cooldown-upper", "cooldown-core"];
  }
  if (isCoreStabilityIntent(intent)) {
    return ["cooldown-core", "cooldown-lower"];
  }
  return ["cooldown-core", "cooldown-upper", "cooldown-lower"];
};
