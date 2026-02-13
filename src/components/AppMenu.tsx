import AppMenuClient from "@/components/AppMenuClient";
import { isAdminRequest } from "@/lib/adminAuth";
import { isAuthConfigured, readServerSession } from "@/lib/serverAuth";

export default async function AppMenu() {
  const [isAdmin, authEnabled, session] = await Promise.all([
    isAdminRequest(),
    isAuthConfigured(),
    readServerSession(),
  ]);

  return (
    <AppMenuClient
      isAdmin={isAdmin}
      authEnabled={authEnabled}
      authenticated={Boolean(session)}
    />
  );
}

