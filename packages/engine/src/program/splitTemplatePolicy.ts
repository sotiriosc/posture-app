export type SplitTemplateRequirementRule = {
  id: string;
  description: string;
  minCount?: number;
  sections?: unknown[];
};

export type SplitTemplateSpec<
  MainLane extends string = string,
  RequirementRule extends SplitTemplateRequirementRule = SplitTemplateRequirementRule
> = {
  title: string;
  focusTags: string[];
  lanes: MainLane[];
  warmupFocus: "upper" | "lower" | "core";
  cooldownFocus: "upper" | "lower" | "core";
  adaptiveNote?: string;
  constraints: {
    requiredMainPatterns: Array<{ pattern: MainLane; min: number }>;
    requiredMainRules?: RequirementRule[];
    forbiddenMainTags?: string[];
    requiredAccessories?: RequirementRule[];
    optionalRules?: RequirementRule[];
    forbidUpperPushPullOnMainAndAccessory?: boolean;
  };
};

type SplitTemplateRuleSet<RequirementRule extends SplitTemplateRequirementRule> = {
  antiRotationRule: RequirementRule;
  bicepsIsolationRule: RequirementRule;
  calvesRule: RequirementRule;
  carryOrAntiRotationRule: RequirementRule;
  conditioningRule: RequirementRule;
  coreRule: RequirementRule;
  lateralDeltRule: RequirementRule;
  pullBackRule: RequirementRule;
  rowPullMainRule: RequirementRule;
  scapPostureRule: RequirementRule;
  tricepsIsolationRule: RequirementRule;
};

type AdaptiveWeakpointSelectionContext = {
  poseFocusTags: Set<string>;
  painAreas: string[];
  painSeverity: "low" | "medium" | "high";
  intentProfile: {
    needs: {
      needsScapularControl: boolean;
      needsHipHingeRepattern: boolean;
      needsCoreAntiRotation: boolean;
    };
  };
};

type AdaptiveWeakpointDomain = "upperPosture" | "coreStability" | "lowerStability";

type AdaptiveWeakpointPlan<
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
> = {
  domain: AdaptiveWeakpointDomain;
  lanes: MainLane[];
  focusTags: string[];
  requiredMainRules: RequirementRule[];
  requiredAccessories: RequirementRule[];
  optionalRules: RequirementRule[];
  forbiddenMainTags: string[];
  deprioritizedLabel: string;
  weakpointLabel: string;
  overrideMainRules: boolean;
};

export const withAccessorySection = <
  RequirementRule extends SplitTemplateRequirementRule
>(
  baseRule: RequirementRule,
  minCount = 1
): RequirementRule =>
  ({
    ...baseRule,
    id: `${baseRule.id}_accessory`,
    description: `${baseRule.description} accessory`,
    sections: ["accessory"],
    minCount,
  } as RequirementRule);

const dedupeRuleListById = <RequirementRule extends SplitTemplateRequirementRule>(
  rules: RequirementRule[]
) => {
  const byId = new Map<string, RequirementRule>();
  rules.forEach((rule) => {
    if (!byId.has(rule.id)) {
      byId.set(rule.id, rule);
    }
  });
  return Array.from(byId.values());
};

const dedupeStringValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const deriveAdaptiveWeakpointPlan = <
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
>(params: {
  selectionContext: AdaptiveWeakpointSelectionContext;
  normalizeTagToken: (value: string) => string;
  rules: Pick<
    SplitTemplateRuleSet<RequirementRule>,
    | "antiRotationRule"
    | "calvesRule"
    | "carryOrAntiRotationRule"
    | "coreRule"
    | "scapPostureRule"
  >;
}): AdaptiveWeakpointPlan<MainLane, RequirementRule> | null => {
  const { normalizeTagToken, rules, selectionContext } = params;
  const poseTags = selectionContext.poseFocusTags;
  const painAreaTokens = new Set(
    selectionContext.painAreas.map((area) => normalizeTagToken(area))
  );
  const hasUpperPain = ["neck", "shoulders", "upper_back"].some((token) =>
    painAreaTokens.has(token)
  );
  const hasSpinePain = ["lower_back", "low_back"].some((token) =>
    painAreaTokens.has(token)
  );
  const hasLowerPain = ["hips", "knees"].some((token) => painAreaTokens.has(token));
  const hasPoseSignals = poseTags.size > 0;

  let upperScore = 0;
  let coreScore = 0;
  let lowerScore = 0;

  if (
    poseTags.has("scapular_control") ||
    poseTags.has("forward_head") ||
    poseTags.has("thoracic_extension")
  ) {
    upperScore += 2;
    coreScore += 1;
  }
  if (poseTags.has("hip_stability")) {
    lowerScore += 2;
    coreScore += 1;
  }
  if (hasUpperPain) {
    upperScore += 2;
    coreScore += 1;
  }
  if (hasSpinePain) {
    coreScore += 2;
    lowerScore += 1;
  }
  if (hasLowerPain) {
    lowerScore += 2;
    coreScore += 1;
  }
  if (selectionContext.intentProfile.needs.needsScapularControl) upperScore += 1;
  if (selectionContext.intentProfile.needs.needsCoreAntiRotation) coreScore += 1;
  if (selectionContext.intentProfile.needs.needsHipHingeRepattern) lowerScore += 1;
  if (selectionContext.painSeverity === "high") {
    coreScore += 1;
    if (hasUpperPain) upperScore += 1;
    if (hasLowerPain || hasSpinePain) lowerScore += 1;
  }

  const rankedDomains: Array<{ domain: AdaptiveWeakpointDomain; score: number }> = [
    { domain: "coreStability", score: coreScore },
    { domain: "upperPosture", score: upperScore },
    { domain: "lowerStability", score: lowerScore },
  ];
  rankedDomains.sort((left, right) => right.score - left.score);

  const top = rankedDomains[0];
  if (!top) return null;
  const runnerUpScore = rankedDomains[1]?.score ?? 0;
  const decisiveLead = top.score - runnerUpScore >= 2;
  const highPainProfile = selectionContext.painSeverity === "high";
  const mediumPainProfile = selectionContext.painSeverity === "medium";
  const upperEvidence =
    (poseTags.has("scapular_control") ? 1 : 0) +
    (poseTags.has("forward_head") ? 1 : 0) +
    (poseTags.has("thoracic_extension") ? 1 : 0) +
    (hasUpperPain ? 1 : 0) +
    (selectionContext.intentProfile.needs.needsScapularControl ? 1 : 0);
  const coreEvidence =
    (selectionContext.intentProfile.needs.needsCoreAntiRotation ? 1 : 0) +
    (hasSpinePain ? 1 : 0) +
    (poseTags.has("thoracic_extension") ? 1 : 0) +
    (poseTags.has("hip_stability") ? 1 : 0) +
    (selectionContext.intentProfile.needs.needsHipHingeRepattern ? 1 : 0);
  const lowerEvidence =
    (hasLowerPain ? 1 : 0) +
    (hasSpinePain ? 1 : 0) +
    (poseTags.has("hip_stability") ? 1 : 0) +
    (selectionContext.intentProfile.needs.needsHipHingeRepattern ? 1 : 0);
  const evidenceByDomain: Record<AdaptiveWeakpointDomain, number> = {
    upperPosture: upperEvidence,
    coreStability: coreEvidence,
    lowerStability: lowerEvidence,
  };
  const topEvidence = evidenceByDomain[top.domain];
  const shouldAdapt =
    (highPainProfile && top.score >= 4 && topEvidence >= 3 && decisiveLead) ||
    (mediumPainProfile &&
      top.score >= 5 &&
      topEvidence >= 4 &&
      decisiveLead &&
      hasPoseSignals);
  if (!shouldAdapt) return null;
  const overrideMainRules =
    highPainProfile && top.score >= 5 && topEvidence >= 4 && decisiveLead;

  if (top.domain === "upperPosture") {
    return {
      domain: "upperPosture",
      lanes: ["pull", "pull"] as MainLane[],
      focusTags: ["upper-back", "scapular", "posture", "thoracic", "core"],
      requiredMainRules: [rules.scapPostureRule],
      requiredAccessories: [
        withAccessorySection(rules.coreRule, 1),
        withAccessorySection(rules.antiRotationRule, 1),
      ],
      optionalRules: [withAccessorySection(rules.carryOrAntiRotationRule, 1)],
      forbiddenMainTags: ["biceps", "triceps", "chest"],
      deprioritizedLabel: "arm and pressing emphasis",
      weakpointLabel: "scapular + posture control",
      overrideMainRules,
    };
  }
  if (top.domain === "lowerStability") {
    return {
      domain: "lowerStability",
      lanes: ["squat", "hinge"] as MainLane[],
      focusTags: ["lower", "legs", "glutes", "balance", "core", "stability"],
      requiredMainRules: [],
      requiredAccessories: [
        withAccessorySection(rules.coreRule, 1),
        withAccessorySection(rules.calvesRule, 1),
      ],
      optionalRules: [withAccessorySection(rules.antiRotationRule, 1)],
      forbiddenMainTags: ["chest"],
      deprioritizedLabel: "high-fatigue upper-body volume",
      weakpointLabel: "lower-body balance + hip stability",
      overrideMainRules,
    };
  }
  return {
    domain: "coreStability",
    lanes: ["squat", "hinge"] as MainLane[],
    focusTags: ["core", "anti-rotation", "stability", "trunk", "glutes"],
    requiredMainRules: [],
    requiredAccessories: [
      withAccessorySection(rules.coreRule, 1),
      withAccessorySection(rules.antiRotationRule, 1),
    ],
    optionalRules: [withAccessorySection(rules.carryOrAntiRotationRule, 1)],
    forbiddenMainTags: ["biceps", "triceps"],
    deprioritizedLabel: "non-essential isolation volume",
    weakpointLabel: "core alignment + trunk control",
    overrideMainRules,
  };
};

