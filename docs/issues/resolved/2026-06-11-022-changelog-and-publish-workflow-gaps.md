# Release process gaps: missing CHANGELOG entry, double build, no tag/version guard

- Date: 2026-06-11
- Severity: minor
- Type: process / ci
- Affected: `CHANGELOG.md`, `.github/workflows/publish.yml`, `package.json:81`
- Found by: project review (2026-06-11)
- Related: 001

## Problems

1. Commit `a49ca6c` ("fix: separate module cache keys by project") landed after the v3.2.0 release commit, but `CHANGELOG.md` has no `[Unreleased]` section recording it. It is a user-facing cache-key behavior change (and per issue 001 it currently carries a critical bug) — easy to omit from the next release notes.
2. `publish.yml:30-33` runs `pnpm run build` and then `pnpm publish`, which re-runs the full build via `prepublishOnly` (`package.json:81`) — every release builds twice.
3. The workflow publishes whatever version sits in `package.json` for any `v*` tag (`--no-git-checks`); there is no assertion that the pushed tag matches `package.json.version`, and no `concurrency` group preventing overlapping tag pushes. Only the registry's duplicate-version error guards a mispushed tag.

## Suggested fix

- Add an `[Unreleased]` section to CHANGELOG.md now (recording `a49ca6c` and the upcoming key fixes), and keep it as part of the release routine.
- Drop the explicit Build step (rely on `prepublishOnly`) or remove `prepublishOnly` in favor of the workflow step.
- Add a guard step, e.g. `node -e "const v=require('./package.json').version; if ('v'+v !== process.env.GITHUB_REF_NAME) process.exit(1)"`, and a `concurrency: { group: publish }` block.
