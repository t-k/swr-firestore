# SSR key mismatch for Date and Timestamp values in query params

- Date: 2026-06-11
- Severity: major
- Type: bug
- Affected: `src/middleware/serializeMiddleware.ts:10-16`, `src/module/util/scrubKey.ts`, `src/server/util/createKey.ts:23-25`, `src/module/server/util/createKey.ts:7-14`
- Found by: project review (2026-06-11)
- Related: 001, 024

## Problem

Server-side key builders always JSON-round-trip the params (`JSON.parse(JSON.stringify(...))`) before `unstable_serialize`, but the client side does not:

- Legacy client: `serializeMiddleware` round-trips only when `queryConstraints` or `aggregate` is present (`src/middleware/serializeMiddleware.ts:16`). Plain `where`/cursor params go raw into SWR's `stableHash`.
- Module client: `scrubModuleKey` never round-trips (`src/module/util/scrubKey.ts:3-7`), while `createModuleSwrKey` always sanitizes (`src/module/server/util/createKey.ts:7,12-13`).

SWR's `stableHash` serializes a `Date` as its unquoted `toJSON()` value, while a JSON-round-tripped Date becomes a quoted string. Empirically reproduced:

- client: `...where:[["createdAt","<",2024-01-01T00:00:00.000Z]],...`
- server: `...where:[["createdAt","<","2024-01-01T00:00:00.000Z"]],...`

`Timestamp` values mismatch in all variants as well (raw `{seconds, nanoseconds}` hash vs round-tripped JSON shape vs the Admin SDK's own JSON shape).

## Impact

The documented SSR/SSG pattern (README.md, "for SSR/SSG" sections; README.module.md key reuse) silently fails to hydrate for any date-filtered query — a core use case for a library that ships `parseDates`. No test currently uses a Date-valued `where` (existing tests only use string values).

## Suggested fix

Apply the same JSON round-trip on the client for all transformed keys (`sanitize()` inside `scrubModuleKey`; round-trip all cleaned keys in `serializeMiddleware`). This changes existing client key shapes for Date/Timestamp users, so coordinate with the other key-shape fixes (001, 003) in one release. Document that non-JSON-serializable values (e.g. `Timestamp`) should be normalized by the caller if exact SSR matching is required, or normalize them inside the key builder on both sides.

## Suggested tests

- "client and server produce identical keys for where clauses containing Date values" (legacy and module paths).
- "client and server produce identical keys for cursor params (startAt/endAt) containing Date values".
