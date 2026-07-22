import Link from "next/link";
import { cookies } from "next/headers";
import PhotoUploader from "@/components/PhotoUploader";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";
import {
  BUYER_DEMO_COOKIE,
  isBuyerDemoCookieValue,
  isBuyerDemoSearchParamValue,
} from "@/lib/gymSaas/demoMode";

type AssessmentPageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function AssessmentPage({
  searchParams,
}: AssessmentPageProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const buyerDemoMode =
    isBuyerDemoSearchParamValue(query.demo) ||
    isBuyerDemoCookieValue(cookieStore.get(BUYER_DEMO_COOKIE)?.value);

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-6xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-300">
                {buyerDemoMode ? "Buyer demo mode" : "Movement & Posture Baseline"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                Upload your posture photos
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                These images help detect structural imbalances that influence movement mechanics and corrective focus.
              </p>
            </div>
            <Link href="/questionnaire">
              <Button variant="secondary">Answer profile instead</Button>
            </Link>
          </header>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {["Natural stance", "Good lighting", "Front / side / back"].map((item) => (
              <div
                key={item}
                className="praxis-card-muted rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </OnImage>

        <PhotoUploader />

        <OnImage className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
          <Link href={buyerDemoMode ? "/gym-demo/member" : "/"}>
            <Button variant="secondary">
              {buyerDemoMode ? "Back to member demo" : "Back to home"}
            </Button>
          </Link>
          <Link href="/questionnaire">
            <Button variant="primary">Continue to profile</Button>
          </Link>
        </OnImage>
      </div>
      <OnboardingInfoButton onboardingKey="assessment" />
    </BackgroundShell>
  );
}
