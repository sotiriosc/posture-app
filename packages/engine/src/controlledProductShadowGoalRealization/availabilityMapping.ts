import { PRODUCT_AVAILABILITY_HORIZON_SHADOW_MAPPING_REFERENCE, stableId,
  type ProductAvailabilityHorizonShadowMapping } from "@praxis/training-engine-v2";
import type { ProductGoalRealizationFixtureExtensions } from "./contracts";

export function mapProductAvailabilityHorizon(input: {
  readonly athleteId: string;
  readonly questionnaire: Record<string, unknown> | null;
  readonly productStateRevision: string;
  readonly fixtureExtensions?: ProductGoalRealizationFixtureExtensions | null;
}): ProductAvailabilityHorizonShadowMapping {
  const numericDays = Number(input.questionnaire?.daysPerWeek);
  const opportunityCount = numericDays === 3 || numericDays === 4 || numericDays === 5 ? numericDays : null;
  const fixtureMinutes = input.fixtureExtensions?.sessionMinutes;
  const minutes = typeof fixtureMinutes === "number" && Number.isFinite(fixtureMinutes) && fixtureMinutes > 0 ?
    fixtureMinutes : null;
  const opportunities = opportunityCount ? Array.from({ length: opportunityCount }, (_, index) => Object.freeze({
    opportunityId: stableId("product-goal-realization-opportunity", { athleteId: input.athleteId,
      productStateRevision: input.productStateRevision, order: index + 1 }),
    order: index + 1, minutes, date: null, weekday: null,
  })) : [];
  return Object.freeze({ reference: PRODUCT_AVAILABILITY_HORIZON_SHADOW_MAPPING_REFERENCE,
    opportunityCount, opportunities: Object.freeze(opportunities),
    minutesSource: minutes === null ? "unknown" : "versioned_test_or_replay_fixture",
    status: !opportunityCount ? "mapping_required" : minutes === null ? "ordered_opportunities" :
      "ordered_opportunities_with_minutes", calendarReadCount: 0, inventedMinutesCount: 0 });
}
