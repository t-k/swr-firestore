# DocumentData.exists is inconsistent: client unbound method vs admin boolean

- Date: 2026-06-11
- Severity: minor
- Type: bug
- Affected: `src/util/getConverter.ts:25`, `src/server/util/getConverter.ts:25`, `src/util/type.ts:113`, `src/server/util/type.ts:78`
- Found by: project review (2026-06-11; confirmed independently by two reviewers)

## Problem

Both converters copy `snapshot.exists` onto the returned data object, but the two SDKs disagree about what that is:

- Client SDK: `exists` is a method. The copy is an unbound prototype method whose implementation reads `this._document`; called on the plain data object, `this._document` is `undefined`, so it always returns `true`. It is accidentally correct today (the converter only runs for existing docs), but it is a booby trap — a user document containing a field named `_document: null` flips it to `false`, and the advertised type-predicate signature is meaningless on a data object.
- Admin SDK: `exists` is a boolean property, so SSR-fallback data carries `exists: true` (boolean).

After client-side revalidation replaces hydrated data, `exists` changes from boolean to function. `data.exists()` works after revalidation but throws "true is not a function" on the hydrated value; `data.exists` as a truthy check works on both but contradicts the published client type (`Pick<QueryDocumentSnapshot, "exists" | ...>`).

## Suggested fix

Normalize both converters to the same shape. Cheapest non-breaking step: client converter assigns `exists: () => true` (bound, honest). Better long-term: make it a boolean on both sides and type it as `boolean` (breaking type change — schedule with the next major alongside the key-shape fixes).

## Suggested tests

- "hydrated server data and revalidated client data expose the same exists shape".
- "a document containing a \_document field does not affect exists".
