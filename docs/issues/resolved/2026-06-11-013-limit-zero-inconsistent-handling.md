# limit: 0 is silently dropped (legacy) but throws at runtime (module)

- Date: 2026-06-11
- Severity: minor
- Type: bug
- Affected: `src/util/buildQuery.ts:58-59,94-95`, `src/hooks/useCollectionGroup.ts:64-65`, `src/hooks/useCollectionCount.ts`, `src/hooks/useCollectionGroupCount.ts`, `src/server/util/buildQuery.ts` (`if (l)`), `src/module/query.ts:111`
- Found by: project review (2026-06-11)
- Related: 024

## Problem

Truthiness checks treat `limit: 0` (and `limitToLast: 0`) as absent:

```ts
...(l ? [limit(l)] : []),
```

A dynamically computed limit of 0 therefore fetches the entire collection instead of nothing — a silent correctness and cost surprise. The legacy server query builder does the same. The module entrypoint diverges: it materializes `limit(0)`, which the client SDK rejects at runtime, so the same input behaves differently per entrypoint. No test covers `limit: 0` anywhere (`grep -rn "limit: 0" tests/` is empty).

## Suggested fix

Use `l != null` so 0 reaches the SDK, which rejects non-positive limits with a clear error — consistent, loud behavior across all entrypoints. Alternatively validate explicitly and throw a library error. Document the chosen behavior.

## Suggested tests

- "limit zero is rejected consistently across legacy client, legacy server, and module query paths".
