## [3.1.0] - 2026-04-14

### Features

- Add server-only `filter` DSL for the `@tatsuokaniwa/swr-firestore/server` module to support `OR` / `AND` queries across collection and collectionGroup APIs, including aggregate and transaction-aware fetchers.
- Support `field: "id"` inside server collection filters by converting it to `documentId()`.

### Documentation

- Document server-side `filter` usage in `README.md`, including SSR/SSG and transaction examples.

## [3.0.0] - 2026-04-05

### Breaking Changes

- Remove `lodash`/`lodash-es` from dependencies. Internal implementation replaced with custom `getByPath`/`setByPath` helpers. If your project relied on lodash being transitively available through this package, you will need to install it separately.
- Remove legacy `main`, `module`, `types`, and `typesVersions` fields from `package.json`. Only `exports` field is used. Bundlers or TypeScript versions that do not support `exports` (TypeScript < 4.7, Node.js < 12.11) are no longer supported.

### Features

- Add `./subscription` subpath export for real-time subscription hooks only (`useCollection`, `useCollectionGroup`, `useDoc`). Avoids pulling in `swr/subscription` when not needed.
- Add `./aggregate` subpath export for aggregation hooks and fetchers only (`useAggregate`, `useCollectionCount`, `useCollectionGroupAggregate`, `useCollectionGroupCount`, `fetchAggregate`, `fetchCollectionCount`, `fetchCollectionGroupAggregate`, `fetchCollectionGroupCount`).
- Add `sideEffects: false` to `package.json` for reliable tree-shaking in consumer bundlers.
- Add type-safe `extractDatabaseId` utility function.

### Changed

- Migrate from npm to pnpm.
- Upgrade Vite 7 to Vite 8 (migrate to Rolldown-based bundler).
- Upgrade TypeScript 5 to TypeScript 6.
- Replace `vite-tsconfig-paths` plugin with Vite 8 native `resolve.tsconfigPaths`.
- Replace `@rollup/plugin-typescript` with `tsc --emitDeclarationOnly`.
- Move `types` condition first in `package.json` exports (per TypeScript recommendation).
- Convert barrel files (`src/index.ts`, `src/fetcher/index.ts`) to direct re-exports for stable tree-shaking.
- Add lint (`oxlint`) and format (`oxfmt`) scripts and CI job.

### Refactoring

- Remove `any` from `path.ts`, use `unknown` + type guards.
- Unify `scrubKey` and `extractDatabaseId`, remove key generation duplication.
- Deduplicate server query building with shared `buildQuery.ts` across all 8 fetchers.
- Deduplicate client query building in `useCollection` and `useGetDocs`.

### Performance

- ~60x faster bundling with Vite 8 (Rolldown): ~1.48s -> ~25ms.
- Client entry `dist/index.js` reduced from 18.5 KB to 5.89 KB (gzip: 1.43 KB) via code splitting and subpath exports.

### Fixed

- Resolve all oxlint warnings (57 -> 0).

## [2.1.0] - 2026-02-11

### Feature

- Add optional `db` parameter to all functions and hooks for custom Firestore instance injection
  - Client-side: accepts `Firestore` from `firebase/firestore`
  - Server-side: accepts `Firestore` from `firebase-admin/firestore`
  - When omitted, falls back to `getFirestore()` (no breaking change)

## [2.0.8] - 2025-12-23

### Feature

- Add `useAggregate` hook for aggregation queries (count, sum, average) on collections
- Add `useCollectionGroupAggregate` hook for aggregation queries on collection groups
- Add `getAggregate` server fetcher for SSR/SSG support
- Add `getCollectionGroupAggregate` server fetcher for SSR/SSG support
- Add `getDocInTx` for type-safe document fetching within Firestore transactions (server-side)
- Add `getCollectionInTx` for type-safe collection fetching within Firestore transactions (server-side)
- Add `getCollectionCountInTx` for type-safe collection count within transactions (server-side)
- Add `getCollectionGroupInTx` for type-safe collection group fetching within transactions (server-side)
- Add `getCollectionGroupCountInTx` for type-safe collection group count within transactions (server-side)
- Add `fetchDocInTx` for type-safe document fetching within Firestore transactions (client-side)
- Add client-side fetchers (without SWR): `fetchDoc`, `fetchCollection`, `fetchCollectionCount`, `fetchCollectionGroup`, `fetchCollectionGroupCount`, `fetchAggregate`, `fetchCollectionGroupAggregate`
- All hooks now accept `false` and `undefined` in addition to `null` for conditional fetching (e.g., `isLogin && { path: "posts" }`)

