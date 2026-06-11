# Pin GitHub Actions by commit SHA and add actions ecosystem to Dependabot

- Date: 2026-06-11
- Severity: minor
- Type: security / supply chain
- Affected: `.github/workflows/publish.yml`, `.github/workflows/test.yaml`, `.github/dependabot.yml`
- Found by: project review (2026-06-11)

## Problem

All workflow actions are pinned by mutable tag (`actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/setup-java@v4`, `codecov/codecov-action@v5`). The publish workflow runs with `id-token: write` and an npm credential; a hijacked action tag could exfiltrate the publish token or tamper with the artifact before `pnpm publish --provenance`. Tag-pinning is exactly the vector exploited in recent real-world action compromises.

`dependabot.yml` configures only the `npm` ecosystem, so there is also no automation keeping actions updated.

## Suggested fix

- Pin every action to a full commit SHA with the version as a comment, e.g. `actions/checkout@<sha> # v4.2.x`.
- Add a `github-actions` ecosystem block to `.github/dependabot.yml` so the SHA pins are bumped automatically.

The workflows are otherwise in good shape (least-privilege permissions, `--frozen-lockfile`, provenance publish), so this is the main remaining supply-chain gap.
