import { getConfiguredUserStoreDriver } from "@/lib/userRepository";
import { isLocalDevRuntime, warnOnce } from "@/lib/runtimeEnv";

export type TrainingStoreDriver = "db" | "disabled";

export const getConfiguredTrainingStoreDriver = (): TrainingStoreDriver => {
  const raw = process.env.TRAINING_STORE_DRIVER?.trim().toLowerCase();
  if (raw === "db" || raw === "disabled") return raw;
  if (raw) {
    warnOnce(
      "training-store-invalid-driver",
      `[training/state] Unknown TRAINING_STORE_DRIVER="${raw}"; using default training store behavior.`
    );
  }

  const userStoreDriver = getConfiguredUserStoreDriver();
  if (
    isLocalDevRuntime() &&
    (userStoreDriver === "memory" || userStoreDriver === "file")
  ) {
    return "disabled";
  }
  return "db";
};

export const isTrainingStoreDisabled = () =>
  getConfiguredTrainingStoreDriver() === "disabled";
