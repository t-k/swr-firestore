# where clause value types collapse to unknown

- Date: 2026-06-11
- Severity: proposal
- Type: type-safety improvement
- Affected: `src/util/type.ts:64,75`, `src/server/util/type.ts:23,48`
- Found by: project review (2026-06-11)

## Problem

The `where` tuple value is typed as `ValueOf<T> | unknown`, which is just `unknown`:

```ts
where?: [Paths<T> | DocumentId, Parameters<typeof where>[1], ValueOf<T> | unknown][];
```

The `| unknown` was presumably added because `ValueOf<T>` only covers top-level field values while `Paths<T>` allows nested paths (`"author.createdAt"`), plus special values (`Timestamp`, `DocumentReference` for `"id"`, arrays for `in`). The result, however, is that where values get no type checking at all — comparing a number field to a string, or a typo'd enum value, compiles silently. The README presents the params as type-safe, so users likely assume more checking than they get.

## Suggested improvement

Derive the value type from the selected path with a `PathValue<T, P>` mapped type so the tuple becomes `[P, op, PathValue<T, P> | special-cases]` per element (requires making the tuple generic over the path, e.g. via a helper union or a builder). The module entrypoint's typed `where()` builder (`src/module/query.ts`) is the natural place to start since each call site has a concrete path type parameter; the array-of-tuples legacy form is harder and could keep `unknown` with a doc note.

If full inference is judged not worth the complexity, remove the misleading `ValueOf<T> |` part and document that where values are intentionally unchecked.

## Suggested tests

- Type tests (after wiring per issue 007): a number field compared to a string value fails to compile in the module `where()` builder.
