/**
 * Program Quality V2 — Phase 6 coaching completeness audit.
 * Writes program-quality-v2-phase6-* artifacts only (does not overwrite Phase 0–5B).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { allExercises, exerciseById, exercises } from "@/lib/exercises";
import { collectReleaseCriticalExerciseIds } from "@/lib/coaching/releaseCriticalExercises";
import { getExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingRegistry";
import { auditReleaseCriticalCoaching } from "@/lib/coaching/validateExerciseCoaching";
import {
  demoQueuePriorityFor,
  resolveExerciseDemoStatus,
} from "@/lib/coaching/exerciseDemoPolicy";
import { resolveExerciseCoachingViewModel } from "@/lib/coaching/resolveExerciseCoaching";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const AUDIT_MD = path.join(OUT_DIR, "program-quality-v2-phase6-coaching-audit.md");
const AUDIT_JSON = path.join(OUT_DIR, "program-quality-v2-phase6-coaching-audit.json");
const DEMO_QUEUE_MD = path.join(OUT_DIR, "program-quality-v2-phase6-demo-queue.md");

const main = () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const classification = collectReleaseCriticalExerciseIds();
  const audit = auditReleaseCriticalCoaching();

  const demoCounts = {
    available: 0,
    planned: 0,
    notRequired: 0,
  };
  const demoQueue: Array<{
    exerciseId: string;
    name: string;
    priority: string;
    demoRequirement: string;
    why: string;
    setupVisible: string;
    cameraAngle: string;
    essentialRep: string;
    equipment: string;
    views: string;
  }> = [];

  for (const id of classification.releaseCritical) {
    const exercise = exerciseById(id);
    const content = getExerciseCoachingContent(id);
    if (!exercise || !content) continue;
    const status = resolveExerciseDemoStatus({
      exercise,
      demoRequirement: content.demoRequirement,
    });
    demoCounts[status] += 1;
    if (status !== "planned") continue;
    demoQueue.push({
      exerciseId: id,
      name: exercise.name,
      priority: demoQueuePriorityFor(content),
      demoRequirement: content.demoRequirement,
      why:
        content.demoRequirement === "required"
          ? "Complex or non-obvious setup; written coaching passes, but a demo would raise confidence."
          : "Demonstration would clarify setup nuance or progression differences.",
      setupVisible:
        content.anchorSetup?.required
          ? `Show ${content.anchorSetup.height ?? "fixed"} anchor attachment and starting body position.`
          : content.setupSteps[0] ?? "Show starting body and equipment position.",
      cameraAngle:
        content.anchorSetup?.height === "high"
          ? "3/4 front + brief side for elbow path"
          : content.contentComplexity === "complex"
            ? "side and front"
            : "front or 3/4 front",
      essentialRep: content.executionSteps.slice(0, 2).join(" "),
      equipment: (exercise.equipment ?? []).filter((e) => e !== "none").join(", ") || "bodyweight",
      views:
        content.anchorSetup?.required || content.contentComplexity === "complex"
          ? "multiple"
          : "front",
    });
  }

  demoQueue.sort((a, b) => a.priority.localeCompare(b.priority) || a.name.localeCompare(b.name));

  const consumerConsumerParitySample = classification.releaseCritical.slice(0, 12).map((id) => {
    const vm = resolveExerciseCoachingViewModel({ exerciseId: id });
    return {
      exerciseId: id,
      hasPurpose: Boolean(vm?.purpose),
      hasSetup: Boolean(vm?.setupSteps?.length),
      hasExecution: Boolean(vm?.executionSteps?.length),
      primaryCue: vm?.primaryCue ?? null,
      demoStatus: vm?.demo.status ?? null,
      guidanceHref: vm?.guidanceHref ?? null,
    };
  });

  const json = {
    label: "Program Quality V2 — Phase 6 Coaching Completeness",
    catalogCount: allExercises.length,
    activeCatalogCount: exercises.length,
    releaseCriticalCount: classification.releaseCritical.length,
    completeReleaseCriticalCount: audit.completeCount,
    completenessPct: audit.completenessPct,
    catalogOnlyCount: classification.catalogOnly.length,
    deprecated: classification.deprecated,
    legacyCompat: classification.legacyCompat,
    demoCounts,
    requiredDemoBlockers: 0, // Owner Decision: planned videos are not Phase 6 blockers
    byCode: audit.byCode,
    failures: audit.failures,
    missingRegistry: audit.missingRegistry,
    canonicalRegistry: "packages/engine/src/coaching/exerciseCoachingRegistry.ts",
    resolver: "packages/engine/src/coaching/resolveExerciseCoaching.ts",
    paritySample: consumerConsumerParitySample,
    hipAbductionAdductionGap:
      "Catalog hip abduction/adduction gap retained as follow-up — not auto-expanded in Phase 6; not treated as a new exercise redesign.",
  };

  writeFileSync(AUDIT_JSON, `${JSON.stringify(json, null, 2)}\n`, "utf8");

  const md = [
    "# Program Quality V2 — Phase 6 Coaching Audit",
    "",
    "## Summary",
    "",
    `- Catalog (all): **${json.catalogCount}**`,
    `- Active catalog: **${json.activeCatalogCount}**`,
    `- Release-critical: **${json.releaseCriticalCount}**`,
    `- Complete release-critical: **${json.completeReleaseCriticalCount}** (${json.completenessPct}%)`,
    `- Catalog-only / deferred: **${json.catalogOnlyCount}**`,
    `- Deprecated: ${json.deprecated.join(", ") || "none"}`,
    `- Demo status counts: available ${demoCounts.available}, planned ${demoCounts.planned}, notRequired ${demoCounts.notRequired}`,
    `- Required-demo video blockers (Phase 6 Owner Decision): **0** — missing videos are queued, not failed`,
    "",
    "## Canonical locations",
    "",
    `- Registry: \`${json.canonicalRegistry}\``,
    `- Resolver/view-model: \`${json.resolver}\``,
    `- Contract: \`packages/engine/src/coaching/exerciseCoachingContract.ts\``,
    "",
    "## Failure buckets",
    "",
    Object.keys(audit.byCode).length
      ? Object.entries(audit.byCode)
          .map(([code, count]) => `- ${code}: ${count}`)
          .join("\n")
      : "- none",
    "",
    "## Catalog-only deferred sample",
    "",
    classification.catalogOnly
      .slice(0, 40)
      .map((id) => `- \`${id}\``)
      .join("\n") || "- none",
    "",
    "## Consumer/gym content parity sample",
    "",
    "Both apps resolve the same engine view model. Sample:",
    "",
    ...consumerConsumerParitySample.map(
      (row) =>
        `- \`${row.exerciseId}\` cue="${row.primaryCue}" demo=${row.demoStatus} href=${row.guidanceHref}`
    ),
    "",
    "## Hip abduction/adduction gap",
    "",
    json.hipAbductionAdductionGap,
    "",
  ].join("\n");

  writeFileSync(AUDIT_MD, md, "utf8");

  const queueMd = [
    "# Program Quality V2 — Phase 6 Demo Queue",
    "",
    "Future filming/sourcing plan. Missing planned videos are **not** Phase 6 failures.",
    "",
    `| Priority | ID | Name | Why | Setup to show | Camera | Essential sequence | Equipment | Views |`,
    `|---|---|---|---|---|---|---|---|---|`,
    ...demoQueue.map(
      (row) =>
        `| ${row.priority} | \`${row.exerciseId}\` | ${row.name} | ${row.why} | ${row.setupVisible} | ${row.cameraAngle} | ${row.essentialRep} | ${row.equipment} | ${row.views} |`
    ),
    "",
    `Total planned demonstrations: **${demoQueue.length}**`,
    "",
  ].join("\n");

  writeFileSync(DEMO_QUEUE_MD, queueMd, "utf8");

  const pass =
    audit.completenessPct === 100 &&
    audit.missingRegistry.length === 0 &&
    audit.failures.length === 0;

  console.log(
    JSON.stringify(
      {
        pass,
        releaseCritical: classification.releaseCritical.length,
        complete: audit.completeCount,
        pct: audit.completenessPct,
        demoPlanned: demoCounts.planned,
        failures: audit.failures.length,
      },
      null,
      2
    )
  );

  if (!pass) process.exitCode = 1;
};

main();
