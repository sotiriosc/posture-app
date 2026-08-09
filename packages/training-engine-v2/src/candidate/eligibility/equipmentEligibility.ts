import {
  evaluateEquipmentRequirement,
} from "../../domain/equipment";
import type { HardEligibilityComponent } from "./types";

export const equipmentEligibility: HardEligibilityComponent = {
  id: "equipment_eligibility",
  evaluate(exercise, context) {
    return {
      rejectionReasons: exercise.equipmentRequirements.flatMap((requirement) => {
        const result = evaluateEquipmentRequirement(context.equipment, requirement);
        if (result.satisfied) {
          return [];
        }

        return [
          {
            code: "EQUIPMENT_UNAVAILABLE" as const,
            message: `${exercise.name} requires unavailable equipment: ${requirement.label}.`,
            source: "equipment" as const,
            evidence: result.missingCapabilities,
          },
        ];
      }),
      warnings: [],
    };
  },
};
