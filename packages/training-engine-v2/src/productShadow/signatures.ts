import { stableId } from "../prescription/compiler/utilities";

export function controlledProductShadowSignature(namespace: string, value: unknown): string {
  return stableId(`controlled-product-shadow-${namespace}`, value);
}
