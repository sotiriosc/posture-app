import { notFound } from "next/navigation";
import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import DeviceQaPanel from "@/components/dev/DeviceQaPanel";

export default function DevQaPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-5xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="ui-kicker">Dev tools</p>
              <h1 className="text-3xl font-semibold text-white">Real-device QA</h1>
              <p className="text-sm text-slate-200">
                Development-only checklist for validating on real devices. Not
                included in production builds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="secondary">Back to settings</Button>
              </Link>
            </div>
          </header>
        </OnImage>

        <DeviceQaPanel />
      </div>
    </BackgroundShell>
  );
}
