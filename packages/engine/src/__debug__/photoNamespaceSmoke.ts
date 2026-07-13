import { inspectPhotoNamespaces } from "@/lib/photoStore";

const run = async () => {
  const report = await inspectPhotoNamespaces({ forceAuthRefresh: true });
  console.log("[photoNamespaceSmoke]");
  console.log(`- activeNamespace=${report.activeNamespace}`);
  console.log(`- activeNamespaceType=${report.activeNamespaceType}`);
  console.log(`- userNamespace=${report.userNamespace ?? "null"}`);
  console.log(`- mismatch=${report.mismatch}`);
  console.log(`- suggestedSource=${report.suggestedSource ?? "none"}`);
  console.log("- slotsByNamespace");
  console.log(`  anon=${JSON.stringify(report.slotsByNamespace.anon)}`);
  console.log(`  global=${JSON.stringify(report.slotsByNamespace.global)}`);
  console.log(`  user=${JSON.stringify(report.slotsByNamespace.user)}`);
};

void run();