## [2.0.7] - 2024-04-21

- Update dependencies to `firebase-admin` >= 11.0.0

## [2.0.6] - 2023-07-28

- Fix handling null params on `useCollectionCount`, `useCollectionGroupCount`.

## [2.0.5] - 2023-07-07

- Updated firebase peerDependencies to >=9.11.0 to enable the use of 10.x

## [2.0.4] - 2023-06-18

### Fixed

- Fixed an issue `id` in `where` and `orderBy` was not converted to `documentId`. This issue was introduced in version 2.0.3 and caused the feature to not work as intended.

## [2.0.3] - 2023-06-18

- Modify type `QueryParams` to allow `id` in `where`, `orderBy`.

## [2.0.2] - 2023-05-16

- Add `limitToLast` params.

## [2.0.1] - 2023-04-13

- Fix peerDependencies for firebase-admin.

## [2.0.0] - 2023-04-13

### Breaking change

- Add count property to SWR key for counting functions.
  This means that the SWR key has changed for the `useCollectionCount` and `useCollectionGroupCount` functions.

### Feature

- Add support CollectionGroup on `useGetDocs`. Add `isCollectionGroup` parameter.
- Add server module. This may be useful for SSG and SSR. You can import from `@tatsuokaniwa/swr-firestore/server`.

```tsx
import { useCollection, useGetDocs } from "@tatsuokaniwa/swr-firestore"
import { getCollection } from "@tatsuokaniwa/swr-firestore/server"

export async function getStaticProps() {
  const params = {
    path: "posts",
    where: [["status", "==", "published"]],
  }
  const { key, data } = await getCollection<Post>({
    ...params,
    isSubscription: true, // Add the prefix `$sub$` to the SWR key
  })
  const { key: useGetDocsKey, data: useGetDocsData } = await getCollection<Post>(params)
  return {
    props: {
      fallback: {
        [key]: data,
        [useGetDocsKey]: useGetDocsData,
      }
    }
  }
}

export default function Page({ fallback }) {
  const { data } = useCollection<Post>({
    path: "posts",
    where: [["status", "==", "published"]],
  })
  const { data: useGetDocsData } = useGetDocs<Post>({
    path: "posts",
    where: [["status", "==", "published"]],
  })
  return (
    <SWRConfig value={{ fallback }}>
      {data?.map((x, i) => <div key={i}>{x.content}}</div>)}
    </SWRConfig>
  )
}

```

## [1.2.0] - 2023-04-10

- Update `useCollection`, `useCollectionCount`, `useCollectionGroup`, `useCollectionGroupCount`, and `useGetDocs` hooks to include query cursor parameters: `startAt`, `startAfter`, `endAt`, and `endBefore`
- Add `orderBy` parameter to `useCollectionCount` and `useCollectionGroupCount` hooks to support query cursor
- Remove duplicate code for SWR key tweaking

## [1.1.2] - 2023-04-01

Same code as the previous version `1.1.1`.
We had to release this version because the README.md file was not included when the package was published on npmjs.com.

## [1.1.1] - 2023-04-01

- Add Middleware to adjust the key for SWR
- Add `swrOptions` parameter to the Subscription.

## [1.1.0] - 2023-03-30

- Allow raw QueryConstraints
- Modify Error Type to `FirestoreError`
- Modify tests

## [1.0.1] - 2023-03-27

- Fix `where` param's type

## [1.0.0] - 2023-03-27

- Replace lodash dependency to lodash-es
- Refactored type to support nested objects
- Upgraded firebase dependency from `^9.17.1` to `^9.11.0 < 10.0.0` to enable availability of the `getCountFromServer` function
- Minor code refactoring, formatting

## [0.2.2] - 2023-03-26

- Modify vite.config.ts to set SWR as an external dependency

## [0.2.1] - 2023-03-25

- Add `useGetDocs` function
- Add `useGetDoc` function

## [0.1.0] - 2023-03-21

- Initial release
