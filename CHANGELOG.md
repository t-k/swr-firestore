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
