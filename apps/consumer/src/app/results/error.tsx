"use client";

import RouteErrorFallback from "@/components/RouteErrorFallback";

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorFallback error={error} reset={reset} view="Results" />;
}