export const applyAdaptiveWeakpointTemplateOverlay = <
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
>(params: {
  templates: SplitTemplateSpec<MainLane, RequirementRule>[];
  daysPerWeek: 3 | 4 | 5;
  selectionContext: AdaptiveWeakpointSelectionContext;
  normalizeTagToken: (value: string) => string;
  rules: Pick<
    SplitTemplateRuleSet<RequirementRule>,
    | "antiRotationRule"
    | "calvesRule"
    | "carryOrAntiRotationRule"
    | "coreRule"
    | "scapPostureRule"
  >;
}): SplitTemplateSpec<MainLane, RequirementRule>[] => {
  const { daysPerWeek, normalizeTagToken, rules, selectionContext, templates } =
    params;
  const adaptivePlan = deriveAdaptiveWeakpointPlan<MainLane, RequirementRule>({
    normalizeTagToken,
    rules,
    selectionContext,
  });
  if (!adaptivePlan) return templates;

  const targetTitlePriority =
    daysPerWeek === 3
      ? adaptivePlan.domain === "lowerStability"
        ? ["Legs + Abs", "Shoulders + Arms"]
        : adaptivePlan.domain === "upperPosture"
        ? ["Back + Chest", "Shoulders + Arms"]
        : ["Legs + Abs", "Shoulders + Arms"]
      : daysPerWeek === 4
      ? adaptivePlan.domain === "lowerStability"
        ? [
            "Lower (Squat Emphasis) + Core",
            "Lower (Hinge Emphasis) + Carry/Anti-rotation",
          ]
        : adaptivePlan.domain === "upperPosture"
        ? ["Upper Pull + Thoracic Posture", "Upper Push + Scapular Control"]
        : [
            "Lower (Hinge Emphasis) + Carry/Anti-rotation",
            "Lower (Squat Emphasis) + Core",
          ]
      : adaptivePlan.domain === "lowerStability"
      ? ["Lower Hinge + Posterior Chain", "Lower Squat"]
      : adaptivePlan.domain === "upperPosture"
      ? ["Arms + Posture + Conditioning", "Upper Pull"]
      : ["Arms + Posture + Conditioning", "Lower Hinge + Posterior Chain"];

  const targetIndex = targetTitlePriority
    .map((title) => templates.findIndex((template) => template.title === title))
    .find((index) => typeof index === "number" && index >= 0);
  if (typeof targetIndex !== "number") return templates;

  const adaptiveNote = adaptivePlan.overrideMainRules
    ? `Adaptive rebalance: ${adaptivePlan.deprioritizedLabel} skipped for this cycle. Replaced with ${adaptivePlan.weakpointLabel} to restore balance.`
    : `Adaptive rebalance: ${adaptivePlan.deprioritizedLabel} de-prioritized this cycle. Emphasis shifted to ${adaptivePlan.weakpointLabel} to restore balance.`;
  const overrideMainRules = daysPerWeek !== 4 && adaptivePlan.overrideMainRules;

  return templates.map((template, index) => {
    if (index !== targetIndex) return template;

    return {
      ...template,
      focusTags: dedupeStringValues([...template.focusTags, ...adaptivePlan.focusTags]),
      adaptiveNote,
      constraints: {
        ...template.constraints,
        requiredMainRules: overrideMainRules
          ? dedupeRuleListById([...adaptivePlan.requiredMainRules])
          : template.constraints.requiredMainRules,
        requiredAccessories: dedupeRuleListById([
          ...(template.constraints.requiredAccessories ?? []),
          ...adaptivePlan.requiredAccessories,
        ]),
        optionalRules: dedupeRuleListById([
          ...(template.constraints.optionalRules ?? []),
          ...adaptivePlan.optionalRules,
        ]),
        forbiddenMainTags: dedupeStringValues([
          ...(template.constraints.forbiddenMainTags ?? []),
          ...adaptivePlan.forbiddenMainTags,
        ]),
      },
    };
  });
};

