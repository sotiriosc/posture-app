"use client";

import { useId, useMemo, useState } from "react";

type ViewSide = "front" | "back";
type Sensation = "Tight" | "Uncomfortable" | "Painful" | "Unstable";
type Severity = "Mild" | "Moderate" | "Severe";

type Region = {
  id: string;
  label: string;
  side: ViewSide;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

const REGIONS: Region[] = [
  { id: "front-neck", label: "Neck", side: "front", cx: 100, cy: 42, rx: 18, ry: 12 },
  { id: "front-l-shoulder", label: "Left shoulder", side: "front", cx: 62, cy: 70, rx: 20, ry: 14 },
  { id: "front-r-shoulder", label: "Right shoulder", side: "front", cx: 138, cy: 70, rx: 20, ry: 14 },
  { id: "front-chest", label: "Chest", side: "front", cx: 100, cy: 95, rx: 28, ry: 18 },
  { id: "front-l-elbow", label: "Left elbow", side: "front", cx: 48, cy: 130, rx: 14, ry: 12 },
  { id: "front-r-elbow", label: "Right elbow", side: "front", cx: 152, cy: 130, rx: 14, ry: 12 },
  { id: "front-core", label: "Core", side: "front", cx: 100, cy: 140, rx: 24, ry: 20 },
  { id: "front-l-hip", label: "Left hip", side: "front", cx: 78, cy: 175, rx: 18, ry: 14 },
  { id: "front-r-hip", label: "Right hip", side: "front", cx: 122, cy: 175, rx: 18, ry: 14 },
  { id: "front-l-knee", label: "Left knee", side: "front", cx: 80, cy: 230, rx: 16, ry: 14 },
  { id: "front-r-knee", label: "Right knee", side: "front", cx: 120, cy: 230, rx: 16, ry: 14 },
  { id: "front-l-ankle", label: "Left ankle", side: "front", cx: 80, cy: 285, rx: 14, ry: 12 },
  { id: "front-r-ankle", label: "Right ankle", side: "front", cx: 120, cy: 285, rx: 14, ry: 12 },
  { id: "back-neck", label: "Neck", side: "back", cx: 100, cy: 42, rx: 18, ry: 12 },
  { id: "back-upper", label: "Upper back", side: "back", cx: 100, cy: 90, rx: 30, ry: 20 },
  { id: "back-l-shoulder", label: "Left shoulder", side: "back", cx: 62, cy: 70, rx: 20, ry: 14 },
  { id: "back-r-shoulder", label: "Right shoulder", side: "back", cx: 138, cy: 70, rx: 20, ry: 14 },
  { id: "back-low", label: "Low back", side: "back", cx: 100, cy: 140, rx: 24, ry: 18 },
  { id: "back-l-glute", label: "Left glute", side: "back", cx: 78, cy: 175, rx: 18, ry: 14 },
  { id: "back-r-glute", label: "Right glute", side: "back", cx: 122, cy: 175, rx: 18, ry: 14 },
  { id: "back-l-ham", label: "Left hamstring", side: "back", cx: 80, cy: 220, rx: 16, ry: 18 },
  { id: "back-r-ham", label: "Right hamstring", side: "back", cx: 120, cy: 220, rx: 16, ry: 18 },
];

const SENSATIONS: Sensation[] = ["Tight", "Uncomfortable", "Painful", "Unstable"];
const SEVERITIES: Severity[] = ["Mild", "Moderate", "Severe"];

const proposedResponse = (
  sensation: Sensation | null,
  severity: Severity | null
): string => {
  if (!sensation || !severity) return "Select sensation and severity for a proposed response.";
  if (sensation === "Painful" && severity === "Severe") {
    return "Proposed: End session — stop and protect this area.";
  }
  if (sensation === "Unstable" || severity === "Severe") {
    return "Proposed: Skip exercise — keep the rest of the session.";
  }
  if (sensation === "Painful" || severity === "Moderate") {
    return "Proposed: Swap exercise — find a more comfortable option.";
  }
  return "Proposed: Make it easier — reduce load or range.";
};

const pillClass = (active: boolean) =>
  `inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
    active
      ? "border-sky-400 bg-sky-500/20 text-sky-50"
      : "border-slate-500/40 bg-slate-900/50 text-slate-200"
  } transition-[border-color,background-color] duration-[180ms] ease-out motion-reduce:transition-none`;

/**
 * Phase 8 prototype only — does NOT persist to production session pain data.
 */
export default function BodyMapPrototype() {
  const titleId = useId();
  const [view, setView] = useState<ViewSide>("front");
  const [mode, setMode] = useState<"map" | "pills">("map");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [sensation, setSensation] = useState<Sensation | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);

  const visibleRegions = useMemo(
    () => REGIONS.filter((r) => r.side === view),
    [view]
  );
  const selectedRegion = REGIONS.find((r) => r.id === regionId) ?? null;
  const preview = proposedResponse(sensation, severity);

  return (
    <div
      className="mx-auto max-w-xl space-y-5 p-4 text-slate-100"
      data-testid="body-map-prototype"
      aria-labelledby={titleId}
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
          Prototype
        </p>
        <h1 id={titleId} className="mt-1 text-2xl font-semibold text-white">
          Body-map discomfort demo
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Demo only — selections are not saved to your training log.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Input mode">
        <button
          type="button"
          className={pillClass(mode === "map")}
          aria-pressed={mode === "map"}
          onClick={() => setMode("map")}
          data-testid="body-map-mode-map"
        >
          Body map
        </button>
        <button
          type="button"
          className={pillClass(mode === "pills")}
          aria-pressed={mode === "pills"}
          onClick={() => setMode("pills")}
          data-testid="body-map-mode-pills"
        >
          Region pills
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Body view">
        <button
          type="button"
          className={pillClass(view === "front")}
          aria-pressed={view === "front"}
          onClick={() => setView("front")}
          data-testid="body-map-view-front"
        >
          Front
        </button>
        <button
          type="button"
          className={pillClass(view === "back")}
          aria-pressed={view === "back"}
          onClick={() => setView("back")}
          data-testid="body-map-view-back"
        >
          Back
        </button>
      </div>

      {mode === "map" ? (
        <svg
          viewBox="0 0 200 320"
          className="mx-auto h-auto w-full max-w-xs"
          role="img"
          aria-label={`Body ${view} view. Select a region.`}
          data-testid="body-map-svg"
        >
          <title>{`Body ${view} silhouette`}</title>
          <ellipse cx="100" cy="28" rx="16" ry="18" fill="#334155" />
          <rect x="88" y="44" width="24" height="16" rx="8" fill="#334155" />
          <path
            d="M55 70 C55 55, 145 55, 145 70 L160 150 C162 170, 150 175, 140 170 L130 175 L130 300 C128 312, 110 312, 108 300 L100 210 L92 300 C90 312, 72 312, 70 300 L70 175 L60 170 C50 175, 38 170, 40 150 Z"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="2"
          />
          {visibleRegions.map((region) => {
            const active = region.id === regionId;
            return (
              <g key={region.id}>
                <ellipse
                  cx={region.cx}
                  cy={region.cy}
                  rx={region.rx}
                  ry={region.ry}
                  fill={active ? "rgba(56,189,248,0.45)" : "rgba(148,163,184,0.22)"}
                  stroke={active ? "#38bdf8" : "#94a3b8"}
                  strokeWidth={active ? 2.5 : 1.5}
                  className="cursor-pointer transition-[fill,stroke] duration-[180ms] motion-reduce:transition-none"
                  tabIndex={0}
                  role="button"
                  aria-label={region.label}
                  aria-pressed={active}
                  data-testid={`body-map-region-${region.id}`}
                  onClick={() => setRegionId(region.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setRegionId(region.id);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      ) : (
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Body regions"
          data-testid="body-map-pill-fallback"
        >
          {visibleRegions.map((region) => (
            <button
              key={region.id}
              type="button"
              role="listitem"
              className={pillClass(region.id === regionId)}
              aria-pressed={region.id === regionId}
              onClick={() => setRegionId(region.id)}
              data-testid={`body-map-pill-${region.id}`}
            >
              {region.label}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-slate-300" data-testid="body-map-selected-region">
        Region: {selectedRegion?.label ?? "None selected"}
        {selectedRegion ? ` (${view})` : ""}
      </p>

      <fieldset>
        <legend className="text-sm font-semibold text-white">Sensation</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SENSATIONS.map((value) => (
            <button
              key={value}
              type="button"
              className={pillClass(sensation === value)}
              aria-pressed={sensation === value}
              onClick={() => setSensation(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-white">Severity</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SEVERITIES.map((value) => (
            <button
              key={value}
              type="button"
              className={pillClass(severity === value)}
              aria-pressed={severity === value}
              onClick={() => setSeverity(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <div
        className="rounded-lg border border-slate-500/40 bg-slate-900/60 px-3 py-3"
        data-testid="body-map-proposed-response"
        role="status"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Proposed response preview
        </p>
        <p className="mt-1 text-sm text-slate-100">{preview}</p>
        <p className="mt-2 text-xs text-slate-400">
          Actions are not wired to production session behavior in Phase 8.
        </p>
      </div>
    </div>
  );
}
