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
