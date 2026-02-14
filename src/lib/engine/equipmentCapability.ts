export type EquipmentCapability = {
  hasLoad: boolean;
  hasBand: boolean;
  hasPullTool: boolean;
};

const normalizeToken = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, "");

const normalizeEquipment = (equipment: string[]) =>
  equipment.map(normalizeToken).filter(Boolean);

export function computeEquipmentCapability(
  equipment: string[]
): EquipmentCapability {
  const normalized = normalizeEquipment(equipment);

  const hasBand = normalized.some((item) => item === "band" || item === "bands");

  const hasLoad = normalized.some((item) =>
    [
      "dumbbell",
      "dumbbells",
      "barbell",
      "kettlebell",
      "machine",
      "machines",
      "cable",
      "cables",
      "bench",
      "gym",
    ].includes(item)
  );

  const hasPullTool = normalized.some((item) =>
    [
      "pullupbar",
      "rings",
      "dooranchor",
      "suspension",
    ].includes(item)
  );

  return { hasLoad, hasBand, hasPullTool };
}
