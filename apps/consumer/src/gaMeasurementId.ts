/**
 * GA4 measurement ID for the Praxis production app.
 * Only set NEXT_PUBLIC_GA_MEASUREMENT_ID in deployed environments that should track.
 */
export const getGaMeasurementId = (): string | undefined => {
  const value = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return value ? value : undefined;
};
