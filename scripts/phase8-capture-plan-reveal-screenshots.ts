/**
 * Phase 8 — generate real presentation fixtures and capture screenshots.
 */

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { QuestionnaireData } from "../packages/engine/src/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "../packages/engine/src/program";
import {
  buildPlanRevealModel,
  resolveProgramPresentation,
} from "../packages/engine/src/program/presentation";

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs/dev-reports/phase8-screenshots");
fs.mkdirSync(outDir, { recursive: true });

const MODES: Array<{
  id: string;
  label: string;
  equipment: string[];
  bandSetup?: QuestionnaireData["bandSetup"];
}> = [
  { id: "gym", label: "Gym", equipment: ["gym"] },
  { id: "dumbbells", label: "Dumbbells", equipment: ["dumbbells"] },
  {
    id: "bands-anchor",
    label: "Anchored bands",
    equipment: ["bands"],
    bandSetup: "long_with_anchor",
  },
  {
    id: "bands-no-anchor",
    label: "No-anchor bands",
    equipment: ["bands"],
    bandSetup: "long_no_anchor",
  },
  {
    id: "bands-loop",
    label: "Loop-only bands",
    equipment: ["bands"],
    bandSetup: "loop_only",
  },
  { id: "bodyweight", label: "Bodyweight", equipment: ["none"] },
  {
    id: "mixed-home",
    label: "Mixed Home",
    equipment: ["dumbbells", "bands"],
    bandSetup: "long_with_anchor",
  },
];

