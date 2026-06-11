# Module SSR keys never match between client and Admin SDK when `db` is passed

- Date: 2026-06-11
- Severity: critical
- Type: bug
- Affected: `src/util/databaseId.ts:63-74`, `src/module/util/normalizeKeyParams.ts:7-9`, `src/module/server/util/createKey.ts`
- Found by: project review (2026-06-11)
- Related: 003, 004, 024

## Problem

`extractDatabaseIdentity` returns a project-qualified identity for client SDK instances but a bare database id for Admin SDK instances, so module SSR fallback keys generated with an explicit `db` never match the client-side keys.

Mechanism:

- Client SDK `Firestore` exposes its database via `toJSON().databaseId` as an object `{ projectId, database }`. `toDatabaseIdentityString` (`src/util/databaseId.ts:21-28`) turns this into `"<projectId>/<database>"`, e.g. `"demo-proj/(default)"`.
- Admin SDK `Firestore` exposes `databaseId` as a plain string getter. `extractDatabaseIdentityValue` (`src/util/databaseId.ts:37`) returns string input as-is, so the server key contains only `"(default)"`.

Empirically reproduced with real SDK instances: client key contains `databaseId:"demo-proj/(default)"` while the module server key contains `databaseId:"(default)"`.

## Impact

Every `/module/server` fetcher key built with an explicit `db` (`getDoc`, `getCollection`, counts, aggregates — all route through `createModuleSwrKey` → `normalizeModuleKeyParams` → `extractDatabaseIdentity`) is silently ignored by the client: `fallbackData` never hydrates. This defeats the core promise of the `/module/server` entrypoint.

Note on timing: this was introduced by commit `a49ca6c` ("fix: separate module cache keys by project"), which landed after the v3.2.0 release commit (`23db6ae`). The bug is not yet published — it should be fixed before the next release.

Existing tests mask the bug: `tests/module/server/createKey.test.ts:20-23` and `tests/module/useGetDocsKey.test.ts:19` use synthetic `db` objects shaped like the client SDK (`databaseId: { database, projectId }`) on both sides, so client/server parity is never exercised with a real Admin instance.

## Suggested fix

In `extractDatabaseIdentity`, when `db.databaseId` is a plain string (Admin SDK), derive the project as well (e.g. the Admin `Firestore` instance's `projectId`, or its settings/app options) and emit the same `"<projectId>/<database>"` form. If the project cannot be determined, the client side must also fall back to the bare database name so both sides stay in agreement.

## Suggested tests

- Real-SDK parity test mirroring `tests/server/databaseIdConsistency.test.ts` for the module path: assert exact key equality between a rendered module hook (real client SDK against the emulator) and `createModuleSwrKey` with a real `firebase-admin` Firestore instance, both with and without explicit `db`.
