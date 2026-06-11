# Legacy server count param types accept isSubscription, producing keys no client hook can match

- Date: 2026-06-11
- Severity: minor
- Type: bug (type-level)
- Affected: `src/server/util/type.ts:27-35,74,76`
- Found by: project review (2026-06-11)

## Problem

Server `BaseParams` includes `isSubscription` (`src/server/util/type.ts:32`), and `KeyParamsForCount` / `KeyParamsForCollectionGroupCount` intersect it without omitting (`:74,76`). `createSwrKey` prefixes `$sub$` when `isSubscription` is true.

But the client count hooks are plain `useSWR` consumers — there is no subscription-based count hook, so a `$sub$`-prefixed count key is never read by anything. `getCollectionCount({ ..., isSubscription: true })` compiles and silently yields a useless fallback key.

The aggregate types already handle this correctly (`Omit<BaseParams<T>, "parseDates" | "isSubscription">` at `:80-86`), and the module server count/aggregate fetchers strip `isSubscription` explicitly (`src/module/server/fetcher/getCollectionCount.ts:15-18`), so this is a known pattern applied inconsistently.

## Suggested fix

`Omit<BaseParams<T>, "isSubscription">` (and `"parseDates"`, see below) on both count param types, mirroring the aggregate types.

Related type nit while in the file: the client-side `KeyParamsForCount` omits `parseDates` from the wrong union member — `Omit<QueryParams<T>, "parseDates">` (`src/util/type.ts:105-109`) is a no-op because `parseDates` lives on `BaseParams`, which is intersected un-omitted. The aggregate types show the correct form (`Omit<BaseParams<T>, "parseDates">`, `src/util/type.ts:167-170`). A stray `parseDates` on a count param enters the key and breaks client/server count key parity.

## Suggested tests

- Type tests: `@ts-expect-error` for `isSubscription` on server count params and for `parseDates` on client count params (wire them into CI first — see issue 007).
