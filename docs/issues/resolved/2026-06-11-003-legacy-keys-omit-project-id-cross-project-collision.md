# Legacy SWR keys omit projectId: cross-project cache and subscription collisions

- Date: 2026-06-11
- Severity: major
- Type: bug
- Affected: `src/middleware/serializeMiddleware.ts:14`, `src/util/scrubKey.ts:11`, `src/util/databaseId.ts:46-57`, `src/server/util/createKey.ts:7-16`
- Found by: project review (2026-06-11)
- Related: 001, 024

## Problem

Legacy key construction replaces the `db` instance with `extractDatabaseId(db)`, which keeps only the database name and drops the project: two Firestore instances from different projects both produce `databaseId:"(default)"` in their keys. The project-aware `extractDatabaseIdentity` (`src/util/databaseId.ts:63-74`, added in commit `a49ca6c`) is used only by the module entrypoint (`src/module/util/normalizeKeyParams.ts:8`).

`tests/middleware/serializeMiddleware.test.ts:26-36` currently pins the lossy behavior.

## Impact

A page using two Firebase apps (e.g. `project-a` and `project-b`) with the same collection path shares one SWR cache entry and one Firestore subscription across projects. Project A's data is served to project B's component, and the subscription closure captures the first mount's `db`, so the wrong project stays subscribed. Multi-project apps are uncommon but the failure is silent and confusing.

## Suggested fix

Switch the legacy middleware and `scrubKey` to `extractDatabaseIdentity`, coordinated with the legacy server `createKey` (which must emit the same project-qualified form — see issue 001 for the Admin SDK side). This changes key shapes for users who pass `db`, so align it with the same release that fixes issue 001, and note it in the CHANGELOG.

## Suggested tests

- "client and server keys are distinct across two projects with the same database name and path" (real client SDK + real admin SDK, mirroring `tests/server/databaseIdConsistency.test.ts`).
