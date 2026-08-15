import { PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE } from "../compiler/contracts";
import { PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE } from "./contracts";

export const PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY = Object.freeze({
  v1_0: Object.freeze({
    contract: PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
    disposition: PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
    currentBehaviorFrozen: true,
    productShadowPinned: true,
    futureActivationAuthority: false,
  }),
  v1_1: Object.freeze({
    contract: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
    purposeFirst: true,
    failClosed: true,
    productCallerCount: 0,
    productShadowCallerCount: 0,
    orchestrationCallerCount: 0,
    activated: false,
  }),
  defaultCompilerVersion: null,
  versionCoercionAllowed: false,
  automaticMigrationAllowed: false,
});
