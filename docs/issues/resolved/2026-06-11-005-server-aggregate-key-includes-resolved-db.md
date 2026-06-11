# Legacy server aggregate fetchers inject the resolved `db` into the SWR key

- Date: 2026-06-11
- Severity: major
- Type: bug
- Affected: `src/server/fetcher/getAggregate.ts:22,31`, `src/server/fetcher/getCollectionGroupAggregate.ts`
- Found by: project review (2026-06-11; confirmed independently by two reviewers)
- Related: 004, 024

## Problem

`getAggregate` and `getCollectionGroupAggregate` build their keys from `{ ...params, db, _aggregate: true }` where `db = externalDb ?? getFirestore()` — the resolved Admin instance, not the user's params:

```ts
const db = externalDb ?? getFirestore();          // getAggregate.ts:22
...
key: createSwrKey({ ...params, db, _aggregate: true }),  // getAggregate.ts:31
```

Every sibling fetcher passes user params as-is (`getCollection.ts:20`, `getCollectionCount.ts:18`, `getDoc.ts:17`).

Because the resolved default Admin instance always yields `databaseId:"(default)"`, the server aggregate key always contains a `databaseId` entry. The client `useAggregate` without an explicit `db` produces a key with no `databaseId` at all (`serializeMiddleware` extracts nothing from `undefined`), so the keys never match.

## Impact

`getAggregate` / `getCollectionGroupAggregate` SSR fallback only works when the client also passes `db` explicitly. The documented plain usage never hydrates. `tests/server/getAggregate.test.ts:63` only asserts the key is defined, so the mismatch is untested.

## Suggested fix

Build the key from the original params: `createSwrKey({ ...params, _aggregate: true })`, matching `getCollection`/`getCollectionCount`/`getDoc`.

## Suggested tests

- "client useAggregate key equals server getAggregate key when db is omitted" (and the collection-group variant).
