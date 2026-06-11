# Peer dependency and package manifest issues

- Date: 2026-06-11
- Severity: major
- Type: packaging
- Affected: `package.json`, `.npmignore`
- Found by: project review (2026-06-11)

## Problems

1. `firebase` and `firebase-admin` are non-optional peerDependencies (`package.json:103-107`, no `peerDependenciesMeta`). npm v7+ auto-installs non-optional peers, so a client-only consumer importing only the browser hooks gets the full server SDK (grpc, google-auth) in node_modules, and a server-only consumer gets `firebase` likewise. Each consumer actually needs only the SDK for the subpaths they import.
2. `react` is absent from peerDependencies for a React hooks library (only a devDependency). The build externalizes react (`vite.config.ts:49`), and dist currently has no direct `"react"` import (it arrives transitively via swr's peer), but the manifest declares no supported React range, so resolvers cannot validate compatibility.
3. The swr range `"^2.1.0 <3.0.0"` is redundant — `^2.1.0` already excludes 3.x (verified semver-equivalent). Appears in both peer and dev dependencies.
4. No `engines` field, although CI tests only Node 20/22/24 and firebase-tools requires modern runtimes. Consumers on Node 18 get no install-time signal.
5. `.npmignore` is dead config: with `files: ["dist", "README.module.md"]` present, the allowlist governs and `.npmignore` is ignored entirely (verified via `npm pack --dry-run`: tarball contains only LICENSE/README/README.module.md/dist).

## Suggested fix

```jsonc
"peerDependencies": {
  "firebase": ">=9.11.0",
  "firebase-admin": ">=11.0.0",
  "react": ">=18",          // pick the actually supported range
  "swr": "^2.1.0"
},
"peerDependenciesMeta": {
  "firebase": { "optional": true },
  "firebase-admin": { "optional": true }
},
"engines": { "node": ">=20" }
```

Delete `.npmignore`. Document in the README which peer is required for which entrypoint.
