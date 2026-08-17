import { headers } from "next/headers";
import {
  proposeOwnerImportsFromTrainingSnapshot,
  withControlledOwnerRepositories,
} from "@praxis/engine/controlled-owner-delivery";
import { loadOwnerProductRuntimeContext, ownerCsrfTokens, requireOwnerPage } from
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
    const [profile, product] = await Promise.all([
      enrollmentProfiles.readCurrentProfile(gate.userId!),
      loadOwnerProductRuntimeContext(gate.userId!),
    ]);
    return { available: true as const, profile,
      proposedFacts: proposeOwnerImportsFromTrainingSnapshot({ snapshot: product.snapshot,
        sourceRevision: product.sourceProductRevisionId }) };
  }).catch(() => ({ available: false as const, profile: null, proposedFacts: [] }));

  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.kicker}>Controlled owner delivery</p>
      <h1 className={styles.title}>Praxis V2</h1></div>
      <span className={styles.status}>{gate.mode}</span>
    </header>
    {!state.available ? <p className={styles.warning} role="status">Owner delivery is temporarily unavailable.</p> :
      <OwnerProfileClient profile={state.profile} proposedFacts={state.proposedFacts} csrf={csrf}
        canApply={gate.mode === "apply"} />}
  </main>;
}
