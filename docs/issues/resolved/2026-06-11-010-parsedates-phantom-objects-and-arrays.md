# parseDates materializes phantom nested objects and clobbers non-object intermediates

- Date: 2026-06-11
- Severity: minor
- Type: bug
- Affected: `src/util/getConverter.ts:5-15`, `src/server/util/getConverter.ts:5-15`, `src/util/path.ts:14-21`
- Found by: project review (2026-06-11; confirmed independently by two reviewers)
- Related: 006, 024

## Problem

`formatTimestamp` calls `setByPath` unconditionally, even when `getByPath` returned `undefined` (field absent). `setByPath` creates `{}` for missing intermediates and replaces non-object intermediates (`src/util/path.ts:15-16`). Consequences for `parseDates: ["a.b"]`:

- A document without `a` comes back as `{ a: { b: undefined } }` — a phantom object appears in the data.
- A document with `a: 5` comes back with `a` silently replaced by `{ b: undefined }` — user data is destroyed in the returned object.
- Date fields inside arrays (`items[].date`) are not supported and the limitation is undocumented; the array path would be treated as a plain property path.

Shape-dependent app logic (`"a" in data`, serialization snapshots, deep-equality memoization) silently misbehaves. Both the client and server converters share the logic, so SSR payload shapes are affected too.

## Suggested fix

In `formatTimestamp`, skip `setByPath` when the source value is `undefined`; in `setByPath`, do not overwrite non-object intermediates (return unchanged or throw). Document that array element paths are unsupported in `parseDates` (or implement array traversal).

## Suggested tests

- "parseDates leaves documents without the target field unchanged" (converter + hook level; currently all 23 parseDates usages in tests target fields that exist).
- "parseDates does not overwrite primitive intermediate fields".
- "parseDates on array element paths is rejected or documented behavior".
