# Published d.ts files break TypeScript consumers on node16/nodenext module resolution

- Date: 2026-06-11
- Severity: major
- Type: packaging / compatibility
- Affected: `dist/**/*.d.ts` (emitted by `tsc --emitDeclarationOnly`), `package.json` exports
- Found by: project review (2026-06-11)

## Problem

The published declaration files use extensionless relative specifiers, e.g. `dist/index.d.ts:1-11`:

```ts
export type { DocumentData, KeyParams, ... } from "./util/type";
export { default as useCollection } from "./hooks/useCollection";
```

The package is `"type": "module"`, so under TypeScript's `moduleResolution: node16/nodenext` these relative imports inside ESM declaration files require explicit extensions (TS2835). This directly affects the `/server` and `/module/server` entrypoints, whose target audience is Node SSR code where nodenext resolution is common.

Additionally, the same ESM-flavored `.d.ts` is served for both the `import` and `require` conditions (`package.json` exports), so require-side consumers get types that do not match the CJS runtime file ("masquerading as ESM" in @arethetypeswrong terms).

Bundler-based consumers (`moduleResolution: bundler`) are unaffected, which is why this has gone unnoticed.

## Suggested fix

- Emit extension-suffixed declarations or bundle them (e.g. a d.ts bundler / API extractor step), and provide `.d.cts` for the `require` condition.
- Add `npx @arethetypeswrong/cli --pack` and `npx publint` to CI so regressions are caught automatically.
- Alternatively, document explicitly that only `moduleResolution: bundler` is supported (weaker, not recommended for the server entrypoints).

## Suggested tests

- CI step: `attw --pack` reports no errors for all 9 export subpaths under node16 (ESM + CJS) resolution.
