import { headers } from "next/headers";
import {
  preflightControlledOwnerGetStrongerProfile,
  proposeOwnerImportsFromTrainingSnapshot,
  withControlledOwnerRepositories,
} from "@praxis/engine/controlled-owner-delivery";
import { loadOwnerProductRuntimeContext, OWNER_ENGINE_VERSION, OWNER_POLICY_VERSIONS,
  ownerCsrfTokens, requireOwnerPage } from
  "@/server/controlledOwnerDelivery";
import OwnerProfileClient from "./OwnerProfileClient";
import styles from "./owner-v2.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerV2ProfilePage() {
  const gate = await requireOwnerPage("preview");
  const now = new Date().toISOString();
  const requestHeaders = await headers();
  const csrf = ownerCsrfTokens({ userId: gate.userId!, cookieHeader: requestHeaders.get("cookie") ?? "",
    issuedAt: now, actionFamilies: ["enrollment", "profile", "preview"] });
  const state = await withControlledOwnerRepositories(async ({ enrollmentProfiles }) => {
    const [profile, enrollment, product] = await Promise.all([
      enrollmentProfiles.readCurrentProfile(gate.userId!),
      enrollmentProfiles.readCurrentEnrollment(gate.userId!),
      loadOwnerProductRuntimeContext(gate.userId!),
    ]);
    const proposedFacts = proposeOwnerImportsFromTrainingSnapshot({ snapshot: product.snapshot,
      sourceRevision: product.sourceProductRevisionId });
    const preflight = profile && enrollment ? preflightControlledOwnerGetStrongerProfile({ profile,
      enrollmentRevisionId: enrollment.revisionId, source: {
        sourceProductSnapshotId: product.sourceProductSnapshotId,
        sourceProductRevisionId: product.sourceProductRevisionId,
        activeLegacyProgramRevisionId: product.activeLegacyProgramRevisionId,
        assessmentReport: product.snapshot.assessment ?? null,
      }, proposedProductFacts: proposedFacts, evaluationTime: now, engineVersion: OWNER_ENGINE_VERSION,
      policyVersions: OWNER_POLICY_VERSIONS }).preflight : null;
    return { available: true as const, profile, proposedFacts, preflight };
  }).catch(() => ({ available: false as const, profile: null, proposedFacts: [], preflight: null }));

  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.kicker}>Controlled owner delivery</p>
      <h1 className={styles.title}>Praxis V2</h1></div>
      <span className={styles.status}>{gate.mode}</span>
    </header>
    {!state.available ? <p className={styles.warning} role="status">Owner delivery is temporarily unavailable.</p> :
      <OwnerProfileClient profile={state.profile} proposedFacts={state.proposedFacts}
        preflight={state.preflight} csrf={csrf}
        canApply={gate.mode === "apply"} />}
  </main>;
}
