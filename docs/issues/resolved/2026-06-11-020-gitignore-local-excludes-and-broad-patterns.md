# .gitignore gaps: machine-local excludes and overly broad patterns

- Date: 2026-06-11
- Severity: minor
- Type: repo hygiene
- Affected: `.gitignore`, `.git/info/exclude`
- Found by: project review (2026-06-11)

## Problems

1. The ignore rules for working directories live only in the machine-local `.git/info/exclude` (`docs/logs`, `docs/superpowers`, `.claude`) while the committed `.gitignore` lacks them. Files exist on disk under `docs/logs/` and `docs/superpowers/` (internal design logs and plans). On a fresh clone or another machine these are unignored and can be committed accidentally.
2. `.gitignore` contains repo-wide `*.d.ts`, `*.js`, `*.js.map` patterns. Nothing tracked matches today, but this silently hides any future legitimate JavaScript or declaration file (a config file, a script in `scripts/`), which tends to surface as a confusing "git add does nothing" incident later.

## Suggested fix

- Move the `docs/logs`, `docs/superpowers`, `.claude` excludes into the committed `.gitignore` (or relocate those documents under the already-ignored `docs.local/`).
- Scope the generated-file patterns to where generation actually happens, e.g. anchor them to build output locations, or rely on the existing `dist`/`coverage` entries and delete the global patterns.
