"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  currentOwnerEquipmentAvailabilityAnswer,
  currentOwnerEquipmentLoadCeiling,
  isOwnerAvailableTrainingDays,
  OWNER_AVAILABLE_TRAINING_DAYS,
  type OwnerGetStrongerProfileRevision,
  type OwnerProfilePreflight,
  type OwnerProfilePreflightAnswerSubmission,
  type ProposedOwnerImportFact,
} from "@praxis/training-engine-v2";
import styles from "./owner-v2.module.css";

type ReviewDraft = { readonly questionRevisionId: string; readonly answer: string;
  readonly value?: string; readonly unit?: "kg" | "lb" };

const ANSWER_LABELS: Readonly<Record<string, string>> = Object.freeze({
  yes: "Yes, confirmed", no: "No, unavailable", not_sure: "Not sure", not_reviewed: "Not yet reviewed",
  unavailable: "Unavailable",
});

export default function OwnerProfileClient(input: {
  readonly profile: OwnerGetStrongerProfileRevision | null;
  readonly proposedFacts: readonly ProposedOwnerImportFact[];
  readonly preflight: OwnerProfilePreflight | null;
  readonly csrf: Readonly<Record<string, string>>;
  readonly canApply: boolean;
}) {
  const router = useRouter();
  const profile = input.profile;
  const [days, setDays] = useState<number>(profile?.daysPerWeek ?? 3);
  const [unknownMinutes, setUnknownMinutes] = useState(profile?.sessionMinutes.status === "explicit_unknown");
  const [minutes, setMinutes] = useState(profile?.sessionMinutes.status === "known" ? profile.sessionMinutes.minutes : 45);
  const [environment, setEnvironment] = useState(profile?.equipmentCapabilitySnapshot.environment ?? "commercial_gym");
  const [capabilities] = useState<string[]>([...(profile?.equipmentCapabilitySnapshot.capabilityIds ?? [])]);
  const [experience, setExperience] = useState(profile?.coarseExperience ?? "beginner");
  const [painConfirmed, setPainConfirmed] = useState(profile?.painContext.confirmed ?? false);
  const [safetyConfirmed, setSafetyConfirmed] = useState(profile?.trainingSafety === "clear");
  const [assessmentReferences, setAssessmentReferences] = useState<string[]>(
    [...(profile?.assessmentReferences ?? [])]);
  const [painFactIds, setPainFactIds] = useState<string[]>([...(profile?.painContext.sourceFactIds ?? [])]);
  const [consent, setConsent] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, ReviewDraft>>(() =>
    Object.fromEntries((input.preflight?.questions ?? []).flatMap((question) => question.currentAnswer ? [[
      question.questionId, { questionRevisionId: question.questionRevisionId, answer: question.currentAnswer,
        ...(question.responseType === "load_ceiling" ? { unit: "kg" as const } : {}) },
    ]] : [])));

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

  const saveReview = async () => {
    if (!input.preflight) return;
    const answers = input.preflight.questions.flatMap((question): OwnerProfilePreflightAnswerSubmission[] => {
      const storedDraft = reviewAnswers[question.questionId];
      const draft = storedDraft?.questionRevisionId === question.questionRevisionId ? storedDraft : undefined;
      if (!draft?.answer) return [];
      if (question.responseType === "load_ceiling" && draft.answer === "provided") {
        const value = Number(draft.value);
        if (!Number.isFinite(value) || value <= 0 || !draft.unit) return [];
        return [{ questionId: question.questionId, questionRevisionId: question.questionRevisionId,
          answer: "provided", value, unit: draft.unit }];
      }
      return [{ questionId: question.questionId, questionRevisionId: question.questionRevisionId,
        answer: draft.answer as "yes" | "no" | "not_sure" | "not_reviewed" | "unavailable" } as
        OwnerProfilePreflightAnswerSubmission];
    });
    setWorking(true); setMessage("");
    try {
      const response = await mutate("/api/training/v2-owner/preflight", "profile", { answers });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Review answers could not be saved.");
      setMessage("Review answers saved in a new profile revision.");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Review answers could not be saved."); }
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
  const currentEquipmentAvailability = profile?.equipmentCapabilitySnapshot.availabilityConfirmations?.filter(
    (confirmation) => currentOwnerEquipmentAvailabilityAnswer(profile, confirmation.capabilityId) !== null) ?? [];
  const currentEquipmentCeilings = profile?.equipmentCapabilitySnapshot.loadCeilings?.filter((ceiling) =>
    currentOwnerEquipmentLoadCeiling(profile, ceiling.equipmentId) !== null) ?? [];

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
      <div className={styles.equipmentFacts}><h3>Current confirmations</h3>
        {capabilities.length || currentEquipmentAvailability.length || currentEquipmentCeilings.length ? <ul>
          {capabilities.map((capability) => <li key={`legacy-${capability}`}>
            {capability.replaceAll("_", " ")}</li>)}
          {currentEquipmentAvailability.map((confirmation) =>
            <li key={`availability-${confirmation.capabilityId}`}>
              {confirmation.capabilityId.replace("machine:", "").replaceAll("_", " ")}: {
                ANSWER_LABELS[confirmation.answer] ?? confirmation.answer.replaceAll("_", " ")}</li>)}
          {currentEquipmentCeilings.map((ceiling) =>
            <li key={`ceiling-${ceiling.equipmentId}`}>{ceiling.equipmentId} maximum: {
              ceiling.status === "provided" ? `${ceiling.enteredValue} ${ceiling.enteredUnit}` :
                ANSWER_LABELS[ceiling.status] ?? ceiling.status.replaceAll("_", " ")}</li>)}
        </ul> :
          <p className={styles.muted}>No exact equipment facts confirmed.</p>}
      </div>
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
    {input.preflight && input.preflight.status !== "ready" ? <section className={styles.section}>
      <div className={styles.reviewHeading}><div><h2>Required review</h2>
        <p className={styles.muted}>Required before preview</p></div>
        <span className={styles.status}>{input.preflight.questions.length} current</span></div>
      <div className={styles.reviewQuestions}>{input.preflight.questions.map((question) => {
        const storedDraft = reviewAnswers[question.questionId];
        const draft = storedDraft?.questionRevisionId === question.questionRevisionId ? storedDraft :
          question.currentAnswer ? { questionRevisionId: question.questionRevisionId,
            answer: question.currentAnswer, ...(question.responseType === "load_ceiling" ? {
              unit: "kg" as const } : {}) } : undefined;
        const name = `owner-review-${question.questionId}`;
        return <fieldset className={styles.reviewQuestion} key={question.questionId}>
          <legend className={styles.legend}>{question.responsibilityLabel}</legend>
          <p className={styles.questionPrompt}>{question.prompt}</p>
          <p className={styles.questionReason}>{question.why}</p>
          {question.responseType === "confirmation" ? <div className={styles.answerChoices}>
            {question.allowedAnswers.map((answer) => <label className={styles.radio} key={answer}>
              <input type="radio" name={name} value={answer} checked={draft?.answer === answer}
                onChange={() => setReviewAnswers((current) => ({ ...current,
                  [question.questionId]: { questionRevisionId: question.questionRevisionId, answer } }))} />
              <span>{ANSWER_LABELS[answer] ?? answer.replaceAll("_", " ")}</span>
            </label>)}
          </div> : <div className={styles.ceilingAnswer}>
            <div className={styles.ceilingValue}><div className={styles.field}>
              <label htmlFor={`${name}-value`}>Available maximum</label>
              <input id={`${name}-value`} type="number" min="0.5" step="0.5" inputMode="decimal"
                value={draft?.value ?? ""} onChange={(event) => setReviewAnswers((current) => ({ ...current,
                  [question.questionId]: { questionRevisionId: question.questionRevisionId,
                    answer: "provided", value: event.target.value,
                    unit: draft?.unit ?? "kg" } }))} />
            </div><fieldset className={styles.unitChoice}><legend>Unit</legend>
              {(["kg", "lb"] as const).map((unit) => <label className={styles.radio} key={unit}>
                <input type="radio" name={`${name}-unit`} checked={(draft?.unit ?? "kg") === unit}
                  onChange={() => setReviewAnswers((current) => ({ ...current,
                    [question.questionId]: { questionRevisionId: question.questionRevisionId,
                      answer: draft?.answer ?? "provided", value: draft?.value, unit } }))} />
                <span>{unit}</span>
              </label>)}</fieldset></div>
            <div className={styles.answerChoices}>{question.allowedAnswers.filter((answer) =>
              answer !== "provided").map((answer) => <label className={styles.radio} key={answer}>
                <input type="radio" name={name} value={answer} checked={draft?.answer === answer}
                  onChange={() => setReviewAnswers((current) => ({ ...current,
                    [question.questionId]: { questionRevisionId: question.questionRevisionId, answer } }))} />
                <span>{ANSWER_LABELS[answer] ?? answer.replaceAll("_", " ")}</span>
              </label>)}</div>
          </div>}
          <details className={styles.questionTechnical}><summary>Technical details</summary>
            <dl><div><dt>Canonical fact</dt><dd className={styles.code}>{question.canonicalFactId}</dd></div>
              <div><dt>Question revision</dt><dd className={styles.code}>{question.questionRevisionId}</dd></div>
              <div><dt>References</dt><dd className={styles.code}>{question.technicalRefs.join(", ")}</dd></div>
            </dl></details>
        </fieldset>;
      })}</div>
      {input.preflight.questions.length > 0 ? <button className={styles.button} type="button" disabled={working ||
        !input.preflight.questions.some((question) =>
          reviewAnswers[question.questionId]?.questionRevisionId === question.questionRevisionId &&
          Boolean(reviewAnswers[question.questionId]?.answer))}
        onClick={() => void saveReview()}>Save review answers</button> : null}
      {input.preflight.blockerCodes.length > 0 ? <p className={styles.warning} role="status">
        A required responsibility remains blocked by the current confirmed facts.</p> : null}
    </section> : null}
    <label className={styles.check}><input type="checkbox" checked={consent}
      onChange={(event) => setConsent(event.target.checked)} /><span>Enroll in controlled Praxis V2 owner delivery</span></label>
    <div className={styles.actions}>
      <button className={styles.button} type="button" disabled={working || !consent || !painConfirmed ||
        !allPainFactsConfirmed || !safetyConfirmed || !availabilityConfirmed}
        onClick={() => void save()}>Save profile</button>
      <button className={`${styles.button} ${styles.buttonSecondary}`} type="button"
        disabled={working || !profile || !persistedAvailabilityConfirmed || input.preflight?.status !== "ready"}
        onClick={() => void generate()}>Generate preview</button>
    </div>
    <p aria-live="polite" className={styles.muted}>{message}</p>
  </>;
}
