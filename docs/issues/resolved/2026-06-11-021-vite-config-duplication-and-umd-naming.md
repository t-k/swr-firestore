# vite.config.ts: duplicated entry lists, dead UMD config, misleading .umd.cjs naming

- Date: 2026-06-11
- Severity: minor
- Type: build
- Affected: `vite.config.ts:14-24,25,35-45,56-63`, `package.json` exports
- Found by: project review (2026-06-11)

## Problems

1. The 9-entry list is duplicated verbatim between `build.lib.entry` (`vite.config.ts:14-24`) and `build.rolldownOptions.input` (`:35-45`). Adding an entrypoint requires editing both by hand; forgetting one produces a confusing partial build.
2. `lib.name: "SwrFirestore"` (`:25`) and `output.globals` (`:56-63`) only apply to umd/iife formats, but the build emits es+cjs. They are dead config implying a script-tag UMD build that does not exist.
3. The CJS files are named `*.umd.cjs` (`fileName` maps `cjs` → `"umd.cjs"`, `:27`) although `dist/index.umd.cjs` is plain CJS with no UMD wrapper. The suffix misleads consumers and contributors.

## Suggested fix

- Extract the entry map to a single constant used by both config positions (or drop the redundant `rolldownOptions.input` if `lib.entry` alone suffices with the current Vite/rolldown version).
- Delete `name` and `output.globals`.
- Rename outputs to `.cjs` in the next major release — the exports map insulates consumers, but the file name is part of the published API surface for anyone deep-importing, so treat it as breaking.
