import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const declarationExtension = ".d.ts";

const hasKnownExtension = (specifier) => {
  const extension = extname(specifier);
  return [".js", ".mjs", ".cjs", ".json"].includes(extension);
};

const stripJavaScriptExtension = (specifier) => {
  if (specifier.endsWith(".cjs")) return specifier.slice(0, -4);
  if (specifier.endsWith(".js")) return specifier.slice(0, -3);
  return specifier;
};

const resolveDeclarationSpecifier = (declarationPath, specifier, extension, declarationSet) => {
  if (hasKnownExtension(specifier) && !specifier.endsWith(".js") && !specifier.endsWith(".cjs")) {
    return specifier;
  }

  const baseSpecifier = stripJavaScriptExtension(specifier);
  const basePath = join(dirname(declarationPath), baseSpecifier);
  if (declarationSet.has(normalize(`${basePath}.d.ts`))) {
    return `${baseSpecifier}${extension}`;
  }
  if (declarationSet.has(normalize(join(basePath, "index.d.ts")))) {
    return `${baseSpecifier}/index${extension}`;
  }
  return `${baseSpecifier}${extension}`;
};

const rewriteRelativeSpecifiers = (source, declarationPath, extension, declarationSet) =>
  source.replaceAll(/(["'])(\.{1,2}\/[^"']+)(["'])/g, (_match, quoteStart, specifier, quoteEnd) => {
    return `${quoteStart}${resolveDeclarationSpecifier(
      declarationPath,
      specifier,
      extension,
      declarationSet,
    )}${quoteEnd}`;
  });

const collectDeclarations = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectDeclarations(path);
      return path.endsWith(declarationExtension) ? [path] : [];
    }),
  );
  return files.flat();
};

const declarations = await collectDeclarations(distDir);
const declarationSet = new Set(declarations.map((path) => normalize(path)));

await Promise.all(
  declarations.map(async (path) => {
    const source = await readFile(path, "utf8");
    await writeFile(path, rewriteRelativeSpecifiers(source, path, ".js", declarationSet));
    const ctsPath = path.replace(/\.d\.ts$/, ".d.cts");
    await cp(path, ctsPath);
    const ctsSource = await readFile(ctsPath, "utf8");
    await writeFile(ctsPath, rewriteRelativeSpecifiers(ctsSource, path, ".cjs", declarationSet));
  }),
);
