# Legacy entrypoint: collection and collectionGroup queries share identical SWR keys

- Date: 2026-06-11
- Severity: major
- Type: bug
- Affected: `src/hooks/useCollection.ts:15-16`, `src/hooks/useCollectionGroup.ts:32-33`, `src/hooks/useCollectionCount.ts`, `src/hooks/useCollectionGroupCount.ts`, `src/hooks/useAggregate.ts`, `src/hooks/useCollectionGroupAggregate.ts`, `src/util/scrubKey.ts:10`, `src/hooks/useGetDocs.ts`
- Found by: project review (2026-06-11)
- Related: 024

## Problem

The legacy hooks use the raw params object as the SWR key with no discriminator between collection and collection-group queries:

- `useCollection({ path: "comments" })` and `useCollectionGroup({ path: "comments" })` serialize to the same subscription key (`$sub$#path:"comments",`).
- Both count hooks add only `count: true`; both aggregate hooks add only `_aggregate: true` — same collision.
- `useGetDocs` explicitly strips `isCollectionGroup` from its key (`src/util/scrubKey.ts:10`) while its fetcher branches on it, so the two query types share one cache entry there as well.
- The legacy server fetchers mirror the same ambiguity, so SSR keys collide identically.

`swr/subscription` ref-counts per serialized key: the first subscriber's `onSnapshot` wins and the second hook silently renders the first hook's dataset. A collection-group query for `comments` includes all same-named subcollections, so the two result sets are genuinely different data.

The module entrypoint already fixed this by adding `isCollectionGroup` to its keys (`src/module/hooks/useCollection.ts:25`, `src/module/hooks/useCollectionGroup.ts:28`), which confirms the design intent — the legacy entrypoint was left unfixed.

## Impact

Rendering a collection hook and a collection-group hook with the same path (or the count/aggregate/getDocs pairs) in one app silently serves wrong data to one of them. No error is raised.

## Suggested fix

Add a group discriminator to legacy keys, coordinated across client hooks and the legacy server fetchers (key-shape change — breaking for SSR pairing across mixed versions, so schedule for a major release or behind an opt-in). At minimum, document the limitation prominently in README.md.

## Suggested tests

- "legacy useCollection and useCollectionGroup with the same path produce distinct SWR keys" (or, if the limitation is documented instead, a pinning test making the current collision explicit).