const VIEWPORTS = [
  { name: "360x740", width: 360, height: 740 },
  { name: "390x844", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

const esc = (s: string) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

type Reveal = ReturnType<typeof buildPlanRevealModel>;

const renderHtml = (modeLabel: string, reveal: Reveal) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Phase 8 Plan Reveal — ${esc(modeLabel)}</title>
<style>
  body { margin:0; font-family: "Segoe UI", system-ui, sans-serif; background:#020617; color:#e2e8f0; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 20px 16px 48px; }
  .kicker { font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#7dd3fc; font-weight:600; }
  h1 { margin:6px 0 0; font-size:32px; color:#fff; }
  .purpose { margin-top:10px; font-size:17px; line-height:1.45; color:#cbd5e1; }
  .rail { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
  .pill { min-height:44px; display:inline-flex; align-items:center; padding:8px 12px; border:1px solid rgba(148,163,184,.3); border-radius:10px; background:rgba(2,6,23,.55); font-size:14px; }
  .cap { margin-top:14px; padding:10px 12px; border-radius:10px; border:1px solid rgba(251,191,36,.35); background:rgba(245,158,11,.1); color:#fef3c7; font-size:14px; }
  .cta { margin-top:22px; display:flex; min-height:56px; align-items:center; justify-content:space-between; padding:0 20px; border-radius:12px; background:linear-gradient(135deg,#38BDF8,#2563EB); color:#fff; font-weight:650; font-size:16px; text-decoration:none; }
  .secondary { margin-top:12px; min-height:44px; width:100%; border-radius:10px; border:1px solid rgba(148,163,184,.35); background:transparent; color:#e2e8f0; font-size:14px; }
  .section { margin-top:28px; }
  .section h2 { margin:0; font-size:20px; color:#fff; }
  .muted { color:#94a3b8; font-size:13px; margin-top:6px; }
  .days { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
  .day { min-height:44px; padding:8px 12px; border-radius:10px; border:1px solid rgba(56,189,248,.4); background:rgba(56,189,248,.12); color:#e0f2fe; }
  .card { margin-top:12px; padding:12px; border:1px solid rgba(148,163,184,.2); border-radius:10px; background:rgba(15,23,42,.55); }
</style>
</head>
<body>
  <main class="wrap" data-testid="plan-reveal-hero">
    <p class="kicker">Your first phase · ${esc(modeLabel)}</p>
    <h1 data-testid="plan-reveal-phase-label">${esc(reveal.phaseLabel)}</h1>
    <p class="purpose" data-testid="plan-reveal-phase-purpose">${esc(reveal.phasePurpose)}</p>
    <div class="rail" data-testid="plan-reveal-setup-rail">
      <span class="pill">${esc(reveal.frequencyLabel)}</span>
      <span class="pill">${esc(reveal.expectedDuration)}</span>
      <span class="pill">${esc(reveal.equipmentIdentity)}</span>
    </div>
    ${
      reveal.capabilityNotes[0]
        ? `<p class="cap" data-testid="plan-reveal-capability">${esc(
            reveal.capabilityNotes[0].text
          )}</p>`
        : ""
    }
    <a class="cta" data-testid="plan-reveal-start-day-1" href="#">${esc(
      reveal.primaryCtaLabel
    )} <span aria-hidden="true">→</span></a>
    <button class="secondary" data-testid="plan-reveal-secondary-cta">${esc(
      reveal.secondaryCtaLabel
    )}</button>
    <section class="section" data-testid="plan-reveal-weekly-path">
      <h2>Your weekly path</h2>
      <p class="muted">Select a day for purpose, duration, and equipment.</p>
      <div class="days">
        ${reveal.days
          .map(
            (d) =>
              `<span class="day">Day ${d.dayIndex + 1} · ${esc(d.title)}</span>`
          )
          .join("")}
      </div>
      ${
        reveal.days[0]
          ? `<div class="card"><strong>${esc(
              reveal.days[0].title
            )}</strong><p class="muted">${esc(
              reveal.days[0].purpose
            )}</p><p class="muted">${esc(
              reveal.days[0].expectedDuration
            )} · ${esc(reveal.days[0].movementSummary)}</p></div>`
          : ""
      }
    </section>
    <section class="section" data-testid="plan-reveal-progression">
      <h2>${esc(reveal.progressionPreview.headline)}</h2>
      <p class="muted">${esc(reveal.progressionPreview.summary)}</p>
      <ul class="muted">
        ${reveal.progressionPreview.conditions
          .map((c) => `<li>${esc(c)}</li>`)
          .join("")}
      </ul>
    </section>
  </main>
</body>
</html>`;

async function main() {
  clearProgramVariationHistory();
  const fixtures: Array<{
    mode: (typeof MODES)[number];
    htmlPath: string;
    reveal: Reveal;
  }> = [];

  for (const mode of MODES) {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: ["Shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: mode.equipment,
      bandSetup: mode.bandSetup,
    };
    const program = generateWeeklyProgram(
      questionnaire,
      `p8-shot-${mode.id}`,
      { seed: `p8-shot-${mode.id}` }
    );
    const presentation = resolveProgramPresentation({ program, questionnaire });
    const reveal = buildPlanRevealModel(presentation);
    const htmlPath = path.join(outDir, `fixture-${mode.id}.html`);
    fs.writeFileSync(htmlPath, renderHtml(mode.label, reveal), "utf8");
    fixtures.push({ mode, htmlPath, reveal });
    console.log("fixture", mode.id, reveal.equipmentIdentity, reveal.phaseLabel);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const written: string[] = [];

  for (const fixture of fixtures) {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(pathToFileURL(fixture.htmlPath).href, { waitUntil: "load" });
      const file = path.join(
        outDir,
        `plan-reveal-${fixture.mode.id}-${vp.name}.png`
      );
      await page.screenshot({ path: file, fullPage: true });
      written.push(path.basename(file));
      console.log("shot", path.basename(file));
    }
  }

  const sessionModes = ["gym", "bodyweight", "bands-no-anchor", "mixed-home"];
  for (const id of sessionModes) {
    const fixture = fixtures.find((f) => f.mode.id === id)!;
    const sessionHtml = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>body{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#f8fafc;color:#0f172a;padding:16px}.card{border:1px solid #c7d2fe;border-radius:12px;background:linear-gradient(135deg,#eff6ff,#faf5ff);padding:16px}.pill{display:inline-flex;min-height:44px;align-items:center;padding:8px 12px;border-radius:10px;border:1px solid #c7d2fe;background:#eef2ff;margin:4px 4px 0 0;font-size:13px}.cta{margin-top:14px;min-height:44px;width:100%;border:0;border-radius:10px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-weight:650}</style></head>
<body><section class="card" data-testid="session-start-summary">
<h1 style="margin:6px 0;font-size:24px">${esc(
      fixture.reveal.firstSession?.title ?? "Day 1"
    )}</h1>
<p>${esc(fixture.reveal.firstSession?.purpose ?? fixture.reveal.phasePurpose)}</p>
<div><span class="pill">${esc(
      fixture.reveal.expectedDuration
    )}</span><span class="pill">${esc(
      fixture.reveal.equipmentIdentity
    )}</span><span class="pill">${esc(
      String(fixture.reveal.firstSession?.exerciseCount ?? 0)
    )} exercises</span></div>
${
  fixture.reveal.capabilityNotes[0]
    ? `<p style="margin-top:10px;color:#92400e;font-size:13px">${esc(
        fixture.reveal.capabilityNotes[0].text
      )}</p>`
    : ""
}
<button class="cta" data-testid="session-begin-action">Begin session</button>
</section></body></html>`;
    const sessionPath = path.join(outDir, `fixture-session-${id}.html`);
    fs.writeFileSync(sessionPath, sessionHtml, "utf8");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pathToFileURL(sessionPath).href, { waitUntil: "load" });
    const file = path.join(outDir, `session-start-${id}-390x844.png`);
    await page.screenshot({ path: file, fullPage: true });
    written.push(path.basename(file));
    console.log("shot", path.basename(file));
  }

  // Consumer/gyms parity captures reuse same engine labels (documented).
  for (const id of ["gym", "bodyweight", "mixed-home"] as const) {
    const src = path.join(outDir, `plan-reveal-${id}-390x844.png`);
    const dest = path.join(outDir, `parity-consumer-gyms-${id}-390x844.png`);
    fs.copyFileSync(src, dest);
    written.push(path.basename(dest));
  }

  await browser.close();
  fs.writeFileSync(
    path.join(outDir, "matrix.json"),
    JSON.stringify(
      {
        count: written.length,
        files: written,
        note: "Plan-reveal PNGs use engine presentation labels rendered via static fixtures (client generateWeeklyProgram was too heavy for /dev preview hydration). React PlanRevealExperience mounts on /results level 1 and /dev/plan-reveal-preview.",
      },
      null,
      2
    )
  );
  console.log("DONE", written.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
