export type GymEquipmentProfile = {
  profileLabel: string;
  availableEquipment: string[];
  notes: string;
};

export type TrainerContact = {
  id: string;
  name: string;
  role: string;
  email: string;
};

export type GymPilotSettings = {
  pilotLabel: string;
  memberSegmentLabel: string;
  reportingCadence: "weekly" | "biweekly" | "monthly";
  dashboardConnected: boolean;
};

export type GymConfig = {
  gymId: string;
  gymName: string;
  locationLabel: string;
  brandColor: string;
  equipmentProfile: GymEquipmentProfile;
  trainerContacts: TrainerContact[];
  ptConsultLabel: string;
  memberSupportEmail: string;
  pilotSettings: GymPilotSettings;
};

export const defaultGymConfig: GymConfig = {
  gymId: "demo-local-gym",
  gymName: "Demo Local Gym",
  locationLabel: "Local pilot location",
  brandColor: "#5B8FA8",
  equipmentProfile: {
    profileLabel: "General gym floor",
    availableEquipment: [
      "Dumbbells",
      "Cable station",
      "Benches",
      "Selectorized machines",
      "Cardio area",
    ],
    notes:
      "Default demo profile for a standard club floor. Equipment can be configured per gym later.",
  },
  trainerContacts: [
    {
      id: "demo-trainer-lead",
      name: "Training Lead",
      role: "Pilot handoff contact",
      email: "training@example-gym.com",
    },
  ],
  ptConsultLabel: "Trainer consultation",
  memberSupportEmail: "support@example-gym.com",
  pilotSettings: {
    pilotLabel: "Local gym pilot",
    memberSegmentLabel: "Pilot member segment",
    reportingCadence: "weekly",
    dashboardConnected: false,
  },
};

export function getActiveGymConfig() {
  return defaultGymConfig;
}

export function getGymQuestionnaireEquipmentSelection(
  config: GymConfig
): string[] {
  const configuredItems = config.equipmentProfile.availableEquipment.map((item) =>
    item.trim().toLowerCase()
  );

  if (configuredItems.length === 0) {
    return ["none"];
  }

  const bandOnly = configuredItems.every(
    (item) => item.includes("band") || item.includes("resistance")
  );

  if (bandOnly) {
    return ["bands"];
  }

  const noEquipmentOnly = configuredItems.every(
    (item) => item === "none" || item.includes("no equipment")
  );

  if (noEquipmentOnly) {
    return ["none"];
  }

  return ["gym"];
}