export const buildRawSplitTemplateSpecs = <
  MainLane extends string,
  RequirementRule extends SplitTemplateRequirementRule
>(
  daysPerWeek: 3 | 4 | 5,
  rules: SplitTemplateRuleSet<RequirementRule>
): SplitTemplateSpec<MainLane, RequirementRule>[] => {
  if (daysPerWeek === 3) {
    return [
      {
        title: "Back + Chest",
        focusTags: ["back", "chest", "fly", "push", "pull"],
        lanes: ["push", "pull", "pull"] as MainLane[],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [
            { pattern: "push" as MainLane, min: 1 },
            { pattern: "pull" as MainLane, min: 2 },
          ],
          requiredAccessories: [
            withAccessorySection(rules.scapPostureRule, 1),
            withAccessorySection(rules.pullBackRule, 1),
          ],
          forbiddenMainTags: ["lateral-delt", "shoulders-isolation"],
          optionalRules: [rules.scapPostureRule],
        },
      },
      {
        title: "Shoulders + Arms",
        focusTags: ["shoulders", "arms", "upper", "lateral_delt", "rear_delt"],
        lanes: ["verticalPush", "push", "pull"] as MainLane[],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [{ pattern: "verticalPush" as MainLane, min: 1 }],
          requiredMainRules: [rules.lateralDeltRule],
          requiredAccessories: [
            withAccessorySection(rules.tricepsIsolationRule, 1),
            withAccessorySection(rules.bicepsIsolationRule, 1),
          ],
          forbiddenMainTags: ["chest", "biceps", "triceps"],
        },
      },
      {
        title: "Legs + Abs",
        focusTags: ["legs", "quads", "hamstrings", "core"],
        lanes: ["squat", "hinge", "squat"] as MainLane[],
        warmupFocus: "lower",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "squat" as MainLane, min: 1 },
            { pattern: "hinge" as MainLane, min: 1 },
          ],
          requiredAccessories: [
            withAccessorySection(rules.coreRule, 1),
            withAccessorySection(rules.calvesRule, 1),
          ],
          forbidUpperPushPullOnMainAndAccessory: true,
        },
      },
    ];
  }

  if (daysPerWeek === 4) {
    return [
      {
        title: "Upper Push + Scapular Control",
        focusTags: ["upper", "push", "shoulders", "triceps", "scapular", "posture"],
        lanes: ["push", "verticalPush"] as MainLane[],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [
            { pattern: "push" as MainLane, min: 1 },
            { pattern: "verticalPush" as MainLane, min: 1 },
          ],
          requiredMainRules: [rules.scapPostureRule],
          requiredAccessories: [withAccessorySection(rules.tricepsIsolationRule, 1)],
          optionalRules: [withAccessorySection(rules.coreRule, 1)],
        },
      },
      {
        title: "Lower (Squat Emphasis) + Core",
        focusTags: ["legs", "lower", "squat", "quads", "core", "anti-rotation"],
        lanes: ["squat", "hinge"] as MainLane[],
        warmupFocus: "lower",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "squat" as MainLane, min: 1 },
            { pattern: "hinge" as MainLane, min: 1 },
          ],
          requiredAccessories: [
            withAccessorySection(rules.coreRule, 1),
            withAccessorySection(rules.calvesRule, 1),
          ],
          forbiddenMainTags: ["push", "chest"],
          forbidUpperPushPullOnMainAndAccessory: true,
        },
      },
      {
        title: "Upper Pull + Thoracic Posture",
        focusTags: ["upper", "pull", "back", "thoracic", "posture", "scapular"],
        lanes: ["pull", "pull"] as MainLane[],
        warmupFocus: "upper",
        cooldownFocus: "upper",
        constraints: {
          requiredMainPatterns: [{ pattern: "pull" as MainLane, min: 2 }],
          requiredMainRules: [rules.scapPostureRule],
          requiredAccessories: [withAccessorySection(rules.bicepsIsolationRule, 1)],
          optionalRules: [withAccessorySection(rules.coreRule, 1)],
        },
      },
      {
        title: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
        focusTags: [
          "legs",
          "lower",
          "hinge",
          "posterior",
          "hamstrings",
          "glutes",
          "core",
          "carry",
          "anti-rotation",
        ],
        lanes: ["hinge", "squat", "hinge"] as MainLane[],
        warmupFocus: "lower",
        cooldownFocus: "core",
        constraints: {
          requiredMainPatterns: [
            { pattern: "hinge" as MainLane, min: 1 },
            { pattern: "squat" as MainLane, min: 1 },
          ],
          forbiddenMainTags: ["push", "chest"],
          requiredAccessories: [
            withAccessorySection(rules.carryOrAntiRotationRule, 1),
          ],
          optionalRules: [withAccessorySection(rules.calvesRule, 1)],
          forbidUpperPushPullOnMainAndAccessory: true,
        },
      },
    ];
  }

  return [
    {
      title: "Upper Push",
      focusTags: ["upper", "push", "chest", "shoulders", "triceps"],
      lanes: ["push", "verticalPush"] as MainLane[],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      constraints: {
        requiredMainPatterns: [
          { pattern: "push" as MainLane, min: 1 },
          { pattern: "verticalPush" as MainLane, min: 1 },
        ],
        forbiddenMainTags: ["lateral-delt", "shoulders-isolation"],
        requiredAccessories: [withAccessorySection(rules.tricepsIsolationRule, 1)],
        optionalRules: [rules.scapPostureRule],
      },
    },
    {
      title: "Lower Squat",
      focusTags: ["lower", "legs", "squat", "quads", "core"],
      lanes: ["squat", "hinge", "squat"] as MainLane[],
      warmupFocus: "lower",
      cooldownFocus: "core",
      constraints: {
        requiredMainPatterns: [
          { pattern: "squat" as MainLane, min: 1 },
          { pattern: "hinge" as MainLane, min: 1 },
        ],
        forbiddenMainTags: ["push", "chest"],
        requiredAccessories: [
          withAccessorySection(rules.coreRule, 1),
          withAccessorySection(rules.calvesRule, 1),
        ],
        forbidUpperPushPullOnMainAndAccessory: true,
      },
    },
    {
      title: "Upper Pull",
      focusTags: ["upper", "pull", "back", "biceps", "posture"],
      lanes: ["pull", "pull"] as MainLane[],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      constraints: {
        requiredMainPatterns: [{ pattern: "pull" as MainLane, min: 2 }],
        requiredMainRules: [rules.scapPostureRule],
        requiredAccessories: [withAccessorySection(rules.bicepsIsolationRule, 1)],
      },
    },
    {
      title: "Lower Hinge + Posterior Chain",
      focusTags: ["lower", "hinge", "posterior", "hamstrings", "glutes", "core"],
      lanes: ["hinge", "squat", "hinge"] as MainLane[],
      warmupFocus: "lower",
      cooldownFocus: "core",
      constraints: {
        requiredMainPatterns: [
          { pattern: "hinge" as MainLane, min: 1 },
          { pattern: "squat" as MainLane, min: 1 },
        ],
        forbiddenMainTags: ["push", "chest"],
        requiredAccessories: [
          withAccessorySection(rules.carryOrAntiRotationRule, 1),
        ],
        optionalRules: [withAccessorySection(rules.calvesRule, 1)],
        forbidUpperPushPullOnMainAndAccessory: true,
      },
    },
    {
      title: "Arms + Posture + Conditioning",
      focusTags: [
        "upper",
        "push",
        "pull",
        "shoulders",
        "arms",
        "posture",
        "conditioning",
      ],
      lanes: ["pull", "verticalPush"] as MainLane[],
      warmupFocus: "upper",
      cooldownFocus: "upper",
      constraints: {
        requiredMainPatterns: [
          { pattern: "pull" as MainLane, min: 1 },
          { pattern: "verticalPush" as MainLane, min: 1 },
        ],
        requiredMainRules: [rules.rowPullMainRule],
        requiredAccessories: [
          withAccessorySection(rules.bicepsIsolationRule, 1),
          withAccessorySection(rules.tricepsIsolationRule, 1),
        ],
        optionalRules: [rules.scapPostureRule, rules.conditioningRule],
      },
    },
  ];
};
