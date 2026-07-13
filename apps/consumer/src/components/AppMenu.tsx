import AppMenuClient from "@/components/AppMenuClient";
import { isAdminRequest } from "@praxis/engine";
import { isAuthConfigured, readServerSession } from "@praxis/engine";

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

