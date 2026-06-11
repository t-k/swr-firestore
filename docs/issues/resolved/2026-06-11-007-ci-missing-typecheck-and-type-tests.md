# CI never typechecks and the type tests are wired to nothing

- Date: 2026-06-11
- Severity: major
- Type: ci / testing
- Affected: `.github/workflows/test.yaml:16-27`, `package.json` (scripts), `tsconfig.type-tests.json`, `tests/types/*.typecheck.ts`
- Found by: project review (2026-06-11; confirmed independently by two reviewers)
- Related: 024

## Problem

- The CI lint job runs only `pnpm run lint` and `pnpm run format:check` (`.github/workflows/test.yaml:26-27`). The test jobs run `test:ci` = `vitest run --coverage`, which transpiles without typechecking.
- The only `tsc --noEmit` lives in the `build` script, which CI runs solely in the publish workflow — so a PR with type errors merges green and breakage surfaces at release time.
- `tests/types/*.typecheck.ts` contain real compile-only assertions (including `@ts-expect-error` negatives) wired to `tsconfig.type-tests.json`, but no script, workflow, or vitest include pattern ever runs them: root `tsconfig.json` includes only `./src`, and vitest's include pattern never matches `*.typecheck.ts`. All type assertions are currently dead.

For a library whose public value is largely its generics, this is a significant hole.

## Suggested fix

- Add a script: `"typecheck": "tsc --noEmit && tsc -p tsconfig.type-tests.json --noEmit"`.
- Run it in the CI lint job (and optionally in `test:ci`).
- Secondary: `.oxlintrc.json` enables only default rules (`"rules": {}`); consider enabling the `suspicious` category and confirming rules-of-hooks coverage for a hooks library.

## Suggested tests

- The type tests themselves already exist — the fix is executing them. After wiring, intentionally break a public generic locally to confirm CI fails.
