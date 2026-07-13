import { auditStoreIntegrity } from "@/lib/debug/storeIntegrityAudit";

const run = async () => {
  const report = await auditStoreIntegrity();

  console.log(`[storeIntegritySmoke] ok=${report.ok}`);
  console.log(
    `[storeIntegritySmoke] summary hasQuestionnaire=${report.summary.hasQuestionnaire} hasPhotos=${report.summary.hasPhotos} programs=${report.summary.programCount} sessions=${report.summary.sessionCount} logs=${report.summary.logCount} activeProgramId=${report.summary.activeProgramId ?? "null"}`
  );

  console.log("[storeIntegritySmoke] invariants");
  Object.entries(report.invariants).forEach(([name, result]) => {
    console.log(
      `- ${name}: ${result.ok ? "ok" : "fail"}${result.detail ? ` | ${result.detail}` : ""}`
    );
  });

  if (report.errors.length) {
    console.log("[storeIntegritySmoke] errors");
    report.errors.slice(0, 20).forEach((item) => console.log(`- ${item}`));
  }

  if (report.warnings.length) {
    console.log("[storeIntegritySmoke] warnings");
    report.warnings.slice(0, 20).forEach((item) => console.log(`- ${item}`));
  }

  console.log("[storeIntegritySmoke] snapshot");
  console.log(JSON.stringify(report.snapshot, null, 2));

  if (!report.ok) {
    process.exitCode = 1;
  }
};

void run();
