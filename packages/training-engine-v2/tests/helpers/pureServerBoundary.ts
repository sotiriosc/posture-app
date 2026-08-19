import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";
import ts from "typescript";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
const REQUIRED_TEST_DEV_INCLUDES = Object.freeze(["src/**/*.ts", "tests/**/*.ts", "dev/**/*.ts"]);

export interface PureServerImportEdge {
  readonly sourceFile: string;
  readonly syntax: "import" | "export" | "dynamic_import" | "import_type" | "require";
  readonly specifier: string;
  readonly target: string;
}

export interface PureServerBoundaryAudit {
  readonly classification: "PURE_SERVER_DEPENDENCY_DIRECTION_VALID" |
    "PURE_TO_SERVER_DEPENDENCY_DIRECTION_VIOLATION";
  readonly executableImportEdges: readonly PureServerImportEdge[];
  readonly packageAliasViolations: readonly string[];
  readonly typeCoverageFailures: readonly string[];
  readonly fingerprint: string;
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function sourceFiles(root: string): readonly string[] {
  const files: string[] = [];
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name === "node_modules") continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (SOURCE_EXTENSIONS.has(extname(entry.name))) files.push(path);
    }
  };
  visit(root);
  return Object.freeze(files);
}

function scriptKind(file: string): ts.ScriptKind {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js") || file.endsWith(".mjs") || file.endsWith(".cjs")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function isEngineTarget(specifier: string, sourceFile: string, engineRoot: string): string | null {
  if (specifier === "@praxis/engine" || specifier.startsWith("@praxis/engine/")) return specifier;
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) return null;
  const target = resolve(dirname(sourceFile), specifier);
  return target === engineRoot || target.startsWith(`${engineRoot}${sep}`) ? target : null;
}

export function inspectPureSourceText(input: {
  readonly sourceText: string;
  readonly sourceFile: string;
  readonly workspaceRoot: string;
}): readonly PureServerImportEdge[] {
  const engineRoot = resolve(input.workspaceRoot, "packages/engine");
  const source = ts.createSourceFile(input.sourceFile, input.sourceText, ts.ScriptTarget.Latest, true,
    scriptKind(input.sourceFile));
  const edges: PureServerImportEdge[] = [];
  const record = (specifier: string, syntax: PureServerImportEdge["syntax"]) => {
    const target = isEngineTarget(specifier, input.sourceFile, engineRoot);
    if (target) edges.push(Object.freeze({ sourceFile: relative(input.workspaceRoot, input.sourceFile),
      syntax, specifier, target: target.startsWith("@praxis/") ? target : relative(input.workspaceRoot, target) }));
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      record(node.moduleSpecifier.text, "import");
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)) {
      record(node.moduleSpecifier.text, "export");
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression && ts.isStringLiteralLike(node.moduleReference.expression)) {
      record(node.moduleReference.expression.text, "import");
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)) {
      record(node.argument.literal.text, "import_type");
    } else if (ts.isCallExpression(node) && node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) record(node.arguments[0].text, "dynamic_import");
      if (ts.isIdentifier(node.expression) && node.expression.text === "require") {
        record(node.arguments[0].text, "require");
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return Object.freeze(edges.sort((left, right) =>
    `${left.sourceFile}:${left.syntax}:${left.specifier}`.localeCompare(
      `${right.sourceFile}:${right.syntax}:${right.specifier}`)));
}

function readJson(path: string): Record<string, unknown> {
  const result = ts.readConfigFile(path, (filename) => readFileSync(filename, "utf8"));
  if (result.error) throw new Error(ts.flattenDiagnosticMessageText(result.error.messageText, "\n"));
  return result.config as Record<string, unknown>;
}

export function findPurePackageAliasViolations(input: {
  readonly config: Record<string, unknown>;
  readonly configPath: string;
  readonly workspaceRoot: string;
}): readonly string[] {
  const compilerOptions = input.config.compilerOptions as Record<string, unknown> | undefined;
  const paths = compilerOptions?.paths as Record<string, readonly string[]> | undefined;
  const baseUrl = typeof compilerOptions?.baseUrl === "string" ? compilerOptions.baseUrl : ".";
  const engineRoot = resolve(input.workspaceRoot, "packages/engine");
  const failures: string[] = [];
  for (const [alias, targets] of Object.entries(paths ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
    for (const target of targets) {
      const resolved = resolve(dirname(input.configPath), baseUrl, target.replace(/\*.*$/, ""));
      if (alias === "@/lib/*" || resolved === engineRoot || resolved.startsWith(`${engineRoot}${sep}`)) {
        failures.push(`PURE_TSCONFIG_SERVER_ALIAS_FORBIDDEN:${alias}:${target}`);
      }
    }
  }
  return Object.freeze(failures);
}

function findTypeCoverageFailures(workspaceRoot: string): readonly string[] {
  const packageRoot = resolve(workspaceRoot, "packages/training-engine-v2");
  const manifest = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8")) as {
    readonly scripts?: Readonly<Record<string, string>>;
  };
  const production = readJson(resolve(packageRoot, "tsconfig.production.json"));
  const testDev = readJson(resolve(packageRoot, "tsconfig.test-dev.json"));
  const failures: string[] = [];
  const productionInclude = production.include as readonly string[] | undefined;
  const testDevInclude = testDev.include as readonly string[] | undefined;
  if (!productionInclude?.includes("src/**/*.ts")) failures.push("PURE_PRODUCTION_TYPECHECK_SOURCE_REQUIRED");
  for (const required of REQUIRED_TEST_DEV_INCLUDES) {
    if (!testDevInclude?.includes(required)) failures.push(`PURE_TEST_DEV_TYPECHECK_INCLUDE_REQUIRED:${required}`);
  }
  const build = manifest.scripts?.build ?? "";
  for (const required of ["validate:pure-server-boundary", "typecheck:production", "typecheck:test-dev"]) {
    if (!build.includes(required)) failures.push(`PURE_BUILD_REQUIRED_STEP_MISSING:${required}`);
  }
  return Object.freeze(failures);
}

export function auditPureServerBoundary(workspaceRoot: string): PureServerBoundaryAudit {
  const packageRoot = resolve(workspaceRoot, "packages/training-engine-v2");
  const edges = sourceFiles(packageRoot).flatMap((file) => inspectPureSourceText({
    sourceText: readFileSync(file, "utf8"), sourceFile: file, workspaceRoot,
  }));
  const configPath = resolve(packageRoot, "tsconfig.json");
  const aliasViolations = findPurePackageAliasViolations({
    config: readJson(configPath), configPath, workspaceRoot,
  });
  const typeCoverageFailures = findTypeCoverageFailures(workspaceRoot);
  const semantic = Object.freeze({ executableImportEdges: edges,
    packageAliasViolations: aliasViolations, typeCoverageFailures });
  return Object.freeze({
    classification: edges.length + aliasViolations.length + typeCoverageFailures.length === 0 ?
      "PURE_SERVER_DEPENDENCY_DIRECTION_VALID" : "PURE_TO_SERVER_DEPENDENCY_DIRECTION_VIOLATION",
    ...semantic,
    fingerprint: digest(semantic),
  });
}
