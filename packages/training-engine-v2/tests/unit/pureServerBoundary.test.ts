import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditPureServerBoundary,
  findPurePackageAliasViolations,
  inspectPureSourceText,
} from "../helpers/pureServerBoundary";

const workspaceRoot = resolve(process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2"), "../..");
const virtualFile = resolve(workspaceRoot,
  "packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/mutation.ts");

describe("Training Engine V2 pure/server dependency boundary", () => {
  it("accepts the current pure package with complete production and test/dev coverage", () => {
    const result = auditPureServerBoundary(workspaceRoot);
    expect(result).toMatchObject({ classification: "PURE_SERVER_DEPENDENCY_DIRECTION_VALID",
      executableImportEdges: [], packageAliasViolations: [], typeCoverageFailures: [] });
  });

  it.each([
    ["engine source", "import x from \"../../../../engine/src/types\";"],
    ["engine tests", "import x from \"../../../../engine/tests/example\";"],
    ["engine dev", "import x from \"../../../../engine/dev/example\";"],
    ["engine re-export", "export { x } from \"../../../../engine/src/example\";"],
    ["dynamic engine import", "const x = import(\"../../../../engine/tests/example\");"],
    ["engine package subpath", "import x from \"@praxis/engine/controlled-product-shadow\";"],
    ["engine import type", "type X = import(\"@praxis/engine\").X;"],
    ["engine require", "const x = require(\"../../../../engine/src/example\");"],
  ])("rejects the %s mutation", (_name, sourceText) => {
    expect(inspectPureSourceText({ sourceText, sourceFile: virtualFile, workspaceRoot })).toHaveLength(1);
  });

  it("rejects a hidden engine alias in the pure tsconfig", () => {
    const configPath = resolve(workspaceRoot, "packages/training-engine-v2/tsconfig.json");
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    config.compilerOptions.paths["@/lib/*"] = ["../engine/src/*"];
    expect(findPurePackageAliasViolations({ config, configPath, workspaceRoot }))
      .toEqual(["PURE_TSCONFIG_SERVER_ALIAS_FORBIDDEN:@/lib/*:../engine/src/*"]);
  });

  it("is invariant to declaration order and equivalent type-only formatting", () => {
    const first = "import type { A } from './a';\nimport { B } from './b';";
    const second = "import { B } from './b';\nimport type {A} from './a';";
    expect(inspectPureSourceText({ sourceText: first, sourceFile: virtualFile, workspaceRoot }))
      .toEqual(inspectPureSourceText({ sourceText: second, sourceFile: virtualFile, workspaceRoot }));
  });

  it("does not interpret documentation prose or filesystem paths as imports", () => {
    const source = "const prose = 'packages/engine/src/types.ts';\n" +
      "readFileSync(resolve(root, 'packages/engine/tests/example.ts'));";
    expect(inspectPureSourceText({ sourceText: source, sourceFile: virtualFile, workspaceRoot })).toEqual([]);
  });
});
