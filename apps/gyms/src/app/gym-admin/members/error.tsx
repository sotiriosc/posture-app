"use client";

import RouteErrorFallback from "@/components/RouteErrorFallback";

export default function MemberProgressError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback error={error} reset={reset} view="Member progress" />
  );
}
