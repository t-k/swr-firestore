# Test coverage gaps: module entrypoint, SSR key parity, lifecycle assertions

- Date: 2026-06-11
- Severity: proposal
- Type: testing
- Affected: `tests/**`
- Found by: project review (2026-06-11)
- Related: 001, 002, 003, 004, 005, 007, 010, 013

## Summary

Legacy entrypoints are well covered (every legacy export has a dedicated emulator-backed test, including all five InTx variants). The gaps cluster in the newer module entrypoint and in cross-boundary parity:

1. [high] Module `useDoc` has zero tests (exported at `src/module/index.ts:3`; no hit in `tests/module/`; coverage 11.1% statements).
2. [high] Module `useCollectionGroupAggregate` and the client fetchers `fetchCollectionCount`, `fetchCollectionGroupCount`, `fetchCollectionGroupAggregate` are untested (coverage 8-20%).
3. [high] Real-SDK SSR key parity is tested only for the bare `{path, db}` shape (`tests/server/databaseIdConsistency.test.ts:21-37`). No parity test covers `where` (string or Date/Timestamp values), `orderBy`, `limit`, `count: true`, `_aggregate: true`, or `isCollectionGroup`. Module parity tests use synthetic db objects on both sides, which is exactly what allowed issue 001 to slip through.
4. [med] No error-path tests for the module entrypoint (legacy hooks each have FirebaseError tests via rules-denied collections; `grep -rn "FirebaseError\|permission" tests/module/` is empty).
5. [med] Module server `getDoc`/`getCollection`/`getCollectionGroup` never run against the real Admin SDK (stub `db` objects only); only count/aggregate hit the emulator.
6. [med] No unsubscribe assertion: every hook test calls `unmount()` but none asserts the listener actually detaches (write-after-unmount, assert no update).
7. [med] Subscription `$sub$` key parity is never asserted against a real rendered hook's cache entry (pattern exists for non-subscription in `tests/module/useGetDocsHook.test.ts:36-64`).
8. [low] No multi-database (named secondary DB) integration test; multi-db is covered only by fake-object unit tests.
9. [low] `src/subscription.ts` and `src/aggregate.ts` barrels are never imported by any test, so a re-export regression there is uncaught (the module fetcher barrel has exactly such a guard: `tests/module/fetcherBarrel.test.ts`).

Items tied to specific bugs (Date-valued keys, `limit: 0`, parseDates missing-field, legacy group-key collision) are listed as suggested tests in their respective issues.

## Suggested scenarios (English names, emulator-backed, no mocks)

- "module useDoc subscribes to a document and receives realtime updates"
- "module aggregate client fetchers return counts and sums from the emulator"
- "client and server produce identical SWR keys for where/orderBy/limit/count/aggregate params using real client and admin SDKs"
- "module useCollection surfaces FirestoreError on permission denied"
- "module server getCollection retrieves filtered docs with a real admin Firestore"
- "useDoc stops receiving snapshot updates after unmount"
- "rendered useCollection subscription cache key equals server getCollection isSubscription key"
- "client and admin keys stay consistent for a named secondary database"
- "legacy subscription and aggregate entrypoints re-export the expected symbols"
