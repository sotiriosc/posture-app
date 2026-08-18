"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  isOwnerAvailableTrainingDays,
  OWNER_AVAILABLE_TRAINING_DAYS,
  type OwnerGetStrongerProfileRevision,
  type ProposedOwnerImportFact,
} from "@praxis/training-engine-v2";
import styles from "./owner-v2.module.css";

const CAPABILITIES = ["commercial_gym", "bodyweight", "dumbbells", "adjustable_bench", "barbell_rack",
  "cables", "bands", "selectorized_machines", "pull_up_station", "wall"] as const;

export default function OwnerProfileClient(input: {
  readonly profile: OwnerGetStrongerProfileRevision | null;
  readonly proposedFacts: readonly ProposedOwnerImportFact[];
  readonly csrf: Readonly<Record<string, string>>;
  readonly canApply: boolean;
}) {
  const router = useRouter();
  const profile = input.profile;
  const [days, setDays] = useState<number>(profile?.daysPerWeek ?? 3);
  const [unknownMinutes, setUnknownMinutes] = useState(profile?.sessionMinutes.status === "explicit_unknown");
  const [minutes, setMinutes] = useState(profile?.sessionMinutes.status === "known" ? profile.sessionMinutes.minutes : 45);
  const [environment, setEnvironment] = useState(profile?.equipmentCapabilitySnapshot.environment ?? "commercial_gym");
  const [capabilities, setCapabilities] = useState<string[]>([...(profile?.equipmentCapabilitySnapshot.capabilityIds ??
    ["commercial_gym", "dumbbells", "adjustable_bench"])]);
  const [experience, setExperience] = useState(profile?.coarseExperience ?? "beginner");
  const [painConfirmed, setPainConfirmed] = useState(profile?.painContext.confirmed ?? false);
  const [safetyConfirmed, setSafetyConfirmed] = useState(profile?.trainingSafety === "clear");
  const [assessmentReferences, setAssessmentReferences] = useState<string[]>(
    [...(profile?.assessmentReferences ?? [])]);
  const [painFactIds, setPainFactIds] = useState<string[]>([...(profile?.painContext.sourceFactIds ?? [])]);
  const [consent, setConsent] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const mutate = async (url: string, family: string, body: unknown, idempotency = false) => fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json", "x-praxis-owner-csrf": input.csrf[family] ?? "",
      ...(idempotency ? { "Idempotency-Key": crypto.randomUUID() } : {}) }, body: JSON.stringify(body),
  });

  const save = async () => {
    setWorking(true); setMessage("");
    try {
      const enrollment = await mutate("/api/training/v2-owner/enrollment", "enrollment", {
        explicitConsent: consent, permission: input.canApply ? "apply_allowed" : "preview_only" });
      if (!enrollment.ok) throw new Error("Enrollment could not be saved.");
      const response = await mutate("/api/training/v2-owner/profile", "profile", {
        daysPerWeek: days,
        sessionMinutes: unknownMinutes ? { status: "explicit_unknown", minutes: null } :
          { status: "known", minutes }, equipmentEnvironment: environment, capabilityIds: capabilities,
        coarseExperience: experience, painConfirmed, safetyConfirmed,
        assessmentReferences, painFactIds,
      });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Profile could not be saved.");
      setMessage("Profile revision saved.");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Profile could not be saved."); }
    finally { setWorking(false); }
  };

  const generate = async () => {
    setWorking(true); setMessage("");
    try {
      const response = await mutate("/api/training/v2-owner/preview", "preview", {}, true);
      const payload = await response.json() as { previewId?: string; error?: { message?: string } };
      if (!response.ok || !payload.previewId) throw new Error(payload.error?.message ?? "Preview could not be generated.");
      router.push(`/account/praxis-v2/preview/${encodeURIComponent(payload.previewId)}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Preview could not be generated."); }
    finally { setWorking(false); }
  };

  const proposedAssessmentReferences = new Set(input.proposedFacts.flatMap((fact) =>
    fact.field === "assessment_reference" && typeof fact.structuredValue === "string" ?
      [fact.structuredValue] : []));
  const staleAssessmentReferences = assessmentReferences.filter((reference) =>
    !proposedAssessmentReferences.has(reference));
  const proposedPainFacts = input.proposedFacts.filter((fact) => fact.field === "pain_region");
  const proposedPainFactIds = new Set(proposedPainFacts.map((fact) => fact.factId));
  const stalePainFactIds = painFactIds.filter((factId) => !proposedPainFactIds.has(factId));
  const allPainFactsConfirmed = proposedPainFacts.every((fact) => painFactIds.includes(fact.factId)) &&
    stalePainFactIds.length === 0;
  const availabilityConfirmed = isOwnerAvailableTrainingDays(days);
  const persistedAvailabilityConfirmed = profile ? isOwnerAvailableTrainingDays(profile.daysPerWeek) : false;

  return <>
    <section className={styles.section}>
      <h2>Training profile</h2>
      <div className={styles.grid}>
        <div className={styles.field}><label htmlFor="owner-goal">Goal</label><input id="owner-goal" value="Get stronger" disabled /></div>
        <div className={styles.field}><label htmlFor="owner-mode">Mode</label><input id="owner-mode" value="Develop" disabled /></div>
        <div className={styles.field}><label htmlFor="owner-days">Days per week</label>
          <select id="owner-days" value={days} onChange={(event) => setDays(Number(event.target.value))}>
            {!availabilityConfirmed && <option value={days} disabled>{days} (reconfirmation required)</option>}
            {OWNER_AVAILABLE_TRAINING_DAYS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select></div>
        <div className={styles.field}><label htmlFor="owner-minutes">Minutes per session</label>
          <input id="owner-minutes" type="number" min={15} max={180} step={5} disabled={unknownMinutes}
            value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></div>
      </div>
      <label className={styles.check}><input type="checkbox" checked={unknownMinutes}
        onChange={(event) => setUnknownMinutes(event.target.checked)} /><span>Session duration is unknown</span></label>
    </section>
    <section className={styles.section}>
      <h2>Equipment</h2>
      <div className={styles.field}><label htmlFor="owner-environment">Environment</label>
        <select id="owner-environment" value={environment} onChange={(event) =>
          setEnvironment(event.target.value as "home" | "commercial_gym" | "mixed")}>
          <option value="commercial_gym">Commercial gym</option><option value="home">Home</option>
          <option value="mixed">Mixed</option>
        </select></div>
      <fieldset><legend className={styles.legend}>Confirmed capabilities</legend><div className={styles.choices}>
        {CAPABILITIES.map((capability) => <label className={styles.check} key={capability}>
          <input type="checkbox" checked={capabilities.includes(capability)} onChange={(event) => setCapabilities((current) =>
            event.target.checked ? [...new Set([...current, capability])] : current.filter((entry) => entry !== capability))} />
          <span>{capability.replaceAll("_", " ")}</span></label>)}
      </div></fieldset>
    </section>
    <section className={styles.section}>
      <h2>Readiness</h2>
      <div className={styles.field}><label htmlFor="owner-experience">Experience</label>
        <select id="owner-experience" value={experience} onChange={(event) =>
          setExperience(event.target.value as "beginner" | "intermediate" | "advanced")}>
          <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select></div>
      <label className={styles.check}><input type="checkbox" checked={painConfirmed}
        onChange={(event) => setPainConfirmed(event.target.checked)} /><span>Pain and limitations reviewed</span></label>
      <label className={styles.check}><input type="checkbox" checked={safetyConfirmed}
        onChange={(event) => setSafetyConfirmed(event.target.checked)} /><span>Availability and training Safety confirmed</span></label>
    </section>
    <section className={styles.section}>
      <h2>Current Product facts</h2>
      <ul className={styles.facts}>{input.proposedFacts.map((fact) => <li className={styles.fact} key={fact.factId}>
        {fact.field === "pain_region" && typeof fact.structuredValue === "string" ?
          <label className={styles.check}><input type="checkbox"
            checked={painFactIds.includes(fact.factId)}
            onChange={(event) => setPainFactIds((current) => event.target.checked ?
              [...new Set([...current, fact.factId])] : current.filter((entry) => entry !== fact.factId))} />
            <span>Pain region: {fact.structuredValue}</span>
          </label> : fact.field === "assessment_reference" && typeof fact.structuredValue === "string" ?
          <label className={styles.check}><input type="checkbox"
            checked={assessmentReferences.includes(fact.structuredValue)}
            onChange={(event) => setAssessmentReferences((current) => event.target.checked ?
              [...new Set([...current, fact.structuredValue as string])] :
              current.filter((entry) => entry !== fact.structuredValue))} />
            <span>{fact.structuredValue.replace("assessment:observation:", "Assessment: ").replaceAll("-", " ")}</span>
          </label> : <span>{fact.field.replaceAll("_", " ")}</span>}
        <span className={styles.status}>{fact.status.replaceAll("_", " ")}</span>
      </li>)}{stalePainFactIds.map((factId) => <li className={styles.fact} key={factId}>
        <label className={styles.check}><input type="checkbox" checked
          onChange={() => setPainFactIds((current) => current.filter((entry) => entry !== factId))} />
          <span>Previously confirmed pain fact</span>
        </label><span className={styles.status}>stale - remove to save</span>
      </li>)}{staleAssessmentReferences.map((reference) => <li className={styles.fact} key={reference}>
        <label className={styles.check}><input type="checkbox" checked
          onChange={() => setAssessmentReferences((current) => current.filter((entry) => entry !== reference))} />
          <span>{reference.replace("assessment:observation:", "Assessment: ").replaceAll("-", " ")}</span>
        </label><span className={styles.status}>stale - remove to save</span>
      </li>)}</ul>
    </section>
    <label className={styles.check}><input type="checkbox" checked={consent}
      onChange={(event) => setConsent(event.target.checked)} /><span>Enroll in controlled Praxis V2 owner delivery</span></label>
    <div className={styles.actions}>
      <button className={styles.button} type="button" disabled={working || !consent || !painConfirmed ||
        !allPainFactsConfirmed || !safetyConfirmed || !capabilities.length || !availabilityConfirmed}
        onClick={() => void save()}>Save profile</button>
      <button className={`${styles.button} ${styles.buttonSecondary}`} type="button"
        disabled={working || !profile || !persistedAvailabilityConfirmed}
        onClick={() => void generate()}>Generate preview</button>
    </div>
    <p aria-live="polite" className={styles.muted}>{message}</p>
  </>;
}
